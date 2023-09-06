import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { findEl } from '@shared/spec-helpers/element.spec-helper';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NG_VALIDATORS, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Subject } from 'rxjs';

import { EditAttachmentsComponent } from './edit-attachments.component';
import { ErrorService } from '@core/services/error.service';
import { FilesizeModule } from '@shared/pipes/filesize.module';
import { StoreService } from '@core/services/store.service';
import { ticketDummyData } from '@ticket/ticket.dummydata';
import { TicketService } from '@ticket/ticket.service';

describe('EditAttachmentsComponent', () => {
  let component: EditAttachmentsComponent;
  let courseID: string;

  //let fakeInputElement: HTMLInputElement;
  let fakeTicketService: jasmine.SpyObj<TicketService>;
  let fixture: ComponentFixture<EditAttachmentsComponent>;

  beforeEach(async () => {
    fakeTicketService = jasmine.createSpyObj('TicketService', {
      removeFile: Promise.resolve({ success: true }),
      uploadFile: () => {
        const progress = new Subject<number>();

        for (let i = 0; i <= 100; i += 10) {
          setTimeout(() => {
            progress.next(i);
          }, i * 10); // Lähetetään joka 100ms progress arvo.
        }

        setTimeout(() => {
          progress.complete();
        }, 1000);

        return progress.asObservable();
      }
  });

    await TestBed.configureTestingModule({
      declarations: [ EditAttachmentsComponent ],
      imports: [
        FilesizeModule,
        MatIconModule,
        MatTooltipModule
      ],
      providers: [
        { provide: TicketService, useValue: fakeTicketService },
        { provide: StoreService },
        { provide: ErrorService },
        {
          provide: NG_VALUE_ACCESSOR,
          multi: true,
          useExisting: EditAttachmentsComponent
        },
        {
          provide: NG_VALIDATORS,
          multi: true,
          useExisting: EditAttachmentsComponent
        }
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

    /*
    fakeInputElement = document.createElement('input');
    fakeInputElement.type = 'file';
    fakeInputElement.style.display = 'none'; // Hide the element
    document.body.appendChild(fakeInputElement);
    */

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

  it('adds new attachments to list using file input', fakeAsync(() => {

    const fakeFile1 = new File(['file content'], 'fake-file-1.txt',
        { type: 'text/plain' });
    const fakeFile2 = new File(['file content'], 'fake-file-2.txt',
        { type: 'text/plain',});
    const fileSize1 = 1024;
    const fileSize2 = 2048;
    Object.defineProperty(fakeFile1, 'size', { value: fileSize1 });
    Object.defineProperty(fakeFile2, 'size', { value: fileSize2 });

    const fakeFiles = [fakeFile1, fakeFile2];

    const fakeFileList = new DataTransfer();
    fakeFiles.forEach((file, index) => {
      fakeFileList.items.add(new File([file],
          `fake-file-${index + 1}.txt`,
          { type: 'text/plain' }));
    });

    const changeEvent = new Event('change', { bubbles: true });
    Object.defineProperty(changeEvent, 'target', {
      value: {
        files: fakeFileList.files,
      },
    });

    spyOn(component, 'onFileAdded').and.callThrough();

    const nativeFileInput = component.fileInput.nativeElement as HTMLInputElement;
    nativeFileInput.dispatchEvent(changeEvent);

    fixture.detectChanges();

    const filename1 = findEl(fixture, 'new-filename-0').nativeElement;
    expect(filename1.textContent.trim()).toBe(fakeFile1.name);

    // Expect your component's method to have been called with the fake FileList
    expect(component.onFileAdded).toHaveBeenCalledWith(changeEvent);
  }));


});
