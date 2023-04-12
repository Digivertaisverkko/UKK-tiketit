import {  Component, Input, Output, EventEmitter, OnInit,
          ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { forkJoin, Observable, pipe, map, tap, catchError, of } from 'rxjs';
import { TicketService, Liite } from '../../ticket.service';

// 'error' tarkoittaa virhettä tiedoston valitsemisvaiheessa, uploadError
// lähetysvaiheessa.
interface FileInfo {
  filename: string;
  file: File;
  filesize: number;
  error?: string;
  errorToolTip?: string;
  progress?: number;
  uploadError?: string;
  done?: boolean;
}

@Component({
  selector: 'app-edit-attachments',
  template: `
    <!-- Ei näytetä käyttäjällä, koska näytetään muotoiltu nappi tämän sijaan. -->
    <input  aria-disabled="true"
            (change)="onFileChanged($event)"
            class="file-input"
            #fileUpload
            #fileInput
            multiple
            type="file"
    >

    <!-- <input type="file" class="file-input" id="file-input-{{url}}" multiple
      name="file-input-{{url}}"
      (change)="onFileChanged($event)" #fileUpload> -->

    <p class="status-message-p" *ngIf="userMessage">{{userMessage}}</p>

    <div class="vertical-spacer"></div>

    <!-- Aiemmin lähetetyt liitteet ------------------------------------------->

    <div class="file-list" *ngIf="oldAttachments.length > 0">
      <div  class="file-list-row"
            *ngFor="let file of oldAttachments; let index = index"
            >
        <div class="list-item">
          <span class="filename"
                matTooltip="{{file.nimi}}"
                [matTooltipShowDelay]="600"
                >
            {{file.nimi}}
          </span>
        </div>
      </div>
    </div>

    <!--- Uudet liitteet ------------------------------------------------------>

    <div class="file-list" *ngIf="fileInfoList !== null">
      <div  class="file-list-row"
            *ngFor="let file of fileInfoList; let index = index"
            >

        <div class="list-item">

          <span class="filename"
                matTooltip="{{file.filename}}"
                [matTooltipShowDelay]="600"
                >
            {{file.filename}}
          </span>
          <span class="in-brackets">
            (
              <span *ngIf="oldAttachments.length > 0">{{new}}</span>
              <span>{{file.filesize | filesize }}</span>
            )
          </span>
          <div  class="file-error-message"
                matError
                matTooltip="{{file?.errorToolTip}}"
                [matTooltipShowDelay]="600"
                *ngIf="file.error"
                >
              <mat-icon>warning</mat-icon>{{file.error}}
          </div>

          <button class="remove-file-button"
                  (click)="removeSelectedFile(index)"
                  [disabled]="isEditingDisabled"
                  mat-icon-button
                  >
            <mat-icon>close</mat-icon>
          </button>
        </div>

        <mat-icon class="ok-icon" *ngIf="file.progress === 100 && !file.uploadError">
          done
        </mat-icon>
        <mat-icon class="error-icon" *ngIf="file.uploadError">error</mat-icon>
        <span *ngIf="file.uploadError">{{file.uploadError}}</span>
        <mat-progress-bar
            mode="determinate"
            *ngIf="file.progress && !file.uploadError"
            [value]="file.progress"
            >
        </mat-progress-bar>
      </div>
    </div>`,
  styleUrls: ['./edit-attachments.component.scss']
})

export class EditAttachmentsComponent implements OnInit {

  @Input() oldAttachments: Liite[] = [];
  @Input() uploadClicks: Observable<string> = new Observable();
  @Output() attachmentsMessages = new EventEmitter<'faulty' | 'errors' | '' | 'done'>;
  @Output() fileListOutput = new EventEmitter<FileInfo[]>();
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  public fileInfoList: FileInfo[] = [];
  public isEditingDisabled: boolean = false;
  public readonly MAX_FILE_SIZE_MB=100;
  public readonly new: string = $localize `:@@uusi:uusi` + ", ";
  public noAttachmentsMessage = $localize `:@@Ei liitetiedostoa:Ei liitetiedostoa` + '.';
  public userMessage: string = '';

  constructor(private ticketService: TicketService,
              private renderer: Renderer2
              ) {
  }

  ngOnInit() {
    console.log('files: ' + JSON.stringify(this.oldAttachments));
    // const element: HTMLElement = document.querySelector() as HTMLElement;
    this.uploadClicks.subscribe(action => {
      if (action === 'add') {
        this.renderer.selectRootElement(this.fileInput.nativeElement).click();
      }
    });
  }

  public clear() {
    this.fileInfoList = [];
  }

  private makeRequestArray(ticketID: string, commentID: string): any {
    return this.fileInfoList.map((fileinfo, index) => {
      return this.ticketService.newUploadFile(ticketID, commentID, fileinfo.file)
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
            // Koko upload loppuu kaikkien tiedostojen kohdalla jos heitetään virhe.
            return of('error');
            // return throwError( () => new Error(error) );
          })
        )
    });
  }

  public onFileChanged(event: any) {
    console.log('edit-attachments: event saatu.');
    const MEGABYTE = 1000000;
    for (let file of event.target.files) {
      if (this.fileInfoList.some(item => item.filename === file.name)) continue
      let filesizeNumber = Number(file.size);
      let fileinfo: FileInfo = {
        file: file,
        filename: file.name,
        filesize: filesizeNumber,
        progress: 0
      };
      if (file.size > this.MAX_FILE_SIZE_MB * MEGABYTE) {
        fileinfo.error = $localize `:@@Liian iso:Liian iso`;
        fileinfo.errorToolTip = $localize `:@@Tiedoston koko ylittää:
            Tiedoston koko ylittää
        ${this.MAX_FILE_SIZE_MB} megatavun rajoituksen` + '.';
        this.attachmentsMessages.emit('faulty');
      }
      this.fileInfoList.push(fileinfo);
      this.fileListOutput.emit(this.fileInfoList);
    }
  }

  public removeSelectedFile(index: number) {
    // this.fileList.splice(index, 1);
    this.fileInfoList.splice(index, 1);
    if (this.fileInfoList.some(item => item.error)) {
      this.attachmentsMessages.emit('errors');
    } else {
      this.attachmentsMessages.emit('');
    }
    this.fileListOutput.emit(this.fileInfoList);
  }

  public async sendFilesPromise(ticketID: string, commentID: string): Promise<any> {
    this.isEditingDisabled = true;
    let requestArray = this.makeRequestArray(ticketID, commentID)
    return new Promise((resolve, reject) => {
      forkJoin(requestArray).subscribe({
        next: (res: any) => {
          console.log('sendFilesPromise: saatiin vastaus: ' + res );
          if (res.some((result: unknown) => result === 'error' )) {
            reject(res)
          } else {
            resolve(res)
          }
        },
        error: (error) => {
          console.log('sendFilesPromise: saatiin virhe: ' + error );
          reject('error')
        }
      });
    })
  }

}
