import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { PlanesService } from '../../services/planes';
import { PlanMovil } from 'src/app/models/interfaces';
import { AlertController, ModalController } from '@ionic/angular'; 
import { ImageViewerComponent } from '../../components/image-viewer/image-viewer.component';

@Component({
  selector: 'app-catalogo',
  templateUrl: './catalogo.page.html',
  styleUrls: ['./catalogo.page.scss'],
  standalone: false
})
export class CatalogoPage implements OnInit {
  planes: PlanMovil[] = [];
  planesOriginales: PlanMovil[] = [];
  planesFiltrados: PlanMovil[] = [];
  cargando: boolean = true;
  usuarioNombre: string = '';
  
  // Filtros y búsqueda
  busqueda: string = '';
  filtroOrden: 'precio-asc' | 'precio-desc' | 'nombre' | 'destacado' = 'destacado';
  filtroVelocidad: 'todos' | '4G' | '5G' = 'todos';

  constructor(
    private authService: AuthService,
    private planesService: PlanesService,
    public router: Router,
    private alertController: AlertController,
    private modalController: ModalController
  ) {}

  ngOnInit() {
    this.obtenerDatosUsuario();
    this.cargarPlanes();
  }

  ionViewWillEnter() {
    this.cargarPlanes();
  }

  obtenerDatosUsuario() {
    const userData = this.authService.getUserData();
    this.usuarioNombre = userData.displayName || 'Usuario';
  }
async cargarPlanes() {
  this.cargando = true;

  try {
    const planesActivos = await this.planesService.obtenerPlanesActivos();

    console.log('Planes activos recibidos:', planesActivos); // ← Quita esto después

    this.planes = planesActivos || [];
    this.planesOriginales = [...this.planes];

    // Forzar la actualización de los filtros
    this.aplicarFiltros();

    // Seguridad extra: si aplicarFiltros() falló, mostrar al menos los originales
    if (this.planesFiltrados.length === 0 && this.planes.length > 0) {
      this.planesFiltrados = [...this.planes];
    }

  } catch (error) {
    console.error('Error cargando planes:', error);
    this.planes = [];
    this.planesOriginales = [];
    this.planesFiltrados = [];
  } finally {
    this.cargando = false;
  }
}

  // ============================================
  // FILTROS Y BÚSQUEDA
  // ============================================

  aplicarFiltros() {
    let resultado = [...this.planesOriginales];

    // Filtro por búsqueda
    if (this.busqueda.trim() !== '') {
      const busquedaLower = this.busqueda.toLowerCase();
      resultado = resultado.filter(plan =>
        plan.nombre.toLowerCase().includes(busquedaLower) ||
        plan.descripcion.toLowerCase().includes(busquedaLower) ||
        plan.datos.toLowerCase().includes(busquedaLower)
      );
    }

    // Filtro por velocidad
    if (this.filtroVelocidad !== 'todos') {
      resultado = resultado.filter(plan => 
        plan.velocidad?.includes(this.filtroVelocidad)
      );
    }

    // Ordenamiento
    switch (this.filtroOrden) {
      case 'precio-asc':
        resultado.sort((a, b) => a.precio - b.precio);
        break;
      case 'precio-desc':
        resultado.sort((a, b) => b.precio - a.precio);
        break;
      case 'nombre':
        resultado.sort((a, b) => a.nombre.localeCompare(b.nombre));
        break;
      case 'destacado':
        resultado.sort((a, b) => {
          if (a.destacado && !b.destacado) return -1;
          if (!a.destacado && b.destacado) return 1;
          return b.precio - a.precio;
        });
        break;
    }

    this.planesFiltrados = resultado;
  }

  limpiarBusqueda() {
    this.busqueda = '';
    this.aplicarFiltros();
  }

  
async verImagenGrande(plan: PlanMovil, event: Event) {
    event.stopPropagation();

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
      cssClass: 'fullscreen-modal' // opcional, pero queda brutal
    });

    await modal.present();
  }
  // ============================================
  // VER DETALLE DE PLAN
  // ============================================

async verDetallePlan(plan: PlanMovil) {
  const alert = await this.alertController.create({
    header: plan.nombre,
    subHeader: `$${plan.precio.toFixed(2)} USD/mes`,
    message: `
      Descripción
      ${plan.descripcion}

      Características del plan
      • Datos: ${plan.datos}
      • Minutos: ${plan.minutos}
      • SMS: ${plan.sms}
      • Velocidad: ${plan.velocidad || '4G'}
    `.trim(),
    buttons: [
      {
        text: 'Cerrar',
        role: 'cancel'
      }
    ]
  });

  await alert.present();
}

  // ============================================
  // UTILIDADES
  // ============================================

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

async mostrarAlerta(titulo: string, mensaje: string) {
  const alert = await this.alertController.create({
    header: titulo,
    message: mensaje,
    buttons: ['OK']
  });
  await alert.present();
}
}