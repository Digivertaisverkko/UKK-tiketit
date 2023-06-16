import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditAttachmentsComponent } from './edit-attachments.component';
import { TicketService } from '@ticket/ticket.service';

describe('EditAttachmentsComponent', () => {
  let component: EditAttachmentsComponent;
  let fakeTicketService: jasmine.SpyObj<TicketService>;
  let fixture: ComponentFixture<EditAttachmentsComponent>;

  beforeEach(async () => {
    fakeTicketService = jasmine.createSpyObj('TicketService', {
      uploadFile: undefined,
      removeFile: undefined
    });

    await TestBed.configureTestingModule({
      declarations: [ EditAttachmentsComponent ],
      providers: [
        { provide: TicketService, useValue: fakeTicketService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditAttachmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
