import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AsesorChatPageRoutingModule } from './asesor-chat-routing.module';

import { AsesorChatPage } from './asesor-chat.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AsesorChatPageRoutingModule
  ],
  declarations: [AsesorChatPage]
})
export class AsesorChatPageModule {}
