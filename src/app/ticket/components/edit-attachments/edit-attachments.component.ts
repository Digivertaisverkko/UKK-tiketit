import { ChangeDetectionStrategy, Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpEvent, HttpEventType } from '@angular/common/http';
import { TicketService } from '../../ticket.service';
import { throwToolbarMixedModesError } from '@angular/material/toolbar';
import { Resolve } from '@angular/router';

interface FileInfo {
  filename: string;
  error?: string;
  errorToolTip?: string;
  progress?: number;
  uploadError?: string;
  done?: boolean;
}

@Component({
  selector: 'app-edit-attachments',
  template: `
    <input type="file" class="file-input" multiple (change)="onFileChanged($event)" #fileUpload>

    <!-- <input type="file" class="file-input" id="file-input-{{url}}" multiple name="file-input-{{url}}"
      (change)="onFileChanged($event)" #fileUpload> -->

    <p class="status-message-p" *ngIf="userMessage">{{userMessage}}</p>

    <div class="file-list-wrapper" *ngIf="fileList !== null">
      <div class="file-list-row" *ngFor="let file of fileInfoList; let index = index">

        <div class="list-item">
          <span class="filename" matTooltip="{{file.filename}}" [matTooltipShowDelay]="600">
            {{file.filename}}</span>
          <div class="file-error-message" matError *ngIf="file.error" matTooltip="{{file?.errorToolTip}}"
            [matTooltipShowDelay]="600"><mat-icon>warning</mat-icon>{{file.error}}
          </div>

          <button mat-icon-button [disabled]="state !== 'adding'" class="remove-file-button"
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

  @Output() fileListOutput = new EventEmitter<File[]>();
  @Input() uploadClicks: Observable<string> = new Observable();
  // @Input() fileListInput

  @Output() attachmentsMessages = new EventEmitter<boolean>;
  public fileList: File[] = [];
  public fileInfoList: FileInfo[] = [];
  public readonly MAX_FILE_SIZE_MB=100;
  public userMessage: string = '';
  public state: 'adding' | 'sending' | 'done' = 'adding';
  // public url: string = '';
  // public fileNameList: string[] = [];
  public noAttachmentsMessage = $localize `:@@Ei liitetiedostoa:Ei liitetiedostoa` + '.';

  constructor(private ticketService: TicketService) {
  }

  ngOnInit() {
    const element: HTMLElement = document.querySelector('.file-input') as HTMLElement;
    this.uploadClicks.subscribe(action => {
      element.click()
    });
  }

  public clear() {
    this.fileInfoList = [];
    this.fileList = [];
  }

  public onFileChanged(event: any) {
    console.log('edit-attachments: event saatu.');
    const MEGABYTE = 1000000;
    for (let file of event.target.files) {
      if (this.fileInfoList.some(item => item.filename === file.name)) continue
      let fileinfo: FileInfo = { filename: file.name, progress: 0 };
      if (file.size > this.MAX_FILE_SIZE_MB * MEGABYTE) {
        fileinfo.error = $localize `:@@Liian iso:Liian iso`;
        fileinfo.errorToolTip = $localize `:@@Tiedoston koko ylittää:Tiedoston koko ylittää
          ${this.MAX_FILE_SIZE_MB} megatavun rajoituksen` + '.';
        this.attachmentsMessages.emit(true);
      } else {
        this.fileList.push(file);
      }
      this.fileInfoList.push(fileinfo);
      this.fileListOutput.emit(this.fileList);
      // console.log('fileinfolist ' + JSON.stringify(this.fileInfoList));
      // console.log('filelist:');
      // console.dir(this.fileList);
    }
  }

  public sendFiles(ticketID: string, commentID: string): Promise<boolean> {
    this.state = 'sending';
    this.userMessage = $localize `:@@ähetetään liitetiedostoja:Lähetetään liitetiedostoja, ole hyvä ja odota hetki...`;
    // Koko transaktio.
    return new Promise((resolve, reject) => {
      console.log('edit-attachments: ticketID: ' + ticketID + ' commentID: ' + commentID);
      for (let [index, file] of this.fileList.entries()) {
          this.ticketService.uploadFile(ticketID, commentID, file).subscribe({
          next: (progress) => {
            if (progress > 0 && this.fileInfoList[index]) this.fileInfoList[index].progress = progress;
          },
          error: (error) => {
            this.fileInfoList[index].done = true;
            console.log('saatiin virhe: ' + error);
            this.attachmentsMessages.emit(true);
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
              if (this.fileInfoList.every(fileinfo => (fileinfo?.done === true))) {
                console.log('kaikki lähetetty');
                this.state = 'done';
                this.userMessage = "Valmista!";
                if (this.fileInfoList.some(fileinfo => fileinfo.uploadError)) {
                  this.userMessage += ' Kaikkien tiedostojen lähettäminen ei onnistunut.';
                  resolve
                } else {
                  reject
                }
              }
            // }

          }
        }); // Subscribe
      }  // For
    }) // Promise
  }
  public removeSelectedFile(index: number) {
    this.fileList.splice(index, 1);
    this.fileInfoList.splice(index, 1);
    this.attachmentsMessages.emit(this.fileInfoList.some(item => item.error));
    this.fileListOutput.emit(this.fileList);
  }

}
