import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocsDisplayComponent } from './docs-display.component';

describe('DocsDisplayComponent', () => {
  let component: DocsDisplayComponent;
  let fixture: ComponentFixture<DocsDisplayComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DocsDisplayComponent]
    });
    fixture = TestBed.createComponent(DocsDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
