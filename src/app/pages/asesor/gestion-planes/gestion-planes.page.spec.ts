import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GestionPlanesPage } from './gestion-planes.page';

describe('GestionPlanesPage', () => {
  let component: GestionPlanesPage;
  let fixture: ComponentFixture<GestionPlanesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(GestionPlanesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
