import { ChangeDetectionStrategy, Component  } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PrivacyModalComponent } from './privacy-modal/privacy-modal.component';

/**
 * Sovelluksen "footer" -elementti. Sisältää logoja, kuvauksen sekä valikon,
 * jossa on linkkejä rahoittajien ja hankkeen sivulle sekä tietosuojaselosteeseen.
 * Tietosuojaseloste on tämän komponentin lapsikomponentti "privacy-modal".
 *
 * @export
 * @class FooterComponent
 */
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
  }

}
