import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubmitTicketComponent } from '../submit-ticket.component';

describe('SubmitTicketComponent', () => {
  let component: SubmitTicketComponent;
  let fixture: ComponentFixture<SubmitTicketComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SubmitTicketComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubmitTicketComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
