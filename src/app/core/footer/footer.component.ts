import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PrivacyModalComponent } from './privacy-modal/privacy-modal.component';


@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FooterComponent {

  constructor(public dialog: MatDialog) { }

  public openPrivacyModal() {
    const privacyModal = this.dialog.open(PrivacyModalComponent);
    privacyModal.afterClosed().subscribe(response => {
      console.log({ response });
    })
  }

}
