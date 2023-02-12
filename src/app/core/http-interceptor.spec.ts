import { TestBed } from '@angular/core/testing';

import { CustomHttpInterceptor } from './http-interceptor';

describe('HttpInterceptorService', () => {
  let service: CustomHttpInterceptor;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CustomHttpInterceptor);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
