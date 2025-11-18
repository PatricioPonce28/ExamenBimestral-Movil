import { CanActivateFn } from '@angular/router';

export const publicoGuard: CanActivateFn = (route, state) => {
  return true;
};
