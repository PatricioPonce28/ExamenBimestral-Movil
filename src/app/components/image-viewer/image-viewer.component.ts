import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-image-viewer',
  templateUrl: './image-viewer.component.html',
  styleUrls: ['./image-viewer.component.scss'],
  standalone: false
})
export class ImageViewerComponent {
  @Input() imageUrl: string = '';
  @Input() title: string = '';
  @Input() subtitle: string = '';

  zoomLevel: number = 1;
  minZoom: number = 1;
  maxZoom: number = 3;
  isDragging: boolean = false;

  constructor(private modalController: ModalController) {}

  cerrar() {
    this.modalController.dismiss();
  }

  zoomIn() {
    if (this.zoomLevel < this.maxZoom) {
      this.zoomLevel += 0.25;
    }
  }

  zoomOut() {
    if (this.zoomLevel > this.minZoom) {
      this.zoomLevel -= 0.25;
    }
  }

  resetZoom() {
    this.zoomLevel = 1;
  }

  // Compartir imagen (si está disponible)
  async compartir() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: this.title,
          text: this.subtitle || this.title,
          url: this.imageUrl
        });
      } catch (error) {
        console.log('Error al compartir:', error);
      }
    }
  }

  // Descargar imagen
  descargar() {
    const link = document.createElement('a');
    link.href = this.imageUrl;
    link.download = `${this.title || 'imagen'}.jpg`;
    link.click();
  }
}