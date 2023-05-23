import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';

import { AuthService } from '../auth.service';
import { Constants } from '@shared/utils';

@Component({
  templateUrl: './data-consent.component.html',
  styleUrls: ['./data-consent.component.scss']
})

export class DataConsentComponent implements OnInit {

  public error;
  public accountExists: boolean | null = null;
  private hasDeniedBefore: boolean = false;
  private noDataConsentList: string[] = [];
  private tokenid: string | null = null;

  constructor(
      private auth: AuthService,
      private router: Router,
      private title: Title
      ) {
        this.error = { title: '', message: ''};
        this.title.setTitle(Constants.baseTitle + $localize `:@@Tervetuloa:Tervetuloa`);
  }

  ngOnInit(): void {
    console.log('URL: ' + window.location.href);
    // route.snapshot.paramMap.get ei toiminut tässä.
    const urlParams = new URLSearchParams(window.location.search);
    this.tokenid = urlParams.get('tokenid');
    this.accountExists = urlParams.get('account-exists') === 'true' ? true : false;
    const noDataConsent = localStorage.getItem('noDataConsent')
    if (noDataConsent) {
      this.noDataConsentList = JSON.parse(noDataConsent);
    }
    console.log('on jo tili: ' + this.accountExists);

    // Käyttäjä on kieltäytynyt tietojen luovuttamisesta, annetaan kieltäytyminen
    // ja ohjataan sisään.
    if (this.tokenid && this.noDataConsentList?.includes(this.tokenid)) {
      console.log('On kieltäydytty aiemmin.');
      this.hasDeniedBefore = true;
      this.denyConsent();
    }
  }

  public denyConsent() {
    this.auth.sendDataConsent(this.tokenid, false).then((res: any) => {
      if (res?.success !== true) {
        throw Error;
      }
      if (this.hasDeniedBefore === false ) {
        if (this.tokenid) this.noDataConsentList.push(this.tokenid);
        localStorage.setItem('noDataConsent', JSON.stringify(this.noDataConsentList));
      }
      let courseID: string;
      if (res?.kurssi != null) {
        courseID = String(res.kurssi);
        this.navigateToListing(courseID);
      } else if (res?.kurssi === null) {
        this.router.navigateByUrl('/no-data-consent');
      }
      // ? mitä jos ei saada id:ä?
    }).catch (error => { 
    })
  }

  public giveConsent() {
    // if (localStorage.getItem('NO_DATA_CONSENT')) {
    //   localStorage.removeItem('NO_DATA_CONSENT')
    // }
    this.auth.sendDataConsent(this.tokenid, true).then((res: any) => {
      if (res?.success == true) {
        if (res?.kurssi != null) {
          const courseID = String(res.kurssi);
          this.navigateToListing(courseID);
        }
      }
    }).catch(error => {
      this.error.title = $localize `:@@Virhe:Virhe`;
      this.error.message = $localize `:@@Tilin luominen ei onnistunut:
          Tilin luominen ei onnistunut.`;
    })
  }

  private navigateToListing(courseID: string | null) {
    if (courseID == null) {
      console.error('Virhe: data-consent.component.ts: ei kurssi ID:ä.');
      return
    }
    const route = `course/${courseID}/list-tickets`;
    this.router.navigateByUrl(route);
  }

}