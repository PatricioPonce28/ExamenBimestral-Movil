// src/app/pages/usuario/usuario.page.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { PlanesService } from '../../services/planes';
import { ContratacionesService } from '../../services/contrataciones';
import { PlanMovil, Contratacion } from 'src/app/models/interfaces';
import { AlertController, LoadingController } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import { ImageViewerComponent } from '../../components/image-viewer/image-viewer.component';

@Component({
  selector: 'app-usuario',
  templateUrl: './usuario.page.html',
  styleUrls: ['./usuario.page.scss'],
  standalone: false
})
export class UsuarioPage implements OnInit {
  planes: PlanMovil[] = [];
  planesOriginales: PlanMovil[] = [];
  planesFiltrados: PlanMovil[] = [];
  cargando = true;
  usuarioNombre = '';
  usuarioEmail = '';

  busqueda = '';
  filtroOrden: 'precio-asc' | 'precio-desc' | 'nombre' | 'destacado' = 'destacado';
  filtroVelocidad: 'todos' | '4G' | '5G' = 'todos';

  constructor(
    private router: Router,
    private authService: AuthService,
    private planesService: PlanesService,
    private contratacionesService: ContratacionesService,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private modalController: ModalController
  ) {}

  ngOnInit() {
    this.obtenerDatosUsuario();
  }

  ionViewWillEnter() {
    this.cargarPlanes();
  }

  obtenerDatosUsuario() {
    const userData = this.authService.getUserData();
    this.usuarioNombre = userData.displayName || 'Usuario';
    this.usuarioEmail = userData.email || '';
  }

  async cargarPlanes() {
    this.cargando = true;
    this.planes = await this.planesService.obtenerPlanesActivos();
    this.planesOriginales = [...this.planes];
    this.aplicarFiltros();
    this.cargando = false;
  }

  aplicarFiltros() {
    let resultado = [...this.planesOriginales];

    if (this.busqueda.trim()) {
      const term = this.busqueda.toLowerCase();
      resultado = resultado.filter(p =>
        p.nombre.toLowerCase().includes(term) ||
        p.descripcion.toLowerCase().includes(term) ||
        p.datos.toLowerCase().includes(term)
      );
    }

    if (this.filtroVelocidad !== 'todos') {
      resultado = resultado.filter(p => p.velocidad?.includes(this.filtroVelocidad));
    }

    switch (this.filtroOrden) {
      case 'precio-asc': resultado.sort((a, b) => a.precio - b.precio); break;
      case 'precio-desc': resultado.sort((a, b) => b.precio - a.precio); break;
      case 'nombre': resultado.sort((a, b) => a.nombre.localeCompare(b.nombre)); break;
      case 'destacado':
        resultado.sort((a, b) => (b.destacado ? 1 : 0) - (a.destacado ? 1 : 0) || b.precio - a.precio);
        break;
    }

    this.planesFiltrados = resultado;
  }

  limpiarBusqueda() {
    this.busqueda = '';
    this.aplicarFiltros();
  }

  // NAVEGACIÓN
  irAHistorial() {
    this.router.navigate(['/usuario/historial']);
  }

  irAChat() {
    this.router.navigate(['/usuario/usuario-chat']);
  }

  async verImagenGrande(plan: PlanMovil, event: Event) {
  event.stopPropagation(); // Evita que se abra el detalle al tocar la imagen

  if (!plan.imagenUrl) {
    this.mostrarAlerta('Sin imagen', 'Este plan no tiene imagen promocional');
    return;
  }

  const modal = await this.modalController.create({
    component: ImageViewerComponent,
    componentProps: {
      imageUrl: plan.imagenUrl,
      title: plan.nombre,
      subtitle: `$${plan.precio.toFixed(2)}/mes`
    },
    cssClass: 'fullscreen-modal'
  });

  await modal.present();
}


  // ============================================
  // VER DETALLE Y CONTRATAR PLAN
  // ============================================

  async verDetallePlan(plan: PlanMovil) {
    const alert = await this.alertController.create({
      header: plan.nombre,
      subHeader: `$${plan.precio.toFixed(2)} USD/mes`,
      cssClass: 'detalle-plan-alert',
      message: `
        <div style="text-align: left; padding: 10px;">
          <p style="margin-bottom: 15px;"><strong>Descripción:</strong><br>${plan.descripcion}</p>
          <hr style="margin: 15px 0;">
          <div style="display: grid; gap: 10px;">
            <p><strong>📊 Datos:</strong> ${plan.datos}</p>
            <p><strong>📞 Minutos:</strong> ${plan.minutos}</p>
            <p><strong>💬 SMS:</strong> ${plan.sms}</p>
            <p><strong>⚡ Velocidad:</strong> ${plan.velocidad || 'No especificado'}</p>
          </div>
        </div>
      `,
      buttons: [
        {
          text: 'Cerrar',
          role: 'cancel'
        },
        {
          text: 'Contratar Plan',
          cssClass: 'btn-contratar',
          handler: () => {
            this.contratarPlan(plan);
          }
        }
      ]
    });

    await alert.present();
  }

