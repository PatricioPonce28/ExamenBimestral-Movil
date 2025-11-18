import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { publicoGuard } from './publico-guard';

describe('publicoGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => publicoGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
