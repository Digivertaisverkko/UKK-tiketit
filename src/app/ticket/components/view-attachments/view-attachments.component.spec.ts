import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';

import { ViewAttachmentsComponent } from './view-attachments.component';
import { TicketService } from '@ticket/ticket.service';
import { ticketDummyData } from '@ticket/ticket.dummydata';
import { findEl } from '@shared/spec-helpers/element.spec-helper';
import { FilesizeModule } from '@shared/pipes/filesize.module';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';

describe('AttachmentListComponent', () => {
  let component: ViewAttachmentsComponent;
  let courseID: string;
  let fakeTicketService: Pick<TicketService, 'getFile'>;
  let fixture: ComponentFixture<ViewAttachmentsComponent>;

  beforeEach(async () => {
    fakeTicketService = jasmine.createSpyObj('TicketService', {
      getFile: Promise.resolve(undefined)
    });

    await TestBed.configureTestingModule({
      declarations: [
        ViewAttachmentsComponent
      ],
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

    fixture = TestBed.createComponent(ViewAttachmentsComponent);
    component = fixture.componentInstance;
    courseID = '1';
    component.courseid = courseID;
    component.ticketID = '5';
    component.files = ticketDummyData.LiiteArray;
    fixture.detectChanges();
  });

  it('calls correct service method after clicking file name', fakeAsync(() => {
    const commentID = ticketDummyData.LiiteArray[1].kommentti;
    const fileID = ticketDummyData.LiiteArray[1].tiedosto;
    findEl(fixture, 'download-button-1').nativeElement.click();
    tick();

    expect(fakeTicketService.getFile).toHaveBeenCalledWith(component.ticketID,
        commentID, fileID, courseID);
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shows attachment names', () => {
    const filename1 = findEl(fixture, 'filename-0').nativeElement;
    let expectedFile = ticketDummyData.LiiteArray[0];
    expect(filename1.textContent.trim()).toBe(expectedFile.nimi);

    const filename2 = findEl(fixture, 'filename-1').nativeElement;
    expectedFile = ticketDummyData.LiiteArray[1];
    expect(filename2.textContent.trim()).toBe(expectedFile.nimi);
  });
});
