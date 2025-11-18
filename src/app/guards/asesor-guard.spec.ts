import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { asesorGuard } from './asesor-guard';

describe('asesorGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => asesorGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
