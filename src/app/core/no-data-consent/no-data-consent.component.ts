import { Component } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router } from '@angular/router';

import { RefreshDialogComponent } from '../refresh-dialog/refresh-dialog.component';
import { Title } from '@angular/platform-browser';

@Component({
  templateUrl: './no-data-consent.component.html',
  styleUrls: ['./no-data-consent.component.scss']
})
export class NoDataConsentComponent {

  constructor(
    private dialog: MatDialog,
    private router: Router,
    private title: Title
  ) {

  }

  public giveConsent() {
    localStorage.removeItem('NO_DATA_CONSENT');
    const dialogConfig = new MatDialogConfig();
    dialogConfig.maxWidth = '30rem';
    const refreshDialog = this.dialog.open(RefreshDialogComponent, dialogConfig);
    refreshDialog.afterClosed().subscribe(res => {
      if (res === 'cancel') {
        localStorage.setItem('NO_DATA_CONSENT', 'true');
      }
    })
  }

}
