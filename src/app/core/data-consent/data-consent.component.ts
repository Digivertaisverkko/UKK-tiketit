import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../auth.service';
import { getCourseIDfromURL } from 'src/app/shared/utils';

@Component({
  templateUrl: './data-consent.component.html',
  styleUrls: ['./data-consent.component.scss']
})
export class DataConsentComponent implements OnInit {

  public courseID: string | null;
  private tokenid: string | null = null;

  constructor(
      private auth: AuthService,
      private route: ActivatedRoute,
      private router: Router,
      ) {
        this.courseID = null;
  }

  ngOnInit(): void {
    console.log('URL: ' + window.location.href);
    // route.snapshot.paramMap.get ei toiminut tässä.
    // this.courseID = '2';
    // Käyttäjä on kieltäytynyt tietojen luovuttamisesta, jolloin voi
    // selata kirjautumattomana.
    // if (localStorage.getItem('NO_DATA_CONSENT') === 'true') {
    //   console.log('Ei ole annettu lupaa tietojen siirtoon, ohjataan listaukseen.');
    //   this.navigateToListing(this.courseID);
    // }
    const urlParams = new URLSearchParams(window.location.search);
    this.tokenid = urlParams.get('tokenid');
  }

  public dontGiveConsent() {
    localStorage.setItem('NO_DATA_CONSENT', 'true');
    // this.navigateToListing(this.courseID);
  }

  public giveConsent() {
    this.auth.giveGdprConsent(this.tokenid).then(res => {
      if (res?.success == true) {
        if (res?.kurssi != null) {
          const courseID = String(res.kurssi);
          this.navigateToListing(courseID);
        }
      }
    }).catch(error => {
      console.log(error);
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