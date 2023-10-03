import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';

import { AuthService } from '../services/auth.service';
import { ConsentResponse } from '@core/core.models';
import { PrivacyModalComponent } from '../footer/privacy-modal/privacy-modal.component';
import { StoreService } from '@core/services/store.service';

/**
 * Näkymä, jossa kysytään käyttäjältä lupaa tietojen siirtämiseen järjestelmän
 * käyttöön. Käyttäjä voi olla uusi tai tili on jo olemassa. Tämän näkymän jälkeen
 * käyttäjä ohjataan kurssin listaus-näkymään eli näytetään listing-komponetti.
 * Jos käyttäjä kieltäytyy eikä kurssialuetta ole vielä luotu, reititetään
 * no-data-consent -näkymään.
 *
 * @export
 * @class DataConsentComponent
 * @implements {OnInit}
 */
@Component({
  templateUrl: './data-consent.component.html',
  styleUrls: ['./data-consent.component.scss']
})

export class DataConsentComponent implements OnInit {

  public accountExists: boolean | null = null;
  public error;
  private noDataConsentList: string[] = [];
  private tokenid: string | null;

  constructor(
    private auth: AuthService,
    public dialog: MatDialog,
    private router: Router,
    private store: StoreService,
    private title: Title
    ) {
      this.error = { title: '', message: '' };
      this.title.setTitle(this.store.getBaseTitle() + $localize `:@@Tervetuloa:Tervetuloa`);
      // route.snapshot.paramMap.get ei toiminut tässä.
      const urlParams = new URLSearchParams(window.location.search);
      this.tokenid = urlParams.get('tokenid');
      this.accountExists = urlParams.get('account-exists') === 'true' ? true : false;
  }

  ngOnInit(): void {
    console.log('URL: ' + window.location.href);
    // Tallennetaan, jotta voidaan poistaa listasta, jos käyttäjä haluaa antaa
    // myöhemmin suostumuksen.
    if (this.tokenid) {
      localStorage.setItem('lastTokenid', this.tokenid);
    }
    const noDataConsent = localStorage.getItem('noDataConsent')
    if (noDataConsent) {
      this.noDataConsentList = JSON.parse(noDataConsent);
    }
    console.log('onko jo tili: ' + this.accountExists);
    // Käyttäjä on kieltäytynyt tietojen luovuttamisesta, lähetetään kieltäytyminen,
    // jotta saadaan kurssi id ja voidaan ohjata sisään.
    if (this.tokenid && this.noDataConsentList?.includes(this.tokenid)) {
      console.log('On kieltäydytty aiemmin.');
      this.denyConsent(true);  // Kieltäydytään automaattisesti edelleen.
    } else {
      console.log('Ei ole kieltäydytty aiemmin.');
    }
  }

  public denyConsent(hasDeniedBefore?: boolean) {
    this.auth.sendDataConsent(this.tokenid, false).then((res: ConsentResponse) => {
      if (res?.success !== true) {
        throw Error('Ei saatu palvelimelta kurssi id:ä, ei voida edetä.');
      }
      if (hasDeniedBefore !== true ) {
        if (this.tokenid) this.noDataConsentList.push(this.tokenid);
        localStorage.setItem('noDataConsent', JSON.stringify(this.noDataConsentList));
      }
      if (res?.kurssi != null) {
        const courseID = String(res.kurssi);
        this.navigateToListing(courseID);
      } else {
        this.router.navigateByUrl('/no-data-consent');
      }
    }).catch (error => {
      console.error('Ei saatu kurssi ID:ä, ei voida edetä kurssinäkymään.');
    })
  }

  public giveConsent() {
    this.auth.sendDataConsent(this.tokenid, true).then((res: ConsentResponse) => {
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

  public openPrivacyModal() {
    this.dialog.open(PrivacyModalComponent);
  }

}
