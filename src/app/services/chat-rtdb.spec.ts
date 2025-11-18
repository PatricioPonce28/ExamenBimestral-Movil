import { TestBed } from '@angular/core/testing';

import { ChatRtdb } from './chat-rtdb';

describe('ChatRtdb', () => {
  let service: ChatRtdb;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChatRtdb);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
