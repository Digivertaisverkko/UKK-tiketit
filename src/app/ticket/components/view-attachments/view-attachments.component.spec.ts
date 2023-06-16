import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewAttachmentsComponent } from './view-attachments.component';
import { TicketService } from '@ticket/ticket.service';

describe('AttachmentListComponent', () => {
  let component: ViewAttachmentsComponent;
  let fakeTicketService: jasmine.SpyObj<TicketService>;
  let fixture: ComponentFixture<ViewAttachmentsComponent>;

  beforeEach(async () => {
    fakeTicketService = jasmine.createSpyObj('TicketService', {
      getFile: undefined
    });

    await TestBed.configureTestingModule({
      declarations: [ ViewAttachmentsComponent ],
      providers: [
        { provide: TicketService, useValue: fakeTicketService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewAttachmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
