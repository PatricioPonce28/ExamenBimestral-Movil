import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth';
import { AlertController, LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false
})
export class HomePage {
  email: string = '';
  password: string = '';
  showPassword: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController
  ) {}

  async login() {
    // Validaciones
    if (!this.email || !this.password) {
      this.mostrarAlerta('Error', 'Por favor completa todos los campos');
      return;
    }

    if (!this.validarEmail(this.email)) {
      this.mostrarAlerta('Error', 'Por favor ingresa un email válido');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Iniciando sesión...',
      spinner: 'crescent'
    });
    await loading.present();

    const result = await this.authService.login(this.email, this.password);

    await loading.dismiss();

    if (!result.success) {
      let mensaje = 'Error al iniciar sesión';
      
      if (result.error.includes('user-not-found')) {
        mensaje = 'Usuario no encontrado';
      } else if (result.error.includes('wrong-password')) {
        mensaje = 'Contraseña incorrecta';
      } else if (result.error.includes('invalid-email')) {
        mensaje = 'Email inválido';
      } else if (result.error.includes('invalid-credential')) {
        mensaje = 'Credenciales inválidas';
      }
      
      this.mostrarAlerta('Error', mensaje);
    }
    // La redirección se maneja en el AuthService según el rol
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  irARegistro() {
    this.router.navigate(['/registro']);
  }

  irARecuperarPassword() {
    this.router.navigate(['/recuperar-password']);
  }

  continuarComoInvitado() {
    // Navegar al catálogo sin autenticación
    this.router.navigate(['/catalogo']);
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
}