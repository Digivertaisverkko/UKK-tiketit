import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { MatDialogRef, MatDialogConfig } from '@angular/material/dialog';


@Component({
  selector: 'app-refresh-dialog',
  template: `
  <h1 mat-dialog-title i18n="@@Virkistä selaimen näkymä">
    Virkistä selaimen näkymä
  </h1>
  <mat-dialog-content>
    <p i18n="@@Virkistä-viesti">Ole hyvä ja virkistä selaimen näkymä. Tämä tehdään
      tietokoneella klikkaamalla selaimen päivitysikonia tai painamalla F5.
    </p>
  </mat-dialog-content>
  `,
  styleUrls: ['./refresh-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RefreshDialogComponent implements OnInit {

  constructor (public modalRef: MatDialogRef<RefreshDialogComponent>) {
  }

  ngOnInit(): void {
    console.log('URL: ' + window.location.href);
    this.removeConsentInfo();
  }

  private removeConsentInfo() {
    const noDataConsent: string | null = localStorage.getItem('noDataConsent')
    let noDataConsentList: string[] = noDataConsent ? JSON.parse(noDataConsent) : [];
    const lastTokenid = localStorage.getItem('lastTokenid')
    if (!lastTokenid) {
      console.error('refresh-dialog: Ei tallennettuna viimeisintä tokenid:ä.');
      return
    }
    const index = noDataConsentList.indexOf(lastTokenid);
    if (index !== -1) {
      noDataConsentList.splice(index, 1);
    }
    localStorage.setItem('noDataConsent', JSON.stringify(noDataConsentList));
    console.log(JSON.stringify(localStorage.getItem('noDataConsent')));
  }

  private addDenyConsent() {

  }

}
