import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth';
import { ContratacionesService } from 'src/app/services/contrataciones';
import { Contratacion } from 'src/app/models/interfaces';
import { AlertController, ActionSheetController, LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-historial',
  templateUrl: './historial.page.html',
  styleUrls: ['./historial.page.scss'],
  standalone: false
})
export class HistorialPage implements OnInit {
  contrataciones: Contratacion[] = [];
  contratacionesOriginales: Contratacion[] = [];
  contratacionesFiltradas: Contratacion[] = [];
  cargando: boolean = true;
  usuarioNombre: string = '';
  usuarioId: string = '';
  
  // Filtros simplificados (solo 2 estados)
  filtroEstado: 'todos' | 'Pendiente' | 'Contratado' = 'todos';
  busqueda: string = '';

  constructor(
    private authService: AuthService,
    private contratacionesService: ContratacionesService,
    private router: Router,
    private alertController: AlertController,
    private actionSheetController: ActionSheetController,
    private loadingController: LoadingController
  ) {}

  ngOnInit() {
    this.obtenerDatosUsuario();
    this.cargarContrataciones();
  }

  ionViewWillEnter() {
    this.cargarContrataciones();
  }

  obtenerDatosUsuario() {
    const userData = this.authService.getUserData();
    const currentUser = this.authService.getCurrentUser();
    this.usuarioNombre = userData.displayName || 'Usuario';
    this.usuarioId = currentUser?.uid || '';
  }

  async cargarContrataciones() {
    this.cargando = true;
    
    try {
      this.contrataciones = await this.contratacionesService.obtenerContratacionesPorUsuario(this.usuarioId);
      this.contratacionesOriginales = [...this.contrataciones];
      this.aplicarFiltros();
      
      console.log('Contrataciones cargadas:', this.contrataciones);
      
    } catch (error) {
      console.error('Error al cargar contrataciones:', error);
      this.mostrarAlerta('Error', 'No se pudieron cargar las contrataciones');
    }
    
    this.cargando = false;
  }

  // ============================================
  // FILTROS Y BÚSQUEDA
  // ============================================

  aplicarFiltros() {
    let resultado = [...this.contratacionesOriginales];

    // Filtro por búsqueda
    if (this.busqueda.trim() !== '') {
      const busquedaLower = this.busqueda.toLowerCase();
      resultado = resultado.filter(contratacion =>
        contratacion.planNombre?.toLowerCase().includes(busquedaLower) ||
        contratacion.estado.toLowerCase().includes(busquedaLower) ||
        contratacion.asesorAsignadoNombre?.toLowerCase().includes(busquedaLower)
      );
    }

    // Filtro por estado
    if (this.filtroEstado !== 'todos') {
      resultado = resultado.filter(c => c.estado === this.filtroEstado);
    }

    // Ordenar por fecha más reciente
    resultado.sort((a, b) => {
      const fechaA = this.convertirAFecha(a.createdAt);
      const fechaB = this.convertirAFecha(b.createdAt);
      return fechaB.getTime() - fechaA.getTime();
    });

    this.contratacionesFiltradas = resultado;
  }

  convertirAFecha(fecha: any): Date {
    if (fecha instanceof Date) {
      return fecha;
    }
    if (fecha && typeof fecha.toDate === 'function') {
      return fecha.toDate();
    }
    if (fecha && fecha.seconds) {
      return new Date(fecha.seconds * 1000);
    }
    return new Date(fecha);
  }

  cambiarFiltroEstado(estado: typeof this.filtroEstado) {
    this.filtroEstado = estado;
    this.aplicarFiltros();
  }

  limpiarBusqueda() {
    this.busqueda = '';
    this.aplicarFiltros();
  }

  // ============================================
  // VER DETALLE Y ACCIONES
  // ============================================

  async verDetalleContratacion(contratacion: Contratacion) {
    const alert = await this.alertController.create({
      header: 'Detalle de Contratación',
      subHeader: contratacion.planNombre,
      cssClass: 'detalle-contratacion-alert',
      message: `
        <div style="text-align: left; padding: 10px; font-size: 14px; line-height: 1.6;">
          <p style="margin: 8px 0;">
            <strong>📋 Estado:</strong> 
            <span style="color: ${this.getColorTextoEstado(contratacion.estado)}; font-weight: 600;">
              ${contratacion.estado}
            </span>
          </p>
          <p style="margin: 8px 0;">
            <strong>💰 Precio:</strong> $${contratacion.planPrecio?.toFixed(2)}/mes
          </p>
          <hr style="margin: 15px 0; border: none; border-top: 1px solid #e0e0e0;">
          
          <p style="margin: 8px 0;"><strong>📞 Teléfono:</strong> ${contratacion.telefono || 'No especificado'}</p>
          <p style="margin: 8px 0;"><strong>📍 Dirección:</strong> ${contratacion.direccion || 'No especificada'}</p>
          
          ${contratacion.notas ? `<p style="margin: 8px 0;"><strong>📝 Notas:</strong> ${contratacion.notas}</p>` : ''}
          
          <hr style="margin: 15px 0; border: none; border-top: 1px solid #e0e0e0;">
          
          ${contratacion.asesorAsignadoNombre 
            ? `<p style="margin: 8px 0;"><strong>👤 Asesor:</strong> ${contratacion.asesorAsignadoNombre}</p>` 
            : '<p style="margin: 8px 0; color: #999;"><em>Sin asesor asignado aún</em></p>'}
          
          <p style="margin: 8px 0;"><strong>📅 Fecha:</strong> ${this.formatearFecha(contratacion.createdAt)}</p>
        </div>
      `,
      buttons: ['Cerrar']
    });

    await alert.present();
  }

