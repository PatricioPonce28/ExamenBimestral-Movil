import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AsesorPage } from './asesor.page';

const routes: Routes = [
  {
    path: '',
    component: AsesorPage
  },

  {
    path: 'asesor-chat',
    loadChildren: () => import('./asesor-chat/asesor-chat.module').then( m => m.AsesorChatPageModule)
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AsesorPageRoutingModule {}
