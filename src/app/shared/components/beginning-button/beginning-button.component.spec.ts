import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BeginningButtonComponent } from './beginning-button.component';

describe('ToBeginningButtonComponent', () => {
  let component: BeginningButtonComponent;
  let fixture: ComponentFixture<BeginningButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BeginningButtonComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BeginningButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
