import {  ChangeDetectionStrategy, Component, Input, Output, EventEmitter, OnInit,
          ViewChild, ElementRef, Renderer2, OnDestroy } from '@angular/core';
import { forkJoin, Observable, Subscription, tap, catchError, of } from 'rxjs';
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
  templateUrl: './edit-attachments.component.html',
  styleUrls: ['./edit-attachments.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class EditAttachmentsComponent implements OnInit, OnDestroy {

  @Input() oldAttachments: Liite[] = [];
  @Input() uploadClicks = new Observable();
  // @Input() uploadClicks: Observable<string> = new Observable();
  @Output() attachmentsMessages = new EventEmitter<'faulty' | 'errors' | '' | 'done'>;
  @Output() fileListOutput = new EventEmitter<FileInfo[]>();
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  public uploadClickSub = new Subscription();
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
          if (res.some((result: unknown) => result === 'error' )) {
            reject(res)
            this.isEditingDisabled = false;
          } else {
            resolve(res)
          }
        },
        error: (error) => {
          console.log('sendFilesPromise: saatiin virhe: ' + error );
          this.isEditingDisabled = false;
          reject('error')
        }
      });
    })
  }

}
