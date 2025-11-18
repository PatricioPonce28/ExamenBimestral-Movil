import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { AlertController, LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
  standalone: false
})
export class RegistroPage {
  // Datos del formulario
  displayName: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  tipoRegistro: 'usuario' | 'asesor' = 'usuario';
  codigoAdmin: string = '';
  
  // Control de visualización de contraseñas
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  
  // Términos y condiciones
  aceptaTerminos: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController
  ) {}

  async registrar() {
    // Validaciones
    if (!this.validarFormulario()) {
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Creando cuenta...',
      spinner: 'crescent'
    });
    await loading.present();

    let result;

    if (this.tipoRegistro === 'asesor') {
      // Registrar como Asesor Comercial
      result = await this.authService.registrarAsesor(
        this.email,
        this.password,
        this.displayName,
        this.codigoAdmin
      );
    } else {
      // Registrar como Usuario Registrado
      result = await this.authService.registrarUsuario(
        this.email,
        this.password,
        this.displayName
      );
    }

    await loading.dismiss();

    if (result.success) {
      await this.mostrarAlerta(
        '¡Registro Exitoso!',
        `Bienvenido ${this.displayName}. Tu cuenta ha sido creada correctamente.`,
        true
      );
    } else {
      this.mostrarAlerta('Error', result.error, false);
    }
  }

  validarFormulario(): boolean {
    // Validar nombre
    if (!this.displayName || this.displayName.trim().length < 3) {
      this.mostrarAlerta('Error', 'El nombre debe tener al menos 3 caracteres', false);
      return false;
    }

    // Validar email
    if (!this.email || !this.validarEmail(this.email)) {
      this.mostrarAlerta('Error', 'Por favor ingresa un email válido', false);
      return false;
    }

    // Validar contraseña
    if (!this.password || this.password.length < 6) {
      this.mostrarAlerta('Error', 'La contraseña debe tener al menos 6 caracteres', false);
      return false;
    }

    // Validar coincidencia de contraseñas
    if (this.password !== this.confirmPassword) {
      this.mostrarAlerta('Error', 'Las contraseñas no coinciden', false);
      return false;
    }

    // Validar términos y condiciones
    if (!this.aceptaTerminos) {
      this.mostrarAlerta('Error', 'Debes aceptar los términos y condiciones', false);
      return false;
    }

    // Validar código de admin si es asesor
    if (this.tipoRegistro === 'asesor' && !this.codigoAdmin) {
      this.mostrarAlerta('Error', 'Debes ingresar el código de administrador', false);
      return false;
    }

    return true;
  }

  validarEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  cambiarTipoRegistro(tipo: 'usuario' | 'asesor') {
    this.tipoRegistro = tipo;
    this.codigoAdmin = ''; // Limpiar código al cambiar
  }

  async mostrarAlerta(titulo: string, mensaje: string, redirigir: boolean) {
    const alert = await this.alertController.create({
      header: titulo,
      message: mensaje,
      buttons: [
        {
          text: 'OK',
          handler: () => {
            if (redirigir) {
              this.router.navigate(['/home']);
            }
          }
        }
      ]
    });
    await alert.present();
  }

  volverLogin() {
    this.router.navigate(['/home']);
  }

  async verTerminos() {
    const alert = await this.alertController.create({
      header: 'Términos y Condiciones',
      message: `
        <div style="text-align: left;">
          <p><strong>1. Aceptación de los términos</strong></p>
          <p>Al usar esta aplicación, aceptas nuestros términos y condiciones.</p>
          
          <p><strong>2. Uso de la cuenta</strong></p>
          <p>Eres responsable de mantener la confidencialidad de tu cuenta.</p>
          
          <p><strong>3. Privacidad</strong></p>
          <p>Tus datos serán tratados conforme a nuestra política de privacidad.</p>
          
          <p><strong>4. Contratación de servicios</strong></p>
          <p>Los planes mostrados están sujetos a disponibilidad y verificación.</p>
        </div>
      `,
      buttons: ['Cerrar']
    });
    await alert.present();
  }
}