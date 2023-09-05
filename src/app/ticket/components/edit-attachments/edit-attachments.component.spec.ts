import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';

import { EditAttachmentsComponent } from './edit-attachments.component';
import { TicketService } from '@ticket/ticket.service';
import { ticketDummyData } from '@ticket/ticket.dummydata';
import { findEl } from '@shared/spec-helpers/element.spec-helper';
import { FilesizeModule } from '@shared/pipes/filesize.module';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { of } from 'rxjs';

describe('EditAttachmentsComponent', () => {
  let component: EditAttachmentsComponent;
  let courseID: string;

  let fakeTicketService: jasmine.SpyObj<TicketService>;
  let fixture: ComponentFixture<EditAttachmentsComponent>;

  beforeEach(async () => {
    fakeTicketService = jasmine.createSpyObj('TicketService', {
      uploadFile: Promise.resolve(of(100)),
      removeFile: Promise.resolve({ success: true })
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
    component.oldAttachments = [
      ticketDummyData.LiiteArray[0],
      ticketDummyData.LiiteArray[1]
    ];
    component.ticketID = '5';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shows already uploaded attachments', fakeAsync(() => {
    tick();
    const filename1 = findEl(fixture, 'filename-0').nativeElement;
    let expectedFile = ticketDummyData.LiiteArray[0];
    expect(filename1.textContent.trim()).toBe(expectedFile.nimi);

    const filename2 = findEl(fixture, 'filename-1').nativeElement;
    expectedFile = ticketDummyData.LiiteArray[1];
    expect(filename2.textContent.trim()).toBe(expectedFile.nimi);
  }));


  it('clicking remove-icon calls correct service method', fakeAsync(() => {
    const removeBtn = findEl(fixture, 'remove-file-btn-0').nativeElement;
    removeBtn.click();
    tick();
    component.removeSentFiles();
    tick();
    const file = ticketDummyData.LiiteArray[0];
    expect(fakeTicketService.removeFile).toHaveBeenCalledWith(
      component.ticketID!, file.kommentti, file.tiedosto, courseID
    );
  }));

});
