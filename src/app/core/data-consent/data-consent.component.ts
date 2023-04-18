import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';

import { AuthService } from '../auth.service';
import { Constants } from '../../shared/utils';

@Component({
  templateUrl: './data-consent.component.html',
  styleUrls: ['./data-consent.component.scss']
})
export class DataConsentComponent implements OnInit {

  public error;
  private tokenid: string | null = null;

  constructor(
      private auth: AuthService,
      private router: Router,
      private title: Title
      ) {
        this.error = { title: '', message: ''};
        this.title.setTitle(Constants.baseTitle + $localize `:@@OTervetuloa: Tervetuloa`);

  }

  ngOnInit(): void {
    console.log('URL: ' + window.location.href);
    // route.snapshot.paramMap.get ei toiminut tässä.
    const urlParams = new URLSearchParams(window.location.search);
    this.tokenid = urlParams.get('tokenid');
    // Käyttäjä on kieltäytynyt tietojen luovuttamisesta, jolloin voi
    // selata kirjautumattomana.
    if (localStorage.getItem('NO_DATA_CONSENT') === 'true') {
      console.log('Ei ole annettu lupaa tietojen siirtoon.');
      this.dontGiveConsent();
    }
  }

  public dontGiveConsent() {
    localStorage.setItem('NO_DATA_CONSENT', 'true');
    this.auth.sendDataConsent(this.tokenid, false).then((res: any) => {
      let courseID: string;
      if (res?.kurssi != null) {
        courseID = String(res.kurssi);
        this.navigateToListing(courseID);
      }
      // ? mitä jos ei saada id:ä?
    }).catch (error => { 
    })
  }

  public giveConsent() {
    if (localStorage.getItem('NO_DATA_CONSENT')) {
      localStorage.removeItem('NO_DATA_CONSENT')
    }
    this.auth.sendDataConsent(this.tokenid, true).then(res => {
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