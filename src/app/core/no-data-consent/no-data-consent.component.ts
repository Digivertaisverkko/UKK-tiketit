import { Component } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';

import { RefreshDialogComponent } from '../refresh-dialog/refresh-dialog.component';
import { Title } from '@angular/platform-browser';
import { AuthService } from '@core/services/auth.service';
import { StoreService } from '@core/services/store.service';

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
    this.title.setTitle(this.store.getBaseTitle() + $localize `:@@OKurssialuetta ei ole luotu:
        Kurssialuetta ei ole luotu`);
  }

  public giveConsent() {
    this.auth.removeDenyConsent();
    const dialogConfig = new MatDialogConfig();
    dialogConfig.maxWidth = '30rem';
    this.dialog.open(RefreshDialogComponent, dialogConfig);
  }

}
