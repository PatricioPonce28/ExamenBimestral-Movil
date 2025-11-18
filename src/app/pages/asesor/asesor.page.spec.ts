import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AsesorPage } from './asesor.page';

describe('AsesorPage', () => {
  let component: AsesorPage;
  let fixture: ComponentFixture<AsesorPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AsesorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
