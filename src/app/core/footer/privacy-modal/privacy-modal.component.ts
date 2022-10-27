import { ChangeDetectionStrategy, Component  } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-privacy-modal',
  templateUrl: './privacy-modal.component.html',
  styleUrls: ['./privacy-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PrivacyModalComponent {

  constructor(
    public modalRef: MatDialogRef<PrivacyModalComponent>
  ) { }

  closeModal() {
    this.modalRef.close();
  }

}
