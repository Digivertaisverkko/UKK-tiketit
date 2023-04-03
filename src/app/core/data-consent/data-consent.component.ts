import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { AuthService } from '../auth.service';

// tokenid

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
    // this.tokenid = this.route.snapshot.paramMap.get('tokenid');
    const urlParams = new URLSearchParams(window.location.search);
    this.tokenid = urlParams.get('tokenid');
    console.log('URL: ' + window.location.href);
    console.log('tokenid: ' + this.tokenid);
  }

  public giveConsent() {
    console.log('tokenid: ' + this.tokenid);
    this.auth.giveGdprConsent(this.tokenid).then(res => {
      console.log('vastaus: ' + res);
    }).catch(error => {
      console.log('error');
    })
  }

}