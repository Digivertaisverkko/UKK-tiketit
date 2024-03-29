import { Component } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';

import { AuthService } from '@core/services/auth.service';
import { RefreshDialogComponent } from '@shared/components/refresh-dialog/refresh-dialog.component';
import { StoreService } from '@core/services/store.service';

/**
 * "Kurssialuetta ei ole luotu" -näkymä. Näytetään, jos käyttäjä on kieltäytynyt
 * luovuttamasta tietojaan, mutta kurssialuetta ei ole vielä luotu, jolloin hän
 * ei pysty katselemaan sitä kirjautumattomana, vaan voidaan näyttää vain tämä
 * näkymä.
 *
 * @export
 * @class NoDataConsentComponent
 */
@Component({
  templateUrl: './no-data-consent.component.html',
  styleUrls: ['./no-data-consent.component.scss']
})
export class NoDataConsentComponent {

  constructor(
    private auth: AuthService,
    private dialog: MatDialog,
    private store: StoreService,
    private title: Title
  ) {
    this.title.setTitle(this.store.getBaseTitle() + $localize `:@@Kurssialuetta ei ole luotu:
        Kurssialuetta ei ole luotu`);
  }

  public giveConsent() {
    this.auth.removeDenyConsent();
    const dialogConfig = new MatDialogConfig();
    dialogConfig.maxWidth = '30rem';
    this.dialog.open(RefreshDialogComponent, dialogConfig);
  }

}
