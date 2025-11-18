import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { UsuarioChatPageRoutingModule } from './usuario-chat-routing.module';

import { UsuarioChatPage } from './usuario-chat.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    UsuarioChatPageRoutingModule
  ],
  declarations: [UsuarioChatPage]
})
export class UsuarioChatPageModule {}
