import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ToBeginningButtonComponent } from './to-beginning-button.component';

describe('ToBeginningButtonComponent', () => {
  let component: ToBeginningButtonComponent;
  let fixture: ComponentFixture<ToBeginningButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ToBeginningButtonComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ToBeginningButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
