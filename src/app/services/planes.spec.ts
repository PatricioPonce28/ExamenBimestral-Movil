import { TestBed } from '@angular/core/testing';

import { PlanesService } from './planes';

describe('Planes', () => {
  let service: PlanesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlanesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
