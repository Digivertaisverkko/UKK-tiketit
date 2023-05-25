import { ChangeDetectionStrategy, Component  } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PrivacyModalComponent } from './privacy-modal/privacy-modal.component';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FooterComponent  {

  public lang: string | null;

  constructor(public dialog: MatDialog) {
    this.lang = localStorage.getItem('language')?.substring(0,2) ?? 'fi';
  }

  public openPrivacyModal() {
    this.dialog.open(PrivacyModalComponent);
    // privacyModal.afterClosed().subscribe(response => {
    //   console.log({ response });
    // })
  }

}
