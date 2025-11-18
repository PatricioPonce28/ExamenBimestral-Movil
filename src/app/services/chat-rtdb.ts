import { Injectable } from '@angular/core';
import { getDatabase, ref, onValue, push, set, serverTimestamp } from 'firebase/database';
import { AuthService } from './auth';

@Injectable({ providedIn: 'root' })
export class ChatRTDBService {
  private db = getDatabase();
  private ASESOR_UID = 'vzVySECaodg9KromIE2toBn3c2'; // TU ASESOR

  constructor(private authService: AuthService) {}

  // Genera un ID único para la conversación entre 2 personas
  private getChatId(uid1: string, uid2: string): string {
    return [uid1, uid2].sort().join('_');
  }

  // === PARA EL USUARIO ===
  async enviarMensajeDesdeUsuario(mensaje: string) {
    const user = this.authService.getCurrentUser();
    if (!user) return;

    const chatId = this.getChatId(user.uid, this.ASESOR_UID);
    const msgRef = push(ref(this.db, `chats/${chatId}/mensajes`));

    await set(msgRef, {
      uid: user.uid,
      nombre: user.displayName || 'Usuario',
      mensaje: mensaje.trim(),
      fecha: serverTimestamp()
    });
  }

  escucharMensajesUsuario(callback: (mensajes: any[]) => void) {
    const user = this.authService.getCurrentUser();
    if (!user) return () => {};

    const chatId = this.getChatId(user.uid, this.ASESOR_UID);
    const mensajesRef = ref(this.db, `chats/${chatId}/mensajes`);

    return onValue(mensajesRef, (snapshot) => {
      const data = snapshot.val();
      const mensajes = data
        ? Object.keys(data).map(key => ({ id: key, ...data[key] }))
        : [];
      mensajes.sort((a: any, b: any) => (a.fecha || 0) - (b.fecha || 0));
      callback(mensajes);
    });
  }

  // === PARA EL ASESOR ===
  escucharTodosLosChats(callback: (chats: any[]) => void) {
    const chatsRef = ref(this.db, 'chats');

    return onValue(chatsRef, (snapshot) => {
      const data = snapshot.val() || {};
      const lista = Object.keys(data)
        .map(chatId => {
          const mensajes = Object.values(data[chatId].mensajes || {}) as any[];
          const ultimo = mensajes[mensajes.length - 1];
          const usuarioId = chatId.split('_').find(id => id !== this.ASESOR_UID);

          if (!usuarioId || !ultimo) return null;

          return {
            chatId,
            usuarioId,
            usuarioNombre: ultimo.nombre || 'Usuario',
            ultimoMensaje: ultimo.mensaje,
            fecha: ultimo.fecha || 0
          };
        })
        .filter(Boolean)
        .sort((a, b) => (b?.fecha || 0) - (a?.fecha || 0));

      callback(lista);
    });
  }

  escucharChatEspecifico(chatId: string, callback: (mensajes: any[]) => void) {
    const mensajesRef = ref(this.db, `chats/${chatId}/mensajes`);

    return onValue(mensajesRef, (snapshot) => {
      const data = snapshot.val();
      const mensajes = data
        ? Object.keys(data).map(key => ({ id: key, ...data[key] }))
        : [];
      mensajes.sort((a: any, b: any) => (a.fecha || 0) - (b.fecha || 0));
      callback(mensajes);
    });
  }

  async enviarMensajeDesdeAsesor(chatId: string, mensaje: string) {
    const user = this.authService.getCurrentUser();
    if (!user) return;

    const msgRef = push(ref(this.db, `chats/${chatId}/mensajes`));
    await set(msgRef, {
      uid: user.uid,
      nombre: user.displayName || 'Asesor',
      mensaje: mensaje.trim(),
      fecha: serverTimestamp()
    });
  }
}