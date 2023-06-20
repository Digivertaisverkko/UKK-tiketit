import {  ChangeDetectionStrategy, Component,  Input, Output, EventEmitter, OnInit,
          ViewChild, ElementRef, Renderer2, OnDestroy } from '@angular/core';
import { AbstractControl, ControlValueAccessor, NG_VALIDATORS,
    NG_VALUE_ACCESSOR, ValidationErrors, Validator } from '@angular/forms';
import { forkJoin, Observable, Subscription, tap, catchError, of } from 'rxjs';
import { TicketService } from '@ticket/ticket.service';
import { FileInfo, Liite } from '@ticket/ticket.models';
import { getCourseIDfromURL } from '@shared/utils';

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

  @Input() oldAttachments: Liite[] = [];
  @Input() uploadClicks = new Observable();
  @Input() ticketID?: string | null = '';
  @Output() attachmentsMessages = new EventEmitter<'errors' | '' | 'done'>;
  @Output() fileListOutput = new EventEmitter<FileInfoWithSize[]>();
  @Output() isInvalid: boolean = false;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  public errors: ValidationErrors | null = null;
  public fileInfoList: FileInfoWithSize[] = [];
  public isEditingDisabled: boolean = false;
  public readonly MAX_FILE_SIZE_MB=100;
  public touched = false;
  public uploadClickSub = new Subscription();
  public userMessage: string = '';
  public filesToRemove: Liite[] = [];

  constructor(private renderer: Renderer2,
              private tickets: TicketService
              ) {
  }

  ngOnInit() {
    // const element: HTMLElement = document.querySelector() as HTMLElement;
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

  private makeRequestArray(ticketID: string, commentID: string): any {
    return this.fileInfoList.map((fileinfo, index) => {
      const courseID = getCourseIDfromURL();
      if (!courseID) {
        console.error('makeRequestArray: Ei kurssi ID:ä.');
        return
      }
      return this.tickets.uploadFile(ticketID, commentID, courseID, fileinfo.file)
        .pipe(
          tap(progress => {
            console.log('saatiin event (alla) tiedostolle ('+ fileinfo.filename +'): ' +
                progress);
            this.fileInfoList[index].progress = progress;
          }),
          catchError((error: any) => {
            console.log('makeRequestChain: catchError: error napattu');
            this.fileInfoList[index].uploadError = $localize `:@@Liitteen
                lähettäminen epäonnistui:Liitteen lähettäminen epäonnistui.`;
            /* Virhettä ei heitetä, koska silloin tiedostojen lähetys loppuu
              yhteen virheeseen. */
            return of('error');
          })
        )
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
      if (file.size > this.MAX_FILE_SIZE_MB * MEGABYTE) {
        fileinfo.error = $localize `:@@Liian iso:Liian iso`;
        fileinfo.errorToolTip = $localize `:@@Tiedoston koko ylittää:
            Tiedoston koko ylittää ${this.MAX_FILE_SIZE_MB} megatavun rajoituksen` + '.';
        this.isInvalid = true;
        this.errors = { size: 'overMax' };
        this.onChange(this.isInvalid);
        console.log('this.isInvalid: ' + this.isInvalid + ", this.errors: " + this.errors);
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
    console.log('tullaan poistamaan:');
    console.dir(this.filesToRemove);
  }

  /* Lähetä poistopyyntö poistettavaksi merkityistä, aiemmin lähetetyistä tiedostoista.
    Palauttaa true jos kaikki tiedostot poistettiin onnistuneesti, false jos
    mikä tahansa epäonnistui. */
  public removeSentFiles(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      console.log('pitäisi poistaa:');
      if (this.filesToRemove.length === 0) reject(false);
      let success: boolean = true;
      if (!this.ticketID) {
        throw Error('Ei tiketti ID:ä.');
      }
      const courseID = getCourseIDfromURL();
      if (!courseID) console.error('course id: ' + courseID);
      for (let file of this.filesToRemove) {
          console.log('yritetään poistaa: ' + file.tiedosto);
          this.tickets.removeFile(this.ticketID, file.kommentti, file.tiedosto,
              courseID!).then(res => {
            if (res.success === false) {
              success = false;
            }
        }).catch (err => {
          console.log(err);
          success = false;
          console.log('asetetaan success false');
        })
      }
      resolve(success);
    })
  }

  public async thirdRemoveSentFiles(): Promise<boolean> {
    const courseID = getCourseIDfromURL();
    if (!courseID || !this.ticketID) {
      console.error('course id: ' + courseID + ' ticketID: ' + this.ticketID);
    }
    const removalPromises = this.filesToRemove.map((liite: Liite) =>
    this.tickets.removeFile(this.ticketID!, liite.kommentti, liite.tiedosto,
      courseID!)
    );

    try {
      const results = await Promise.all(removalPromises);
      const allSucceeded = results.every(result => result.success);
      console.log('resulst: ' + results);
      console.log('allCucceeded: ' + allSucceeded);
      return allSucceeded;
    } catch (error) {
      console.log('epäonnistuttiin Promise.all')
      return false;
    }
  }

  public async fourthRemoveSentFiles(): Promise<boolean> {
    if (this.filesToRemove.length === 0) throw new Error('No files to remove.');
    const courseID = getCourseIDfromURL();
    if (!courseID) console.error('course id: ' + courseID);
    if (!this.ticketID) throw new Error('No ticket ID.');
  
    try {
      const results = await Promise.all(
        this.filesToRemove.map(file =>
          this.tickets.removeFile(this.ticketID!, file.kommentti, file.tiedosto, courseID!)
            .then(res => res.success)
            .catch(() => false)
        )
      );
      const success = results.every(result => result === true);
      return success;
    } catch (error) {
      console.error('secondRemoveSentFiles.catch: error: ' + error);
      return false;
    }
  }


  public async secondRemoveSentFiles(): Promise<boolean> {
    console.log(1);
  return new Promise((resolve, reject) => {
    console.log(2);
    if (this.filesToRemove.length === 0) {
      console.log('edit-attachments: ei poistettavia tiedostoja.')
      reject(false);
    }
      const courseID = getCourseIDfromURL();
    if (!courseID) console.error('course id: ' + courseID);
    if (this.ticketID === null || this.ticketID === undefined) {
      throw Error(' ei ticketID:ä');
      // reject(new Error('Ei tiketti ID:ä.'));
    }

    let promise: any = null;
    this.filesToRemove.forEach((file) => {
      if (promise === null) {
        promise = this.tickets.removeFile(this.ticketID!, file.kommentti, file.tiedosto,
          courseID!)
      } else {
      promise = promise.then(() => {
        return this.tickets.removeFile(this.ticketID!, file.kommentti, file.tiedosto,
          courseID!)
        })
      } 
    })

    promise.then(() =>{
      resolve(true);
    } )
    .catch((error: any) => {
      resolve(false);
    })
/*
    console.dir(this.filesToRemove);
    const promises = this.filesToRemove.map(file => {
        console.log(JSON.stringify(file));
        return this.tickets.removeFile(this.ticketID!, file.kommentti, file.tiedosto,
            courseID!)
          .then(res => {
            console.log('res : ' + res);
            return res.success
          })
          .catch((err) => {
              console.log('err: ' + err);
            return false
          });
    });
    console.log(3);

    for (let promise of promises) {
      console.log(promise instanceof Promise === true)
    }

    Promise.all(promises).then(results => {
      console.log(4);
      // console.log('promises: ' + JSON.stringify(promises));
      //   const success = results.every(result => result === true);
      resolve(true);
      // resolve(success);
      }).catch(() => {
        console.log(5);
          resolve(false)
      });
  });
  */
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
    let requestArray = this.makeRequestArray(ticketID, commentID);
    return new Promise((resolve, reject) => {
      forkJoin(requestArray).subscribe({
        next: (res: any) => {

          let errorsWithRemove: boolean = false;

          console.log('this.filesToRemove.length: ' + this.filesToRemove.length);

          if (this.filesToRemove.length > 0 ) {
            this.removeSentFiles().then(res => {
              if (!res) errorsWithRemove = true;
            }).catch(err => { 
              errorsWithRemove = true;
            })
          }

          if (res.some((result: unknown) => result === 'error' )) {
            reject(res)
          } else {
            resolve(res)
          }
        },
        error: (error) => {
          console.log('edit-attachments.sendFiles: saatiin virhe: ' + error );
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
