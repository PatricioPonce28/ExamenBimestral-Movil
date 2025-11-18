import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth-guard';
import { asesorGuard } from './guards/asesor-guard';
import { usuarioRegistradoGuard } from './guards/usuario-registrado-guard';
import { publicoGuard } from './guards/publico-guard';
import { UsuarioChatPage } from './pages/usuario/usuario-chat/usuario-chat.page';
import { AsesorChatPageRoutingModule } from './pages/asesor/asesor-chat/asesor-chat-routing.module';
import { AsesorChatPage } from './pages/asesor/asesor-chat/asesor-chat.page';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then(m => m.HomePageModule),
    canActivate: [publicoGuard] // Solo accesible si NO está autenticado
  },
  {
    path: 'registro',
    loadChildren: () => import('./pages/registro/registro.module').then(m => m.RegistroPageModule),
    canActivate: [publicoGuard]
  },
  {
    path: 'recuperar-password',
    loadChildren: () => import('./pages/recuperar-password/recuperar-password.module').then(m => m.RecuperarPasswordPageModule),
    canActivate: [publicoGuard]
  },
  {
    path: 'catalogo',
    loadChildren: () => import('./pages/catalogo/catalogo.module').then(m => m.CatalogoPageModule)
    // Sin guard - accesible para todos (invitados y autenticados)
  },
  {
    path: 'asesor',
    loadChildren: () => import('./pages/asesor/asesor.module').then(m => m.AsesorPageModule),
    canActivate: [asesorGuard] // Solo Asesor Comercial
  },
  {
    path: 'asesor/chat', 
    loadChildren: () => import('./pages/asesor/asesor-chat/asesor-chat.module').then(m => m.AsesorChatPageModule),
    canActivate: [asesorGuard]
  },
  {
    path: 'usuario',
    loadChildren: () => import('./pages/usuario/usuario.module').then(m => m.UsuarioPageModule),
    canActivate: [usuarioRegistradoGuard] // Solo Usuario Registrado
  },
  {
    path: 'usuario/historial',
    loadChildren: () => import('./pages/usuario/historial/historial.module').then(m => m.HistorialPageModule),
    canActivate: [usuarioRegistradoGuard]
  },
  {
    path: 'usuario/chat',  // ← CHAT DEL USUARIO
    loadChildren: () => import('./pages/usuario/usuario-chat/usuario-chat.module').then(m => m.UsuarioChatPageModule),
    canActivate: [usuarioRegistradoGuard]
  },
  {
    path: '**',
    redirectTo: 'home'
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }