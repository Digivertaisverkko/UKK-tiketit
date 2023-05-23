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
  <mat-dialog-actions>
    <button color="primary"
            (click)="closeDialog()"
            i18n="@@Peru"
            mat-raised-button
            >
      Peru
    </button>
  </mat-dialog-actions>
  `,
  styleUrls: ['./refresh-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RefreshDialogComponent implements OnInit {

  constructor (public modalRef: MatDialogRef<RefreshDialogComponent>) {
  }

  ngOnInit(): void {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenid: string | null = urlParams.get('tokenid');
    if (!tokenid) {
      console.error('Ei tokenid:ä.');
    } else {
      this.removeConsentInfo(tokenid);
    }
    // localStorage.removeItem('NO_DATA_CONSENT');
  }

  public closeDialog() {
    // Lisää tokenid uudestaan.
    this.modalRef.close('cancel');
  }

  private removeConsentInfo(tokenid: string) {
    const noDataConsent = localStorage.getItem('noDataConsent')
    let noDataConsentList: string[] = noDataConsent ? JSON.parse(noDataConsent) : [];
    const index = noDataConsentList.indexOf(tokenid);
    if (index !== -1) {
      noDataConsentList.splice(index, 1);
    }
    localStorage.setItem('noDataConsent', JSON.stringify(noDataConsentList));
  }

}
