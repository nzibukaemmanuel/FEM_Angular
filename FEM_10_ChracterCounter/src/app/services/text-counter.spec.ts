import { TestBed } from '@angular/core/testing';
import { TextCounter } from './text-counter';

describe('TextCounter', () => {
  let service: TextCounter;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TextCounter);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
