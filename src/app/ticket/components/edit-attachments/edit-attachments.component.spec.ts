import { ComponentFixture, TestBed, fakeAsync } from '@angular/core/testing';

import { EditAttachmentsComponent } from './edit-attachments.component';
import { TicketService } from '@ticket/ticket.service';
import { ticketDummyData } from '@ticket/ticket.dummydata';
import { findEl } from '@shared/spec-helpers/element.spec-helper';
import { FilesizeModule } from '@shared/pipes/filesize.module';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

describe('EditAttachmentsComponent', () => {
  let component: EditAttachmentsComponent;
  let courseID: string;

  let fakeTicketService: jasmine.SpyObj<TicketService>;
  let fixture: ComponentFixture<EditAttachmentsComponent>;

  beforeEach(async () => {
    fakeTicketService = jasmine.createSpyObj('TicketService', {
      uploadFile: undefined,
      removeFile: undefined
    });

    await TestBed.configureTestingModule({
      declarations: [ EditAttachmentsComponent ],
      imports: [
        FilesizeModule,
        MatIconModule,
        MatTooltipModule
      ],
      providers: [
        { provide: TicketService, useValue: fakeTicketService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditAttachmentsComponent);
    component = fixture.componentInstance;
    courseID = '1';
    component.courseid = courseID;
    component.oldAttachments = ticketDummyData.LiiteArray;
    component.ticketID = '5';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shows already uploaded attachments', () => {
    const filename1 = findEl(fixture, 'filename-0').nativeElement;
    let expectedFile = ticketDummyData.LiiteArray[0];
    expect(filename1.textContent.trim()).toBe(expectedFile.nimi);

    const filename2 = findEl(fixture, 'filename-1').nativeElement;
    expectedFile = ticketDummyData.LiiteArray[1];
    expect(filename2.textContent.trim()).toBe(expectedFile.nimi);
  });
  
});
