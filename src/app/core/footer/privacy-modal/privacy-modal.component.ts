import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, Inject, Renderer2,
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
  @ViewChild('dataRemoval') dataRemovalElement!: ElementRef;

  constructor (
    public modalRef: MatDialogRef<PrivacyModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  ngAfterViewInit(): void {
    if (!this.data) {
      this.dialogContent.nativeElement.scrollTop = 0;
    } else if (this.data.scrollToDataRemoval) {
      this.dataRemovalElement.nativeElement.scrollIntoView(
        { behavior: 'smooth', block: 'start', inline: 'nearest' }
      );
    } 
  }

  public closeModal() {
    this.modalRef.close();
  }

}
