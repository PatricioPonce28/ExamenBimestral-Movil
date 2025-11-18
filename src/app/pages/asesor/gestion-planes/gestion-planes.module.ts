import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { GestionPlanesPageRoutingModule } from './gestion-planes-routing.module';

import { GestionPlanesPage } from './gestion-planes.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GestionPlanesPageRoutingModule
  ],
  declarations: [GestionPlanesPage]
})
export class GestionPlanesPageModule {}
