import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeveloperComponent } from './developer.component';

describe('DeveloperComponent', () => {
  let component: DeveloperComponent;
  let fixture: ComponentFixture<DeveloperComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DeveloperComponent]
    });
    fixture = TestBed.createComponent(DeveloperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
