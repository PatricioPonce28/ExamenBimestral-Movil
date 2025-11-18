import { CanActivateFn } from '@angular/router';

export const asesorGuard: CanActivateFn = (route, state) => {
  return true;
};