  async mostrarOpcionesContratacion(contratacion: Contratacion) {
    const buttons: any[] = [
      {
        text: 'Ver Detalle Completo',
        icon: 'information-circle-outline',
        handler: () => {
          this.verDetalleContratacion(contratacion);
        }
      }
    ];

    // Solo permitir cancelar si está Pendiente
    if (contratacion.estado === 'Cancelada') {
      buttons.push({
        text: 'Cancelar Solicitud',
        icon: 'close-circle-outline',
        role: 'destructive',
        handler: () => {
          this.cancelarContratacion(contratacion);
        }
      });
    }

    // Si tiene asesor asignado, permitir contactar
    if (contratacion.asesorAsignadoId) {
      buttons.push({
        text: 'Contactar Asesor',
        icon: 'chatbubbles-outline',
        handler: () => {
          this.contactarAsesor(contratacion);
        }
      });
    }

    // Si está contratado, mostrar mensaje de éxito
    if (contratacion.estado === 'Contratado') {
      buttons.push({
        text: 'Compartir',
        icon: 'share-social-outline',
        handler: () => {
          this.compartirContratacion(contratacion);
        }
      });
    }

    buttons.push({
      text: 'Cerrar',
      icon: 'close',
      role: 'cancel'
    });

    const actionSheet = await this.actionSheetController.create({
      header: contratacion.planNombre,
      subHeader: `Estado: ${contratacion.estado}`,
      buttons: buttons
    });

    await actionSheet.present();
  }

  async cancelarContratacion(contratacion: Contratacion) {
    const alert = await this.alertController.create({
      header: '¿Cancelar Solicitud?',
      message: `¿Estás seguro que deseas cancelar la solicitud del plan "${contratacion.planNombre}"? Esta acción no se puede deshacer.`,
      buttons: [
        {
          text: 'No',
          role: 'cancel'
        },
        {
          text: 'Sí, Cancelar',
          role: 'destructive',
          handler: async () => {
            const loading = await this.loadingController.create({
              message: 'Cancelando solicitud...',
              spinner: 'crescent'
            });
            await loading.present();

            try {
              const result = await this.contratacionesService.cancelarContratacion(contratacion.id!);
              
              await loading.dismiss();
              
              if (result.success) {
                this.mostrarAlerta('¡Cancelado!', 'Tu solicitud ha sido cancelada exitosamente');
                this.cargarContrataciones();
              } else {
                this.mostrarAlerta('Error', result.error || 'No se pudo cancelar la solicitud');
              }
              
            } catch (error: any) {
              await loading.dismiss();
              this.mostrarAlerta('Error', error.message || 'No se pudo cancelar la solicitud');
            }
          }
        }
      ]
    });

    await alert.present();
  }

  contactarAsesor(contratacion: Contratacion) {
    this.router.navigate(['/chat'], {
      queryParams: {
        asesorId: contratacion.asesorAsignadoId,
        asesorNombre: contratacion.asesorAsignadoNombre,
        contratacionId: contratacion.id
      }
    });
  }

  async compartirContratacion(contratacion: Contratacion) {
    const mensaje = `¡He contratado el plan ${contratacion.planNombre} por $${contratacion.planPrecio}/mes! 📱✨`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Mi nuevo plan móvil',
          text: mensaje
        });
      } catch (error) {
        console.log('Error al compartir:', error);
      }
    } else {
      this.mostrarAlerta('Compartir', mensaje);
    }
  }

  // ============================================
  // UTILIDADES
  // ============================================

  getColorTextoEstado(estado: string): string {
    const colores: { [key: string]: string } = {
      'Pendiente': '#f39c12',    // naranja/amarillo
      'Contratado': '#27ae60'    // verde
    };
    return colores[estado] || '#666';
  }

  getEstadoColor(estado: string): string {
    const colores: any = {
      'Pendiente': 'warning',
      'Contratado': 'success'
    };
    return colores[estado] || 'medium';
  }

  getEstadoIcon(estado: string): string {
    const iconos: any = {
      'Pendiente': 'time-outline',
      'Contratado': 'checkmark-circle-outline'
    };
    return iconos[estado] || 'help-outline';
  }

  formatearFecha(fecha: any): string {
    if (!fecha) return 'N/A';
    
    const date = this.convertirAFecha(fecha);
    return date.toLocaleDateString('es-EC', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getTotalContrataciones(): number {
    return this.contratacionesFiltradas.length;
  }

  getContratacionesPendientes(): number {
    return this.contratacionesOriginales.filter(c => c.estado === 'Cancelada').length;
  }

  getContratacionesActivas(): number {
    return this.contratacionesOriginales.filter(c => c.estado === 'Contratado').length;
  }

  async mostrarAlerta(titulo: string, mensaje: string) {
    const alert = await this.alertController.create({
      header: titulo,
      message: mensaje,
      buttons: ['OK']
    });
    await alert.present();
  }

  async refrescar(event: any) {
    await this.cargarContrataciones();
    event.target.complete();
  }

  volverACatalogo() {
    this.router.navigate(['/usuario']);
  }
}