import { Component, OnInit } from '@angular/core';
import { AuthService } from './core/auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  public isPhonePortrait = false;
  public isInIframe: boolean = false;
  // public isUserLoggedIn$: Observable<boolean>;
  public loggingStatus: string = ''

  constructor(
      private authService: AuthService
  ) {
    // this.isUserLoggedIn$ = this.authService.onIsUserLoggedIn();
  }

  ngOnInit(): void {
    this.isInIframe = this.testIframe();
    window.sessionStorage.setItem('IN-IFRAME', this.isInIframe.toString());
    console.log(' iframe upotuksen tila: ' + this.isInIframe.toString());
    this.authService.initialize();
    this.authService.onIsUserLoggedIn().subscribe(response => {
      if (response == true) {
        this.loggingStatus = "Olet kirjautunut";
      } else if (response == false) {
        this.loggingStatus = "Et ole kirjautunut";
      }
    });
  }

  testIframe () {
    try {
        return window.self !== window.top;
    } catch (e) {
        return true;
    }
  }

}
