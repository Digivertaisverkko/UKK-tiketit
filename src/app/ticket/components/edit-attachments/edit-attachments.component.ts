import {  ChangeDetectionStrategy, Component,  Input, Output, EventEmitter, OnInit,
          ViewChild, ElementRef, Renderer2, OnDestroy } from '@angular/core';
import { AbstractControl, ControlValueAccessor, NG_VALIDATORS,
    NG_VALUE_ACCESSOR, ValidationErrors, Validator } from '@angular/forms';
import { forkJoin, Observable, Subscription, tap, catchError, of } from 'rxjs';
import { TicketService } from '../../ticket.service';
import { FileInfo, Liite } from '../../ticket.models';

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

  constructor(private renderer: Renderer2,
              private ticketService: TicketService
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
      return this.ticketService.uploadFile(ticketID, commentID, fileinfo.file)
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
            // Koko upload loppuu kaikkien tiedostojen kohdalla jos *heitetään* virhe.
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

  public async sendFilesPromise(ticketID: string, commentID: string): Promise<any> {
    this.isEditingDisabled = true;
    this.userMessage = $localize `:@@Lähetetään liitetiedostoja:
        Lähetetään liitetiedostoja, odota hetki...`
    let requestArray = this.makeRequestArray(ticketID, commentID)
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
          console.log('sendFilesPromise: saatiin virhe: ' + error );
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
