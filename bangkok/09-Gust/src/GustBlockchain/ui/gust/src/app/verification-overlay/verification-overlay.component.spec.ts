import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerificationOverlayComponent } from './verification-overlay.component';

describe('VerificationOverlayComponent', () => {
  let component: VerificationOverlayComponent;
  let fixture: ComponentFixture<VerificationOverlayComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [VerificationOverlayComponent]
    });
    fixture = TestBed.createComponent(VerificationOverlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
