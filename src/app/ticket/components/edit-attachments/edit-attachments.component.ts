import { ChangeDetectionStrategy, Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

interface FileInfo {
  filename: string;
  error?: string;
}

@Component({
  selector: 'app-edit-attachments',
  template: `
    <input type="file" class="file-input" multiple (change)="onFileChanged($event)" #fileUpload>

    <div class="file-list-wrapper" *ngIf="fileList !== null">
      <div class="file-list-row" *ngFor="let file of fileInfoList; let index = index">
        <div class="list-item">
          <span class="filename" matTooltip="{{file.filename}}" [matTooltipShowDelay]="600">{{file.filename}}</span>
          <button mat-icon-button class="remove-file-button" (click)="removeSelectedFile(index)"><mat-icon>close</mat-icon></button>
        </div>
        <!-- <mat-error>Virheilmoitukset tähän.</mat-error> -->
        <div matError *ngIf="file.error">{{file.error}}</div>
      </div>
    </div>`,
  styleUrls: ['./edit-attachments.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class EditAttachmentsComponent implements OnInit {

  @Output() fileListOutput = new EventEmitter<File[]>();
  @Input() uploadClicks: Observable<void> = new Observable();
  public fileList: File[] = [];
  public fileInfoList: FileInfo[] = [];
  // public fileNameList: string[] = [];
  public noAttachmentsMessage = $localize `:@@Ei liitetiedostoa:Ei liitetiedostoa` + '.';

  ngOnInit() {
    const element: HTMLElement = document.querySelector('.file-input') as HTMLElement;
    this.uploadClicks.subscribe(() => element.click());
  }

  public onFileChanged(event: any) {
    for (let file of event.target.files) {
      console.log('file: ' + file);
      // if (this.fileInfoList.filename.includes(file)) continue;
      if (this.fileInfoList.some(fileinfo => fileinfo.filename === file.name)) continue
      let fileinfo: FileInfo = { filename: file.name };
      if (file.size > 10000000) {
        console.log('liian iso tiedosto');
        fileinfo.error = 'Virhe: Tiedoston koko ylittää 10mt rajan.';
      } else {
        this.fileList.push(file);
      }
      this.fileInfoList.push(fileinfo);
      this.fileListOutput.emit(this.fileList);
      console.log('fileinfolist ' + JSON.stringify(this.fileInfoList));
    }
  }

  public removeSelectedFile(index: number) {
    this.fileList.splice(index, 1);
    this.fileInfoList.splice(index, 1);
    this.fileListOutput.emit(this.fileList);
  }

}
