import { CanActivateFn } from '@angular/router';

export const usuarioRegistradoGuard: CanActivateFn = (route, state) => {
  return true;
};
