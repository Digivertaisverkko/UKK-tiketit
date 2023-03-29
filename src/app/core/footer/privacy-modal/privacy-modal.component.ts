import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, Renderer2,
        ViewChild  } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-privacy-modal',
  templateUrl: './privacy-modal.component.html',
  styleUrls: ['./privacy-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PrivacyModalComponent implements AfterViewInit {

  @ViewChild('dialogContent') dialogContent!: ElementRef;

  constructor (public modalRef: MatDialogRef<PrivacyModalComponent>) {
  }

  ngAfterViewInit(): void {
    this.dialogContent.nativeElement.scrollTop = 0;
  }

  public closeModal() {
    this.modalRef.close();
  }

}
