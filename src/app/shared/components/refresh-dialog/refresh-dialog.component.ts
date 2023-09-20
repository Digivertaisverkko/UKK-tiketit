import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

import { AuthService } from '@core/services/auth.service';

/**
 * Näytetään pop up-dialogi, jossa pyydetään virkistämään selaimen näkymä.
 * Käytetään, kun käyttäjä ensin kieltäytynyt tietojen luovutuksesta ja sen
 * jälkeen antaa luvan. Näkymä pitää silloin virkistää uudelleen, jotta
 * palvelin voi ohjata oikeaan näkymään.
 *
 * @export
 * @class RefreshDialogComponent
 * @implements {OnInit}
 */
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

  constructor (private auth: AuthService,
               public modalRef: MatDialogRef<RefreshDialogComponent>
              ) {
  }

  ngOnInit(): void {
    console.log('URL: ' + window.location.href);
    this.auth.removeDenyConsent();
  }

}
