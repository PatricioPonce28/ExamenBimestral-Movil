import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UsuarioChatPage } from './usuario-chat.page';

describe('UsuarioChatPage', () => {
  let component: UsuarioChatPage;
  let fixture: ComponentFixture<UsuarioChatPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(UsuarioChatPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
