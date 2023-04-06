import { ChangeDetectionStrategy, Component } from '@angular/core';
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
export class RefreshDialogComponent {

  constructor (public modalRef: MatDialogRef<RefreshDialogComponent>) {
  }

  public closeDialog() {
    this.modalRef.close('cancel');
  }

}
