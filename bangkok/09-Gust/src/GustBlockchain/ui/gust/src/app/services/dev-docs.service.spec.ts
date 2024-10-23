import { TestBed } from '@angular/core/testing';

import { DevDocsService } from './dev-docs.service';

describe('DevDocsService', () => {
  let service: DevDocsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DevDocsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
