// src/app/pages/asesor/asesor.page.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { PlanesService } from '../../services/planes';
import { PlanMovil } from 'src/app/models/interfaces';
import { AlertController, LoadingController, ActionSheetController } from '@ionic/angular';
import { ChatRTDBService } from 'src/app/services/chat-rtdb';
import { CloudinaryService } from 'src/app/services/cloudinary';
import { ContratacionesService } from 'src/app/services/contrataciones';
import { Contratacion } from 'src/app/models/interfaces';

@Component({
  selector: 'app-asesor',
  templateUrl: './asesor.page.html',
  styleUrls: ['./asesor.page.scss'],
  standalone: false
})
export class AsesorPage implements OnInit {
  planes: PlanMovil[] = [];
  planesOriginales: PlanMovil[] = [];
  usuarioNombre: string = '';
  cargando: boolean = true;
  imagenSeleccionada: File | null = null;
  contrataciones: Contratacion[] = [];
  cargandoContrataciones: boolean = false;

  // Filtros
  busqueda: string = '';
  filtroActivo: 'todos' | 'activos' | 'inactivos' = 'todos';

  // CHAT RTDB
  chatsActivos: any[] = [];
  private unsubscribeChats: any = null;
  vistaActual: 'planes' | 'chats' | 'contrataciones' = 'planes';

  constructor(
    private authService: AuthService,
    private planesService: PlanesService,
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private actionSheetController: ActionSheetController,
    private chatRTDB: ChatRTDBService,
    private cloudinaryService: CloudinaryService,
    private contratacionesService: ContratacionesService
  ) {}

  ngOnInit() {
    this.obtenerDatosUsuario();
  }

  ionViewWillEnter() {
    this.cargarPlanes();
    this.iniciarEscuchaChats();
  }

  ionViewWillLeave() {
    if (this.unsubscribeChats) {
      this.unsubscribeChats();
      this.unsubscribeChats = null;
    }
  }

  obtenerDatosUsuario() {
    const userData = this.authService.getUserData();
    this.usuarioNombre = userData.displayName || 'Asesor';
  }

  async cargarPlanes() {
    this.cargando = true;
    this.planes = await this.planesService.obtenerPlanes();
    this.planesOriginales = [...this.planes];
    this.filtrarPlanes();
    this.cargando = false;
  }

  // ==================== CHAT RTDB ====================
  iniciarEscuchaChats() {
    this.unsubscribeChats = this.chatRTDB.escucharTodosLosChats((chats) => {
      this.chatsActivos = chats;
    });
  }

  abrirChat(chat: any) {
    this.router.navigate(['/asesor/chat'], {
      queryParams: {
        chatId: chat.chatId,
        usuarioNombre: chat.usuarioNombre || 'Usuario'
      }
    });
  }

  // ==================== FILTROS ====================
  filtrarPlanes() {
    let filtrados = [...this.planesOriginales];

    if (this.busqueda.trim()) {
      const term = this.busqueda.toLowerCase();
      filtrados = filtrados.filter(p =>
        p.nombre.toLowerCase().includes(term) ||
        p.descripcion.toLowerCase().includes(term)
      );
    }

    if (this.filtroActivo === 'activos') filtrados = filtrados.filter(p => p.activo);
    if (this.filtroActivo === 'inactivos') filtrados = filtrados.filter(p => !p.activo);

    this.planes = filtrados;
  }

  limpiarBusqueda() {
    this.busqueda = '';
    this.filtrarPlanes();
  }

  cambiarFiltro(filtro: 'todos' | 'activos' | 'inactivos') {
    this.filtroActivo = filtro;
    this.filtrarPlanes();
  }

  // ==================== SELECCIÓN DE IMAGEN ====================
  async seleccionarImagen() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg,image/jpg,image/png,image/webp';
    
    input.onchange = async (event: any) => {
      const file = event.target.files[0];
      if (file) {
        // Validar tamaño
        if (file.size > 5 * 1024 * 1024) {
          this.mostrarAlerta('Error', 'La imagen no debe superar los 5MB');
          return;
        }
        
        this.imagenSeleccionada = file;
        this.mostrarAlerta('✓', `Imagen "${file.name}" seleccionada. Ahora completa el formulario.`);
      }
    };
    
