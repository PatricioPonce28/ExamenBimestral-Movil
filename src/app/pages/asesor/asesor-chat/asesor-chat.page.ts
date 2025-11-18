import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IonContent } from '@ionic/angular';
import { ChatRTDBService } from 'src/app/services/chat-rtdb';
import { AuthService } from 'src/app/services/auth';

@Component({
  selector: 'app-asesor-chat',
  templateUrl: './asesor-chat.page.html',
  styleUrls: ['./asesor-chat.page.scss'],
  standalone: false
})
export class AsesorChatPage implements OnInit, OnDestroy {
  @ViewChild(IonContent) content!: IonContent;

  chatId: string = '';
  usuarioNombre: string = '';
  mensajes: any[] = [];
  nuevoMensaje = '';
  miUid = '';
  unsubscribe: any;

  constructor(
    private route: ActivatedRoute,
    private chatRTDB: ChatRTDBService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    const user = this.authService.getCurrentUser();
    if (!user) return;
    this.miUid = user.uid;

    this.route.queryParams.subscribe(params => {
      this.chatId = params['chatId'] || '';
      this.usuarioNombre = params['usuarioNombre'] || 'Cliente';

      if (this.chatId) {
        this.cargarMensajes();
      }
    });
  }

  cargarMensajes() {
    this.unsubscribe = this.chatRTDB.escucharChatEspecifico(this.chatId, (msgs: any[]) => {
      this.mensajes = msgs;
      this.scrollToBottom();
    });
  }

  async enviar() {
    if (!this.nuevoMensaje.trim() || !this.chatId) return;

    await this.chatRTDB.enviarMensajeDesdeAsesor(this.chatId, this.nuevoMensaje);
    this.nuevoMensaje = '';
  }

  scrollToBottom() {
    setTimeout(() => this.content?.scrollToBottom(300), 100);
  }

  ngOnDestroy() {
    if (this.unsubscribe) this.unsubscribe();
  }
}