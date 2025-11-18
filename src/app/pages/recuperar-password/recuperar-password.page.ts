import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { AlertController, LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-recuperar-password',
  templateUrl: './recuperar-password.page.html',
  styleUrls: ['./recuperar-password.page.scss'],
  standalone: false
})
export class RecuperarPasswordPage {
  email: string = '';
  emailEnviado: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController
  ) {}

  async enviarEmail() {
    // Validar email
    if (!this.email) {
      this.mostrarAlerta('Error', 'Por favor ingresa tu correo electrónico');
      return;
    }

    if (!this.validarEmail(this.email)) {
      this.mostrarAlerta('Error', 'Por favor ingresa un correo electrónico válido');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Enviando correo...',
      spinner: 'crescent'
    });
    await loading.present();

    const result = await this.authService.resetPassword(this.email);

    await loading.dismiss();

    if (result.success) {
      this.emailEnviado = true;
      this.mostrarAlertaExito(
        '¡Correo Enviado!',
        `Se ha enviado un correo a ${this.email} con las instrucciones para recuperar tu contraseña. Por favor revisa tu bandeja de entrada y spam.`
      );
    } else {
      let mensaje = 'No se pudo enviar el correo de recuperación';
      
      if (result.error.includes('user-not-found')) {
        mensaje = 'No existe una cuenta con este correo electrónico';
      } else if (result.error.includes('invalid-email')) {
        mensaje = 'Correo electrónico inválido';
      } else if (result.error.includes('too-many-requests')) {
        mensaje = 'Demasiados intentos. Por favor intenta más tarde';
      }
      
      this.mostrarAlerta('Error', mensaje);
    }
  }

  validarEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  async mostrarAlerta(titulo: string, mensaje: string) {
    const alert = await this.alertController.create({
      header: titulo,
      message: mensaje,
      buttons: ['OK']
    });
    await alert.present();
  }

  async mostrarAlertaExito(titulo: string, mensaje: string) {
    const alert = await this.alertController.create({
      header: titulo,
      message: mensaje,
      buttons: [
        {
          text: 'Entendido',
          handler: () => {
            this.volverLogin();
          }
        }
      ]
    });
    await alert.present();
  }

  volverLogin() {
    this.router.navigate(['/home']);
  }

  reenviarEmail() {
    this.emailEnviado = false;
    this.enviarEmail();
  }
}