    input.click();
  }

  // ============================================
  // CRUD DE PLANES
  // ============================================

  async crearPlan() {
    // Primero solicitar la imagen
    const alertImagen = await this.alertController.create({
      header: 'Imagen del Plan',
      message: '¿Deseas agregar una imagen al plan?',
      buttons: [
        {
          text: 'Sin Imagen',
          handler: () => {
            this.imagenSeleccionada = null;
            this.mostrarFormularioCrearPlan();
          }
        },
        {
          text: 'Seleccionar Imagen',
          handler: () => {
            this.seleccionarImagen();
            setTimeout(() => this.mostrarFormularioCrearPlan(), 1000);
          }
        }
      ]
    });
    
    await alertImagen.present();
  }

  async mostrarFormularioCrearPlan() {
    const alert = await this.alertController.create({
      header: 'Nuevo Plan Móvil',
      cssClass: 'alert-wide',
      inputs: [
        // INFORMACIÓN BÁSICA
        {
          type: 'text',
          name: 'nombre',
          placeholder: '* Nombre del Plan (ej: Plan Smart 5GB)',
          attributes: { maxlength: 50, required: true }
        },
        {
          type: 'text',
          name: 'nombreComercial',
          placeholder: 'Nombre Comercial (opcional)',
          attributes: { maxlength: 100 }
        },
        {
          type: 'number',
          name: 'precio',
          placeholder: '* Precio (USD)',
          attributes: { step: '0.01', min: '0', required: true }
        },
        {
          type: 'textarea',
          name: 'descripcion',
          placeholder: '* Descripción breve',
          attributes: { maxlength: 200, required: true }
        },
        
        // SEGMENTO Y PÚBLICO
        {
          type: 'text',
          name: 'segmento',
          placeholder: 'Segmento (Básico/Intermedio/Premium)',
          value: 'Básico'
        },
        {
          type: 'text',
          name: 'publicoObjetivo',
          placeholder: 'Público Objetivo (ej: Estudiantes, Empresas)',
          attributes: { maxlength: 100 }
        },
        
        // CARACTERÍSTICAS TÉCNICAS
        {
          type: 'text',
          name: 'datos',
          placeholder: '* Datos (ej: 5GB, 10GB, Ilimitado)',
          attributes: { maxlength: 30, required: true }
        },
        {
          type: 'text',
          name: 'minutos',
          placeholder: '* Minutos (ej: 100 min, Ilimitado)',
          attributes: { maxlength: 30, required: true }
        },
        {
          type: 'text',
          name: 'sms',
          placeholder: '* SMS (ej: 100 SMS, Ilimitados)',
          attributes: { maxlength: 30, required: true }
        },
        {
          type: 'text',
          name: 'velocidad',
          placeholder: 'Velocidad (ej: 4G, 5G)',
          value: '4G',
          attributes: { maxlength: 10 }
        },
        {
          type: 'text',
          name: 'velocidadMaxima',
          placeholder: 'Velocidad Máxima (ej: Hasta 50 Mbps)',
          attributes: { maxlength: 30 }
        },
        
        // SERVICIOS ADICIONALES
        {
          type: 'text',
          name: 'redesSociales',
          placeholder: 'Redes Sociales (ej: Consumo normal)',
          attributes: { maxlength: 50 }
        },
        {
          type: 'text',
          name: 'whatsapp',
          placeholder: 'WhatsApp (ej: Incluido en los GB)',
          attributes: { maxlength: 50 }
        },
        {
          type: 'text',
          name: 'llamadasInternacionales',
          placeholder: 'Llamadas Internacionales (ej: $0.15/min)',
          attributes: { maxlength: 30 }
        },
        {
          type: 'text',
          name: 'roaming',
          placeholder: 'Roaming (ej: No incluido, $5/día)',
          attributes: { maxlength: 50 }
        },
        {
          type: 'text',
          name: 'cobertura',
          placeholder: 'Cobertura (ej: Nacional)',
          value: 'Nacional',
          attributes: { maxlength: 50 }
        },
        {
          type: 'textarea',
          name: 'beneficiosExtra',
          placeholder: 'Beneficios Extra (opcional)',
          attributes: { maxlength: 200 }
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            this.imagenSeleccionada = null;
          }
        },
        {
          text: 'Crear Plan',
          handler: async (data) => {
            if (this.validarDatosPlanCompleto(data)) {
              await this.guardarPlanCompleto(data);
              return true;
            }
            return false;
          }
        }
      ]
    });

    await alert.present();
  }

  validarDatosPlanCompleto(data: any): boolean {
    if (!data.nombre?.trim()) {
      this.mostrarAlerta('Error', 'El nombre del plan es requerido');
      return false;
    }

    if (!data.descripcion?.trim()) {
      this.mostrarAlerta('Error', 'La descripción es requerida');
      return false;
    }

    if (!data.precio || parseFloat(data.precio) <= 0) {
      this.mostrarAlerta('Error', 'El precio debe ser mayor a 0');
      return false;
    }

    if (!data.datos?.trim()) {
      this.mostrarAlerta('Error', 'Los datos móviles son requeridos');
      return false;
    }

    if (!data.minutos?.trim()) {
      this.mostrarAlerta('Error', 'Los minutos son requeridos');
      return false;
    }

    if (!data.sms?.trim()) {
      this.mostrarAlerta('Error', 'Los SMS son requeridos');
      return false;
    }

    return true;
  }

  async guardarPlanCompleto(data: any) {
    const loading = await this.loadingController.create({
      message: 'Creando plan...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      let imagenUrl = '';
      
      // Subir imagen a Cloudinary si fue seleccionada
      if (this.imagenSeleccionada) {
        loading.message = 'Subiendo imagen...';
        const resultImagen = await this.cloudinaryService.subirImagen(this.imagenSeleccionada);
        
        if (!resultImagen.success) {
          await loading.dismiss();
          this.mostrarAlerta('Error', resultImagen.error || 'No se pudo subir la imagen');
          return;
        }
        
        imagenUrl = resultImagen.url!;
      }

      // Crear el plan con todos los campos
      loading.message = 'Guardando plan...';
      const nuevoPlan: Partial<PlanMovil> = {
        // Información básica
        nombre: data.nombre.trim(),
        nombreComercial: data.nombreComercial?.trim(),
        precio: parseFloat(data.precio),
        segmento: data.segmento?.trim() as any,
        publicoObjetivo: data.publicoObjetivo?.trim(),
        descripcion: data.descripcion.trim(),
        
        // Características técnicas
        datos: data.datos.trim(),
        minutos: data.minutos.trim(),
        sms: data.sms.trim(),
        velocidad: data.velocidad?.trim() || '4G',
        velocidadMaxima: data.velocidadMaxima?.trim(),
        
        // Servicios adicionales
        redesSociales: data.redesSociales?.trim(),
        whatsapp: data.whatsapp?.trim(),
        llamadasInternacionales: data.llamadasInternacionales?.trim(),
        roaming: data.roaming?.trim(),
        cobertura: data.cobertura?.trim() || 'Nacional',
        beneficiosExtra: data.beneficiosExtra?.trim(),
        
        // Sistema
        imagenUrl: imagenUrl,
        destacado: false,
        activo: true
      };

      const result = await this.planesService.crearPlan(nuevoPlan);

      await loading.dismiss();
      this.imagenSeleccionada = null;

      if (result.success) {
        this.mostrarAlerta('¡Éxito!', 'Plan creado correctamente');
        this.cargarPlanes();
      } else {
        this.mostrarAlerta('Error', result.error || 'No se pudo crear el plan');
      }

    } catch (error: any) {
      await loading.dismiss();
      this.imagenSeleccionada = null;
      this.mostrarAlerta('Error', error.message || 'Error al crear el plan');
    }
  }

  // EDITAR PLAN (mantener el método existente por ahora)
  async editarPlan(plan: PlanMovil) {
    const alert = await this.alertController.create({
      header: 'Editar Plan',
      inputs: [
        {
          name: 'nombre',
          type: 'text',
          placeholder: 'Nombre del plan',
          value: plan.nombre,
          attributes: { maxlength: 50 }
        },
        {
          name: 'descripcion',
          type: 'textarea',
          placeholder: 'Descripción',
          value: plan.descripcion,
          attributes: { maxlength: 200 }
        },
        {
          name: 'precio',
          type: 'number',
          placeholder: 'Precio',
          value: plan.precio,
          attributes: { step: '0.01' }
        },
        {
          name: 'datos',
          type: 'text',
          placeholder: 'Datos',
          value: plan.datos,
          attributes: { maxlength: 30 }
        },
        {
          name: 'minutos',
          type: 'text',
          placeholder: 'Minutos',
          value: plan.minutos,
          attributes: { maxlength: 30 }
        },
        {
          name: 'sms',
          type: 'text',
          placeholder: 'SMS',
          value: plan.sms,
          attributes: { maxlength: 30 }
        },
        {
          name: 'velocidad',
          type: 'text',
          placeholder: 'Velocidad',
          value: plan.velocidad || '4G',
          attributes: { maxlength: 10 }
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Guardar',
          handler: async (data) => {
            if (this.validarDatosPlan(data)) {
              await this.actualizarPlan(plan.id!, data);
              return true;
            }
            return false;
          }
        }
      ]
    });

    await alert.present();
  }

  validarDatosPlan(data: any): boolean {
    if (!data.nombre || data.nombre.trim() === '') {
      this.mostrarAlerta('Error', 'El nombre del plan es requerido');
      return false;
    }

    if (!data.descripcion || data.descripcion.trim() === '') {
      this.mostrarAlerta('Error', 'La descripción es requerida');
      return false;
    }

    if (!data.precio || parseFloat(data.precio) <= 0) {
      this.mostrarAlerta('Error', 'El precio debe ser mayor a 0');
      return false;
    }

    if (!data.datos || data.datos.trim() === '') {
      this.mostrarAlerta('Error', 'Los datos móviles son requeridos');
      return false;
    }

    if (!data.minutos || data.minutos.trim() === '') {
      this.mostrarAlerta('Error', 'Los minutos de voz son requeridos');
      return false;
    }

    if (!data.sms || data.sms.trim() === '') {
      this.mostrarAlerta('Error', 'Los SMS son requeridos');
      return false;
    }

    return true;
  }

  async actualizarPlan(id: string, data: any) {
    const loading = await this.loadingController.create({
      message: 'Actualizando plan...',
      spinner: 'crescent'
    });
    await loading.present();

    const planActualizado: Partial<PlanMovil> = {
      nombre: data.nombre.trim(),
      descripcion: data.descripcion.trim(),
      precio: parseFloat(data.precio),
      datos: data.datos.trim(),
      minutos: data.minutos.trim(),
      sms: data.sms.trim(),
      velocidad: data.velocidad?.trim() || '4G'
    };

    const result = await this.planesService.actualizarPlan(id, planActualizado);

    await loading.dismiss();

    if (result.success) {
      this.mostrarAlerta('¡Éxito!', 'Plan actualizado correctamente');
      this.cargarPlanes();
    } else {
      this.mostrarAlerta('Error', result.error || 'No se pudo actualizar el plan');
    }
  }

  async eliminarPlan(plan: PlanMovil) {
    const alert = await this.alertController.create({
      header: '¿Eliminar Plan?',
      message: `¿Estás seguro que deseas eliminar el plan "${plan.nombre}"? Esta acción no se puede deshacer.`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            const loading = await this.loadingController.create({
              message: 'Eliminando plan...',
              spinner: 'crescent'
            });
            await loading.present();

            const result = await this.planesService.eliminarPlan(plan.id!, plan.imagenUrl);

            await loading.dismiss();

            if (result.success) {
              this.mostrarAlerta('¡Éxito!', 'Plan eliminado correctamente');
              this.cargarPlanes();
            } else {
              this.mostrarAlerta('Error', result.error || 'No se pudo eliminar el plan');
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async toggleActivoPlan(plan: PlanMovil) {
    const nuevoEstado = !plan.activo;
    const mensaje = nuevoEstado ? 'activar' : 'desactivar';

    const loading = await this.loadingController.create({
      message: `${mensaje.charAt(0).toUpperCase() + mensaje.slice(1)}ando plan...`,
      spinner: 'crescent'
    });
    await loading.present();

    const result = await this.planesService.toggleEstadoPlan(plan.id!, nuevoEstado);

    await loading.dismiss();

    if (result.success) {
      this.cargarPlanes();
    } else {
      this.mostrarAlerta('Error', result.error || `No se pudo ${mensaje} el plan`);
    }
  }

  async mostrarOpcionesPlan(plan: PlanMovil) {
    const actionSheet = await this.actionSheetController.create({
      header: plan.nombre,
      buttons: [
        {
          text: 'Editar',
          icon: 'create-outline',
          handler: () => {
            this.editarPlan(plan);
          }
        },
        {
          text: plan.activo ? 'Desactivar' : 'Activar',
          icon: plan.activo ? 'eye-off-outline' : 'eye-outline',
          handler: () => {
            this.toggleActivoPlan(plan);
          }
        },
        {
          text: 'Eliminar',
          icon: 'trash-outline',
          role: 'destructive',
          handler: () => {
            this.eliminarPlan(plan);
          }
        },
        {
          text: 'Cancelar',
          icon: 'close',
          role: 'cancel'
        }
      ]
    });

    await actionSheet.present();
  }

  // ============================================
  // UTILIDADES
  // ============================================

  // ============================================
// GESTIÓN DE CONTRATACIONES
// ============================================

async cargarContrataciones() {
  this.cargandoContrataciones = true;
  
  try {
    // Obtener TODAS las contrataciones (el asesor ve todas)
    this.contrataciones = await this.contratacionesService.obtenerTodasLasContrataciones();
    
    // Filtrar solo las que están "Contratado" (excluir canceladas)
    this.contrataciones = this.contrataciones.filter(c => c.estado === 'Contratado');
    
    console.log('📋 Contrataciones cargadas:', this.contrataciones.length);
    
  } catch (error) {
    console.error('Error al cargar contrataciones:', error);
    this.mostrarAlerta('Error', 'No se pudieron cargar las contrataciones');
  }
  
  this.cargandoContrataciones = false;
}

async verDetalleContratacion(contratacion: Contratacion) {
  const alert = await this.alertController.create({
    header: 'Detalle de Contratación',
    subHeader: contratacion.planNombre,
    cssClass: 'alert-detalle-contratacion',
    message: `
      <div style="text-align: left; padding: 10px;">
        <p><strong>👤 Cliente:</strong> ${contratacion.usuarioNombre}</p>
        <p><strong>📧 Email:</strong> ${contratacion.usuarioEmail}</p>
        <p><strong>📞 Teléfono:</strong> ${contratacion.telefono}</p>
        <p><strong>📍 Dirección:</strong> ${contratacion.direccion}</p>
        ${contratacion.notas ? `<p><strong>📝 Notas:</strong> ${contratacion.notas}</p>` : ''}
        <hr style="margin: 15px 0;">
        <p><strong>💰 Precio:</strong> $${contratacion.planPrecio?.toFixed(2)}/mes</p>
        <p><strong>📅 Fecha:</strong> ${this.formatearFechaContratacion(contratacion.createdAt)}</p>
        <p><strong>✅ Estado:</strong> Contratado</p>
      </div>
    `,
    buttons: ['Cerrar']
  });

  await alert.present();
}

formatearFechaContratacion(fecha: any): string {
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

  async logout() {
    const alert = await this.alertController.create({
      header: 'Cerrar Sesión',
      message: '¿Estás seguro?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Salir', handler: () => this.authService.logout() }
      ]
    });
    await alert.present();
  }


cambiarVista(event: any) {
  this.vistaActual = event.detail.value;
  
  if (this.vistaActual === 'planes') {
    this.cargarPlanes();
  } else if (this.vistaActual === 'chats') {
    
  } else if (this.vistaActual === 'contrataciones') {
    this.cargarContrataciones();
  }
}

formatearFechaChat(timestamp: any): string {
  if (!timestamp) return '';
  
  const fecha = new Date(timestamp);
  const ahora = new Date();
  const diferencia = ahora.getTime() - fecha.getTime();
  const minutos = Math.floor(diferencia / 60000);
  const horas = Math.floor(diferencia / 3600000);
  const dias = Math.floor(diferencia / 86400000);
  
  if (minutos < 1) return 'Ahora';
  if (minutos < 60) return `Hace ${minutos}m`;
  if (horas < 24) return `Hace ${horas}h`;
  if (dias === 1) return 'Ayer';
  if (dias < 7) return `Hace ${dias}d`;
  
  return fecha.toLocaleDateString('es-EC', {
    day: 'numeric',
    month: 'short'
  });
}

}