  async contratarPlan(plan: PlanMovil) {
    const alert = await this.alertController.create({
      header: 'Contratar Plan',
      subHeader: `${plan.nombre} - $${plan.precio.toFixed(2)}/mes`,
      inputs: [
        {
          name: 'telefono',
          type: 'tel',
          placeholder: 'Teléfono de contacto *',
          attributes: {
            maxlength: 15,
            required: true
          }
        },
        {
          name: 'direccion',
          type: 'textarea',
          placeholder: 'Dirección de instalación *',
          attributes: {
            maxlength: 200,
            required: true,
            rows: 3
          }
        },
        {
          name: 'notas',
          type: 'textarea',
          placeholder: 'Notas adicionales (opcional)',
          attributes: {
            maxlength: 300,
            rows: 2
          }
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Enviar Solicitud',
          handler: async (data) => {
            if (!data.telefono || !data.direccion) {
              this.mostrarAlerta('Error', 'Teléfono y dirección son obligatorios');
              return false;
            }
            
            if (data.telefono.trim().length < 7) {
              this.mostrarAlerta('Error', 'Ingresa un teléfono válido');
              return false;
            }

            await this.procesarContratacion(plan, data);
            return true;
          }
        }
      ]
    });

    await alert.present();
  }

async procesarContratacion(plan: PlanMovil, datosContratacion: any) {
    const loading = await this.loadingController.create({
      message: 'Procesando solicitud...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      const currentUser = this.authService.getCurrentUser();
      
      const nuevaContratacion: Partial<Contratacion> = {
        planId: plan.id!,
        planNombre: plan.nombre,
        planPrecio: plan.precio,
        usuarioId: currentUser?.uid,
        usuarioNombre: this.usuarioNombre,
        usuarioEmail: this.usuarioEmail,
        telefono: datosContratacion.telefono.trim(),
        direccion: datosContratacion.direccion.trim(),
        notas: datosContratacion.notas?.trim() || '',
        estado: 'Contratado'
      };
      
      const result = await this.contratacionesService.crearContratacion(nuevaContratacion);
      
      await loading.dismiss();
      
      if (result.success) {
        const successAlert = await this.alertController.create({
          header: '¡Solicitud Enviada!',
          message: `Tu solicitud para el plan <strong>${plan.nombre}</strong> ha sido enviada exitosamente. Un asesor se pondrá en contacto contigo pronto.`,
          buttons: [
            {
              text: 'Ver Mi Historial',
              handler: () => {
                this.router.navigate(['/usuario/historial']);
              }
            },
            {
              text: 'OK',
              role: 'cancel'
            }
          ]
        });
        await successAlert.present();
      } else {
        this.mostrarAlerta('Error', result.error || 'No se pudo procesar la solicitud');
      }
      
    } catch (error: any) {
      await loading.dismiss();
      this.mostrarAlerta('Error', error.message || 'No se pudo procesar la solicitud. Intenta nuevamente.');
    }
  }

  // ============================================
  // NAVEGACIÓN
  // ============================================

  async logout() {
    const alert = await this.alertController.create({
      header: 'Cerrar Sesión',
      message: '¿Estás seguro que deseas cerrar sesión?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Cerrar Sesión',
          handler: async () => {
            const loading = await this.loadingController.create({
              message: 'Cerrando sesión...',
              spinner: 'crescent'
            });
            await loading.present();
            
            await this.authService.logout();
            
            await loading.dismiss();
          }
        }
      ]
    });

    await alert.present();
  }

  // ============================================
  // UTILIDADES
  // ============================================

  async mostrarAlerta(titulo: string, mensaje: string) {
    const alert = await this.alertController.create({
      header: titulo,
      message: mensaje,
      buttons: ['OK']
    });
    await alert.present();
  }

  async refrescar(event: any) {
    await this.cargarPlanes();
    event.target.complete();
  }

  getPlanImageUrl(plan: PlanMovil): string {
    return plan.imagenUrl || 'assets/images/plan-default.jpg';
  }

  getTotalPlanes(): number {
    return this.planesFiltrados.length;
  }


}