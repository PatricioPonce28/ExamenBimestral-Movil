import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AsesorChatPage } from './asesor-chat.page';

describe('AsesorChatPage', () => {
  let component: AsesorChatPage;
  let fixture: ComponentFixture<AsesorChatPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AsesorChatPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
