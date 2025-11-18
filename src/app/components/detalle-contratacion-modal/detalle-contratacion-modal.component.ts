import { Component, Input } from '@angular/core';
import { ModalController, IonicModule } from '@ionic/angular';
import { Contratacion } from 'src/app/models/interfaces';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-detalle-contratacion-modal',
  templateUrl: './detalle-contratacion-modal.component.html',
  styleUrls: ['./detalle-contratacion-modal.component.scss'],
  standalone: false
})
export class DetalleContratacionModalComponent {
  @Input() contratacion!: Contratacion;

  constructor(private modalCtrl: ModalController) {}

  cerrar() {
    this.modalCtrl.dismiss();
  }

  cancelar() {
    this.modalCtrl.dismiss({ accion: 'cancelar' });
  }

  compartir() {
    this.modalCtrl.dismiss({ accion: 'compartir' });
  }

  getEstadoColor(estado: string): string {
    const colores: any = { Contratado: 'success', Pendiente: 'warning', Cancelada: 'danger' };
    return colores[estado] || 'medium';
  }

  getEstadoIcon(estado: string): string {
    const iconos: any = { Contratado: 'checkmark-circle', Pendiente: 'time', Cancelada: 'close-circle' };
    return iconos[estado] || 'help';
  }

  formatearFecha(fecha: any): string {
    if (!fecha) return 'N/A';
    const date = fecha.toDate ? fecha.toDate() : new Date(fecha);
    return date.toLocaleDateString('es-EC', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}