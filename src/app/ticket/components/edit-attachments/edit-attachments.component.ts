import { AbstractControl, ControlValueAccessor, NG_VALIDATORS,
  NG_VALUE_ACCESSOR, ValidationErrors, Validator } from '@angular/forms';
import {  ChangeDetectionStrategy, Component,  Input, Output, EventEmitter, OnInit,
          ViewChild, ElementRef, Renderer2, OnDestroy } from '@angular/core';
import { forkJoin, Observable, Subscription, Subject } from 'rxjs';

import { TicketService } from '@ticket/ticket.service';
import { FileInfo, Liite } from '@ticket/ticket.models';
import { StoreService } from '@core/services/store.service';

interface FileInfoWithSize extends FileInfo {
  filesize: number;
}

@Component({
  selector: 'app-edit-attachments',
  templateUrl: './edit-attachments.component.html',
  styleUrls: ['./edit-attachments.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
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

export class EditAttachmentsComponent implements ControlValueAccessor, OnInit,
    OnDestroy, Validator {

  @Input() courseid: string = '';
  @Input() oldAttachments: Liite[] = [];
  @Input() ticketID: string | null = '';
  @Input() uploadClicks: Observable<string> = new Observable<string>();
  @Output() attachmentsMessages = new EventEmitter<'errors' | '' | 'done'>;
  @Output() fileListOutput = new EventEmitter<FileInfoWithSize[]>();
  @Output() isInvalid: boolean = false;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  public errors: ValidationErrors | null = null;
  public fileInfoList: FileInfoWithSize[] = [];
  public filesToRemove: Liite[] = [];
  public isEditingDisabled: boolean = false;
  public touched = false;
  public uploadClickSub = new Subscription();
  public userMessage: string = '';

  constructor(public renderer: Renderer2,
              private store: StoreService,
              private tickets: TicketService
              ) {
  }

  ngOnInit() {
    this.uploadClickSub = this.uploadClicks.subscribe(action => {
      if (action === 'add') {
        this.renderer.selectRootElement(this.fileInput.nativeElement).click();
      }
    });
  }

  ngOnDestroy(): void {
    this.uploadClickSub.unsubscribe();
  }

  public clear() {
    this.fileInfoList = [];
  }

  /* Palauttaa listan liitteen lähetyksiä, jotka päivittävät edistymisen ja
     virheen tapahtuessa asettavat virheviestin. */
  private makeRequestArray(ticketID: string, commentID: string):
      Observable<number>[] {
    return this.fileInfoList.map((fileinfo, index) => {
      const progress = new Subject<number>();
      this.tickets.uploadFile(ticketID, commentID, this.courseid, fileinfo.file)
        .subscribe({
          next: (value: number) => {
            this.fileInfoList[index].progress = value;
            progress.next(value);
          },
          error: (error: any) => {
            this.fileInfoList[index].uploadError = $localize
                `:@@Liitteen lähettäminen epäonnistui:Liitteen lähettäminen epäonnistui.`;
            progress.error(error);
          },
          complete: () => {
            progress.complete();
          }
        });
      return progress.asObservable();
    });
  }

  private markAsTouched() {
    if (!this.touched) {
      this.onTouched();
      this.touched = true;
    }
  }

  public onChange = (isInvalid: boolean) => {};

  public onFileAdded(event: any) {

    // console.dir(event.target.files);

    this.markAsTouched();
    this.onChange(this.isInvalid);
    const MEGABYTE = 1000000;
    for (let file of event.target.files) {
      if (this.fileInfoList.some(item => item.filename === file.name)) continue
      let filesizeNumber = Number(file.size);
      let fileinfo: FileInfoWithSize = {
        file: file,
        filename: file.name,
        filesize: filesizeNumber,
        progress: 0
      };
      if (file.size > this.store.getMAX_FILE_SIZE_MB() * MEGABYTE) {
        fileinfo.error = $localize `:@@Liian iso:Liian iso`;
        fileinfo.errorToolTip = $localize `:@@Tiedoston koko ylittää:
            Tiedoston koko ylittää ${this.store.getMAX_FILE_SIZE_MB} megatavun rajoituksen` + '.';
        this.isInvalid = true;
        this.errors = { size: 'overMax' };
        this.onChange(this.isInvalid);
      }
      this.fileInfoList.push(fileinfo);
      this.fileListOutput.emit(this.fileInfoList);
    }
  }

  public onTouched = () => {};

  public registerOnChange(onChange: any): void {
    this.onChange = onChange;
  }

  public registerOnTouched(onTouched: any): void {
    this.onTouched = onTouched;
  }

  public markToBeRemoved(index: number) {
    if (this.isEditingDisabled === true) return
    this.markAsTouched();
    this.filesToRemove.push(this.oldAttachments[index]);
    this.oldAttachments.splice(index, 1);
  }

  /* Kutsutaan parent componentista. Poistetaan tiedostot, jotka on aiemmin
      lähetetty ja joiden Poista-ikonia käyttäjä on klikannut. */
  public async removeSentFiles(): Promise<boolean> {
    return new Promise((resolve, reject) => {

      if (this.filesToRemove.length === 0) resolve(true);
      if (this.ticketID == null) {
        // throw Error(' ei ticketID:ä');
        reject(new Error('Ei tiketti ID:ä.'));
      }
      let promise: Promise<{ success: boolean }>;
      this.filesToRemove.forEach((file: Liite) => {
        if (!promise) {
          promise = this.tickets.removeFile(this.ticketID!, file.kommentti, file.tiedosto,
            this.courseid)
        } else {
          promise = promise.then(() => {
            return this.tickets.removeFile(this.ticketID!, file.kommentti, file.tiedosto,
              this.courseid)
          })
        }
      })
      promise!.then(() =>{
        resolve(true);
      }).catch((error: any) => {
        resolve(false);
      })
    })
  }

  public removeSelectedFile(index: number) {
    if (this.isEditingDisabled === true) return
    this.markAsTouched();
    this.fileInfoList.splice(index, 1);
    if (this.fileInfoList.some(item => item.error)) {
      this.attachmentsMessages.emit('errors');
      this.isInvalid = true;
      this.errors = { size: 'overMax' };
    } else {
      this.attachmentsMessages.emit('');
      this.isInvalid = false;
      this.errors = null;
    }
    this.onChange(this.isInvalid);
    this.fileListOutput.emit(this.fileInfoList);
  }

  // Kutsutaan parent komponentista.
  public async sendFiles(ticketID: string, commentID: string): Promise<any> {
    this.isEditingDisabled = true;
    this.userMessage = $localize `:@@Lähetetään liitetiedostoja:
        Lähetetään liitetiedostoja, odota hetki...`
    let requestArray: Observable<number>[] = this.makeRequestArray(ticketID, commentID);
    return new Promise((resolve, reject) => {
      forkJoin(requestArray).subscribe({
        next: (res: any) => {
          if (res.some((result: unknown) => result === 'error' )) {
            reject(res)
          } else {
            resolve(res)
          }
        },
        error: (error) => {
          reject('error')
        },
        complete: () => {
          this.sendingEnded();
        }
      });
    })
  }

  private sendingEnded(): void {
    this.isInvalid = false;
    this.errors = null;
    this.userMessage = '';
    this.isEditingDisabled = false;
  }

  public validate(control: AbstractControl): ValidationErrors | null {
    return this.isInvalid === true ? this.errors : null;
  }

  public writeValue(): void {}

}
