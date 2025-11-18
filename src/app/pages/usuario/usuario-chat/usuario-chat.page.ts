import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { IonContent } from '@ionic/angular';
import { ChatRTDBService } from 'src/app/services/chat-rtdb';
import { AuthService } from 'src/app/services/auth';

@Component({
  selector: 'app-usuario-chat',
  templateUrl: './usuario-chat.page.html',
  styleUrls: ['./usuario-chat.page.scss'],
  standalone: false
})
export class UsuarioChatPage implements OnInit, OnDestroy {
  @ViewChild(IonContent) content!: IonContent;

  mensajes: any[] = [];
  nuevoMensaje = '';
  miUid = '';
  unsubscribe: any;

  constructor(
    private chatRTDB: ChatRTDBService,
    private authService: AuthService
  ) {}

ngOnInit() {
  const user = this.authService.getCurrentUser();
  if (!user) return;
  this.miUid = user.uid;

  this.chatRTDB.escucharMensajesUsuario((msgs) => {
    this.mensajes = msgs;
    this.scrollToBottom();
  });
}

async enviar() {
  if (!this.nuevoMensaje.trim()) return;
  await this.chatRTDB.enviarMensajeDesdeUsuario(this.nuevoMensaje);
  this.nuevoMensaje = '';
}

  scrollToBottom() {
    setTimeout(() => this.content?.scrollToBottom(300), 100);
  }

  ngOnDestroy() {
    if (this.unsubscribe) this.unsubscribe();
  }
}