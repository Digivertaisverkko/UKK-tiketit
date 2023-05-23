import { Component } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router } from '@angular/router';

import { Constants } from 'src/app/shared/utils';
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
    this.title.setTitle(Constants.baseTitle + $localize `:@@OKurssialuetta ei ole luotu:
        Kurssialuetta ei ole luotu`);
  }

  public giveConsent() {
    console.error('no-data-consent: päivitä tämä');
    const urlParams = new URLSearchParams(window.location.search);
    const tokenid: string | null = urlParams.get('tokenid');
    if (!tokenid) {
      console.error('Ei tokenid:ä.');
    } else {
      this.removeConsentInfo(tokenid);
    }
    const dialogConfig = new MatDialogConfig();
    dialogConfig.maxWidth = '30rem';
    const refreshDialog = this.dialog.open(RefreshDialogComponent, dialogConfig);
    refreshDialog.afterClosed().subscribe(res => {
      if (res === 'cancel') {
        localStorage.setItem('NO_DATA_CONSENT', 'true');
      }
    })
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
