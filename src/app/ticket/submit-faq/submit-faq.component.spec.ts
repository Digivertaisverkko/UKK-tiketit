import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubmitFaqComponent } from './submit-faq.component';

describe('SubmitFaqComponent', () => {
  let component: SubmitFaqComponent;
  let fixture: ComponentFixture<SubmitFaqComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SubmitFaqComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubmitFaqComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
