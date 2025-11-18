import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AsesorChatPage } from './asesor-chat.page';

const routes: Routes = [
  {
    path: '',
    component: AsesorChatPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AsesorChatPageRoutingModule {}
