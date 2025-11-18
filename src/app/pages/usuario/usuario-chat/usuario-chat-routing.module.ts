import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { UsuarioChatPage } from './usuario-chat.page';

const routes: Routes = [
  {
    path: '',
    component: UsuarioChatPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UsuarioChatPageRoutingModule {}
