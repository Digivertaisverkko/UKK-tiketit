import { ChangeDetectionStrategy, Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-edit-attachments',
  template: `
    <input type="file" class="file-input" multiple (change)="onFileChanged($event)" #fileUpload>
    <mat-list *ngIf="fileList !== null" class="file-list">
      <mat-list-item *ngFor="let file of fileNameList; let index = index">
        <span>{{file}}</span>
        <button mat-icon-button (click)="removeSelectedFile(index)"><mat-icon>close</mat-icon></button>
      </mat-list-item>
    </mat-list>`,

  styleUrls: ['./edit-attachments.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditAttachmentsComponent implements OnInit {

  @Output() fileListOutput = new EventEmitter<File[]>();
  @Input() uploadClicks: Observable<void> = new Observable();
  public fileList: File[] = [];
  public fileNameList: string[] = [];
  public noAttachmentsMessage = $localize `:@@Ei liitetiedostoa:Ei liitetiedostoa` + '.';

  ngOnInit() {
    const element: HTMLElement = document.querySelector('.file-input') as HTMLElement;
    this.uploadClicks.subscribe(() => element.click());
  }

  public onFileChanged(event: any) {
    for (let file of event.target.files) {
      if (this.fileNameList.includes(file.name)) continue;
      this.fileList.push(file);
      this.fileNameList.push(file.name);
      this.fileListOutput.emit(this.fileList);
    }
  }

  public removeSelectedFile(index: number) {
    this.fileList.splice(index, 1);
    this.fileNameList.splice(index, 1);
    this.fileListOutput.emit(this.fileList);
  }

}
