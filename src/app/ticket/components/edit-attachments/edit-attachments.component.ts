import { ChangeDetectionStrategy, Component, Input, Output, EventEmitter, OnInit, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { forkJoin, Observable, pipe, map, tap, catchError, of, throwError } from 'rxjs';
import { HttpEvent, HttpEventType } from '@angular/common/http';
import { TicketService } from '../../ticket.service';
import { throwToolbarMixedModesError } from '@angular/material/toolbar';
import { Resolve } from '@angular/router';

// 'error' tarkoittaa virhettä tiedoston valitsemisvaiheessa, uploadError lähetysvaiheessa.
interface FileInfo {
  filename: string;
  file: File;
  error?: string;
  errorToolTip?: string;
  progress?: number;
  uploadError?: string;
  done?: boolean;
}

@Component({
  selector: 'app-edit-attachments',
  template: `
    <input type="file" class="file-input" #fileInput multiple (change)="onFileChanged($event)" #fileUpload>

    <!-- <input type="file" class="file-input" id="file-input-{{url}}" multiple name="file-input-{{url}}"
      (change)="onFileChanged($event)" #fileUpload> -->

    <p class="status-message-p" *ngIf="userMessage">{{userMessage}}</p>

    <div class="file-list-wrapper" *ngIf="fileInfoList !== null">
      <div class="file-list-row" *ngFor="let file of fileInfoList; let index = index">

        <div class="list-item">
          <span class="filename" matTooltip="{{file.filename}}" [matTooltipShowDelay]="600">
            {{file.filename}}</span>
          <div class="file-error-message" matError *ngIf="file.error" matTooltip="{{file?.errorToolTip}}"
            [matTooltipShowDelay]="600"><mat-icon>warning</mat-icon>{{file.error}}
          </div>

          <button mat-icon-button [disabled]="isEditingDisabled" class="remove-file-button"
            (click)="removeSelectedFile(index)">
            <mat-icon>close</mat-icon>
          </button>
        </div>
        <mat-icon class="ok-icon" *ngIf="file.progress === 100 && !file.uploadError">done</mat-icon>
        <mat-icon class="error-icon" *ngIf="file.uploadError">error</mat-icon>
        <span *ngIf="file.uploadError">{{file.uploadError}}</span>
        <mat-progress-bar [value]="file.progress" *ngIf="file.progress && !file.uploadError"
          mode="determinate" value=100 >
        </mat-progress-bar>
      </div>
    </div>`,
  styleUrls: ['./edit-attachments.component.scss']
})

export class EditAttachmentsComponent implements OnInit {

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @Output() fileListOutput = new EventEmitter<FileInfo[]>();
  @Input() uploadClicks: Observable<string> = new Observable();
  // @Input() fileListInput

  @Output() attachmentsMessages = new EventEmitter<'faulty' | 'errors' | '' | 'done'>;
  // public fileList: File[] = [];
  public fileInfoList: FileInfo[] = [];
  public isEditingDisabled: boolean = false;
  public readonly MAX_FILE_SIZE_MB=100;
  public userMessage: string = '';
  public state: 'adding' | 'sending' | 'done' = 'adding';
  // public url: string = '';
  // public fileNameList: string[] = [];
  public noAttachmentsMessage = $localize `:@@Ei liitetiedostoa:Ei liitetiedostoa` + '.';

  constructor(private ticketService: TicketService,
    private renderer: Renderer2) {
  }

  ngOnInit() {
    // const element: HTMLElement = document.querySelector() as HTMLElement;
    this.uploadClicks.subscribe(action => {
      if (action === 'add') {
        this.renderer.selectRootElement(this.fileInput.nativeElement).click();
      }
    });
  }

  public clear() {
    this.fileInfoList = [];
    // this.fileList = [];
  }

  public onFileChanged(event: any) {
    console.log('edit-attachments: event saatu.');
    const MEGABYTE = 1000000;
    for (let file of event.target.files) {
      if (this.fileInfoList.some(item => item.filename === file.name)) continue
      let fileinfo: FileInfo = { file: file, filename: file.name, progress: 0 };
      if (file.size > this.MAX_FILE_SIZE_MB * MEGABYTE) {
        fileinfo.error = $localize `:@@Liian iso:Liian iso`;
        fileinfo.errorToolTip = $localize `:@@Tiedoston koko ylittää:Tiedoston koko ylittää
          ${this.MAX_FILE_SIZE_MB} megatavun rajoituksen` + '.';
        this.attachmentsMessages.emit('faulty');
      }
      // this.fileList.push(file);
      // console.log('saatiin fileinfo (alla):');
      // console.dir(fileinfo);
      // console.log('koko lista:');
      // console.dir(this.fileInfoList);
      this.fileInfoList.push(fileinfo);
      this.fileListOutput.emit(this.fileInfoList);
      // console.log('fileinfolist ' + JSON.stringify(this.fileInfoList));
      // console.log('filelist:');
      // console.dir(this.fileList);
    }
  }

  private makeRequestChain(ticketID: string, commentID: string): any {
    return this.fileInfoList.map((fileinfo, index) => {
        return this.ticketService.newUploadFile(ticketID, commentID, fileinfo.file).pipe(
          // return this.ticketService.uploadError(ticketID, commentID, fileinfo.file).pipe(
          tap(progress => {
            console.log('saatiin event (alla) tiedostolle ('+ fileinfo.filename + '): ' + progress);
            this.fileInfoList[index].progress = progress;
            // console.dir(event)
            // if (event.type === HttpEventType.UploadProgress) {
            //   this.fileInfoList[index].progress = Math.round(100 * event.loaded / event.total);
            // }
          }),
          catchError((error: any) => {
            console.log('makeRequestChain: catchError: error napattu');
            // console.log(' errorin index: ');
            // console.log(fileinfo);
            // Tämä virhe tulee vain 1. tiedoston kohdalla.
            console.log('indeksi: ' + index);
            this.fileInfoList[index].uploadError = $localize `:@@Liitteen lähettäminen epäonnistui:Liitteen lähettäminen epäonnistui.`;
            return of('error');
            // return throwError( () => new Error(error) );
          })
        )
    });
  }

  // public sendFiles(ticketID: string, commentID: string): Observable<any> {
  //   forkJoin(uploadObservables)
  //     .pipe(
  //       map(results => {
  //         console.log('forkjoin: saatiin tulokset:');
  //         return results
  //       })
  //     );
  // }

  public async sendFilesPromise(ticketID: string, commentID: string): Promise<any> {
    this.isEditingDisabled = true;
    let requestChain = this.makeRequestChain(ticketID, commentID)
    return new Promise((resolve, reject) => {
      forkJoin(requestChain).subscribe({
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

  public sendFiles(ticketID: string, commentID: string) {
    this.isEditingDisabled = true;
    let requestChain = this.makeRequestChain(ticketID, commentID)
  //   .pipe(result:any) => {
  //     if (this.fileInfoList.some(fileInfo => fileInfo.uploadError)) {
  //       return throwError( () => new Error(result) );
  //     }
  //     return of(result)
  //   }
  // );
    return forkJoin(requestChain)
  }

 /*  public sendFiles(ticketID: string, commentID: string): Promise<boolean> {
    this.isEditingDisabled = true;
    this.userMessage = $localize `:@@ähetetään liitetiedostoja:Lähetetään liitetiedostoja, ole hyvä ja odota hetki...`;
    // Koko transaktio.
    return new Promise((resolve, reject) => {
      console.log('edit-attachments: ticketID: ' + ticketID + ' commentID: ' + commentID);
      for (let [index, file] of this.fileInfoList.entries()) {
          this.ticketService.uploadFile(ticketID, commentID, file).subscribe({
          next: (progress) => {
            // Progress barin päivitys.
            if (progress > 0 && this.fileInfoList[index]) this.fileInfoList[index].progress = progress;
            if (progress === 100) this.fileInfoList[index].done = true;
          },
          error: (error) => {
            this.fileInfoList[index].done = true;
            console.log('saatiin virhe: ' + error);
            this.attachmentsMessages.emit('errors');
            console.error('tämä epäonnistui: ' + this.fileInfoList[index].filename);
            this.fileInfoList[index].uploadError = "Tiedoston lähettäminen ei onnistunut.";
          },
          complete: () => {
            console.log('Tiedosto valmis!');
            // if (progress?.success) {
              this.fileInfoList[index].done = true;
              // if (progress.success == true) {
              //   console.log('Tämä onnistui: '+ this.fileInfoList[index].filename);
              // } else {
              //   console.log('Tämä epäonnistui: '+ this.fileInfoList[index].filename);
              // }
              // Jos kaikki valmista.
              for (let file of this.fileInfoList) {
                console.log('Tiedosto: ' + file.filename + '  valmis? ' + file.done ?? '');
              }
              if (this.fileInfoList.every(fileinfo => {
                fileinfo?.done === true || fileinfo.progress == 100
              })) {
                console.log('kaikki lähetetty');
                this.userMessage = "Valmista!";
                if (this.fileInfoList.some(fileinfo => fileinfo.uploadError)) {
                  this.userMessage += ' Kaikkien tiedostojen lähettäminen ei onnistunut.';
                  this.attachmentsMessages.emit('errors');
                } else {
                  this.attachmentsMessages.emit('done');
                }
              }
            // }
          }
        }); // Subscribe
      }  // For
    }) // Promise
  } */

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

}
