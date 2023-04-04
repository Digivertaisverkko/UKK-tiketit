import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  templateUrl: './data-consent.component.html',
  styleUrls: ['./data-consent.component.scss']
})
export class DataConsentComponent implements OnInit {

  private tokenid: string | null = null;

  constructor(
      private auth: AuthService,
      private router: Router,
      private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    // route.snapshot.paramMap.get ei toiminut tässä.
    const urlParams = new URLSearchParams(window.location.search);
    this.tokenid = urlParams.get('tokenid');
  }

  public giveConsent() {
    this.auth.giveGdprConsent(this.tokenid).then(res => {
      if (res?.success == true) {
        if (res?.kurssi != null) {
          const courseID = String(res.kurssi);
          const route = `course/${courseID}/list-tickets`;
          this.router.navigateByUrl(route);
        }
      }
    }).catch(error => {
      console.log('error');
    })
  }

}