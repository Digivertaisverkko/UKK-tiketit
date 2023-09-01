import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewAttachmentsComponent } from './view-attachments.component';
import { TicketService } from '@ticket/ticket.service';
import { ticketDummyData } from '@ticket/ticket.dummydata';
import { findEl } from '@shared/spec-helpers/element.spec-helper';
import { FilesizeModule } from '@shared/pipes/filesize.module';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';

fdescribe('AttachmentListComponent', () => {
  let component: ViewAttachmentsComponent;
  let fakeTicketService: Pick<TicketService, 'getFile'>;
  let fixture: ComponentFixture<ViewAttachmentsComponent>;

  beforeEach(async () => {
    fakeTicketService = jasmine.createSpyObj('TicketService', {
      getFile: Promise.resolve(new Blob)
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
    component.ticketID = '5';
    component.files = ticketDummyData.LiiteArray;
    fixture.detectChanges();
  });

  /*
  it('calls download method after clicking file name', () => {
    spyOn(component, 'downloadFile').and.stub();
    const downloadBtn = findEl(fixture, 'download-button-1').nativeElement;
    downloadBtn.click();
    expect(component.downloadFile).toHaveBeenCalled();
  });
  */

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
