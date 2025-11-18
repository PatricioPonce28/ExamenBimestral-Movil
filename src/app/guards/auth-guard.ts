import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  async canActivate(): Promise<boolean> {
    // Esperar a que se cargue el estado del usuario
    await this.waitForUserLoad();

    if (this.authService.isAuthenticated()) {
      return true;
    } else {
      this.router.navigate(['/home']);
      return false;
    }
  }

  private waitForUserLoad(): Promise<void> {
    return new Promise((resolve) => {
      const subscription = this.authService.userLoaded$.subscribe((loaded) => {
        if (loaded) {
          subscription.unsubscribe();
          resolve();
        }
      });
    });
  }
}