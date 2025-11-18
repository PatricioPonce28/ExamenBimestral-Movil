import { Injectable, inject } from '@angular/core';
import { Auth, signInWithEmailAndPassword, signOut, User, sendPasswordResetEmail, createUserWithEmailAndPassword, updateProfile, onAuthStateChanged } from '@angular/fire/auth';
import { Firestore, doc, getDoc, setDoc, serverTimestamp, collection } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private router = inject(Router);
  
  currentUser: User | null = null;
  private userLoaded = new BehaviorSubject<boolean>(false);
  userLoaded$ = this.userLoaded.asObservable();

  constructor() {
    // Observar cambios en la autenticación
    onAuthStateChanged(this.auth, async (user) => {
      this.currentUser = user;
      
      if (user) {
        // Usuario autenticado, verificar su rol
        const rol = await this.getUserRole();
        const currentPath = window.location.pathname;
        
        // Solo redirigir si está en home o página de registro
        if (currentPath === '/home' || currentPath === '/registro' || currentPath === '/') {
          if (rol === 'Asesor Comercial') {
            this.router.navigate(['/asesor']);
          } else if (rol === 'Usuario Registrado') {
            this.router.navigate(['/usuario']);
          }
        }
      }
      
      this.userLoaded.next(true);
    });
  }

  async login(email: string, password: string) {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      const user = userCredential.user;
      
      // Obtener el rol del usuario desde Firestore
      const userDoc = doc(this.firestore, `Usuarios/${user.uid}`);
      const userSnapshot = await getDoc(userDoc);
      
      if (userSnapshot.exists()) {
        const userData = userSnapshot.data();
        const rol = userData['rol'];
        
        // Redirigir según el rol
        if (rol === 'Asesor Comercial') {
          this.router.navigate(['/asesor']);
        } else if (rol === 'Usuario Registrado') {
          this.router.navigate(['/usuario']);
        } else {
          throw new Error('Rol no reconocido');
        }
        
        return { success: true, rol };
      } else {
        throw new Error('Usuario no encontrado en la base de datos');
      }
    } catch (error: any) {
      console.error('Error en login:', error);
      return { success: false, error: error.message };
    }
  }

  async logout() {
    await signOut(this.auth);
    this.router.navigate(['/home']);
  }

  async getUserRole(): Promise<string | null> {
    if (!this.currentUser) return null;
    
    try {
      const userDoc = doc(this.firestore, `Usuarios/${this.currentUser.uid}`);
      const userSnapshot = await getDoc(userDoc);
      
      if (userSnapshot.exists()) {
        return userSnapshot.data()['rol'];
      }
    } catch (error) {
      console.error('Error al obtener rol:', error);
    }
    return null;
  }

  async resetPassword(email: string) {
    try {
      await sendPasswordResetEmail(this.auth, email);
      return { success: true };
    } catch (error: any) {
      console.error('Error al enviar email:', error);
      return { success: false, error: error.message };
    }
  }


  async registrarUsuario(email: string, password: string, displayName: string) {
    try {
      // Validaciones básicas
      if (!email || !password || !displayName) {
        throw new Error('Todos los campos son requeridos');
      }

      if (password.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres');
      }

      // Crear usuario en Authentication
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      const user = userCredential.user;

      // Actualizar el displayName
      await updateProfile(user, {
        displayName: displayName
      });

      // Crear documento en Firestore con rol Usuario Registrado
      // Esto creará automáticamente la colección "Usuarios" si no existe
      const userDoc = doc(this.firestore, `Usuarios/${user.uid}`);
      await setDoc(userDoc, {
        uid: user.uid,
        email: email,
        displayName: displayName,
        rol: 'Usuario Registrado',
        emailVerified: user.emailVerified,
        activo: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      console.log('Usuario registrado exitosamente:', user.uid);
      return { success: true, uid: user.uid };
    } catch (error: any) {
      console.error('Error al registrar usuario:', error);
      
      // Mensajes de error más amigables
      let errorMessage = error.message;
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Este correo ya está registrado';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Correo electrónico inválido';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'La contraseña es muy débil';
      }
      
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Registrar un Asesor Comercial
   * NOTA: En producción, esto debería ser protegido y solo accesible por administradores
   */
  async registrarAsesor(email: string, password: string, displayName: string, codigoAdmin?: string) {
    try {

      const CODIGO_ADMIN_VALIDO = 'ADMIN2025'; // Cambiar por uno seguro
      
      if (codigoAdmin !== CODIGO_ADMIN_VALIDO) {
        throw new Error('Código de administrador inválido');
      }

      // Validaciones básicas
      if (!email || !password || !displayName) {
        throw new Error('Todos los campos son requeridos');
      }

      if (password.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres');
      }

      // Crear usuario en Authentication
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      const user = userCredential.user;

      // Actualizar el displayName
      await updateProfile(user, {
        displayName: displayName
      });

      // Crear documento en Firestore con rol Asesor Comercial
      const userDoc = doc(this.firestore, `Usuarios/${user.uid}`);
      await setDoc(userDoc, {
        uid: user.uid,
        email: email,
        displayName: displayName,
        rol: 'Asesor Comercial',
        emailVerified: user.emailVerified,
        activo: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      console.log('Asesor registrado exitosamente:', user.uid);
      return { success: true, uid: user.uid };
    } catch (error: any) {
      console.error('Error al registrar asesor:', error);
      
      let errorMessage = error.message;
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Este correo ya está registrado';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Correo electrónico inválido';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'La contraseña es muy débil';
      }
      
      return { success: false, error: errorMessage };
    }
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  getUserData() {
    return {
      uid: this.currentUser?.uid,
      email: this.currentUser?.email,
      displayName: this.currentUser?.displayName
    };
  }

  async getUserProfile() {
    if (!this.currentUser) return null;
    
    try {
      const userDoc = doc(this.firestore, `Usuarios/${this.currentUser.uid}`);
      const userSnapshot = await getDoc(userDoc);
      
      if (userSnapshot.exists()) {
        return userSnapshot.data();
      }
    } catch (error) {
      console.error('Error al obtener perfil:', error);
    }
    return null;
  }
}