import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GestionPlanesPage } from './gestion-planes.page';

const routes: Routes = [
  {
    path: '',
    component: GestionPlanesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GestionPlanesPageRoutingModule {}
