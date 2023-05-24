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
    this.accountExists = urlParams.get('account-exists') === 'true' ? true : false;
    this.tokenid = urlParams.get('tokenid');
    // Tallennetaan, jotta voidaan poistaa, jos käyttäjä haluaa antaa
    // myöhemmin suostumuksen.
    if (this.tokenid) {
      localStorage.setItem('lastTokenid', this.tokenid);
    }
    const noDataConsent = localStorage.getItem('noDataConsent')
    if (noDataConsent) {
      this.noDataConsentList = JSON.parse(noDataConsent);
      console.log('kieltäytyjälista: ' + this.noDataConsentList);
    }
    console.log('onko jo tili: ' + this.accountExists);

    // Käyttäjä on kieltäytynyt tietojen luovuttamisesta, annetaan kieltäytyminen
    // ja ohjataan sisään.
    if (this.tokenid && this.noDataConsentList?.includes(this.tokenid)) {
      console.log('On kieltäydytty aiemmin.');
      this.denyConsent(true);
    } else {
      console.log('Ei ole kieltäydytty aiemmin.');
    }
  }

  public denyConsent(hasDeniedBefore?: boolean) {
    this.auth.sendDataConsent(this.tokenid, false).then((res: any) => {
      if (res?.success !== true) {
        throw Error;
      }
      if (hasDeniedBefore !== true ) {
        if (this.tokenid) this.noDataConsentList.push(this.tokenid);
        localStorage.setItem('noDataConsent', JSON.stringify(this.noDataConsentList));
        console.log('lista: ' + localStorage.getItem('noDataConsent'));
      }
      this.auth.updateDataConsent();
      if (res?.kurssi != null) {
        const courseID = String(res.kurssi);
        this.navigateToListing(courseID);
      } else {
        this.router.navigateByUrl('/no-data-consent');
      }
      // ? mitä jos ei saada id:ä?
    }).catch (error => {
      console.error('Ei saatu kurssi ID:ä, ei voida edetä kurssinäkymään.');
    })
  }

  public giveConsent() {
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