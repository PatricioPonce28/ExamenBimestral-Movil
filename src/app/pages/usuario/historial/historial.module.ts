import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HistorialPageRoutingModule } from './historial-routing.module';

import { HistorialPage } from './historial.page';
import { DetalleContratacionModalComponent } from 'src/app/components/detalle-contratacion-modal/detalle-contratacion-modal.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HistorialPageRoutingModule
  ],
  declarations: [HistorialPage, DetalleContratacionModalComponent]
})
export class HistorialPageModule {}
