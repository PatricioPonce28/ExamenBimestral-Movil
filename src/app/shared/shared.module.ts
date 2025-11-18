import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

// Importar el componente
import { ImageViewerComponent } from '../components/image-viewer/image-viewer.component';

@NgModule({
  declarations: [
    ImageViewerComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule
  ],
  exports: [
    ImageViewerComponent,
    CommonModule,
    FormsModule,
    IonicModule
  ]
})
export class SharedModule { }