import { Component, OnInit } from '@angular/core';
import { AuthService } from './core/auth.service';
import { Router } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Breakpoints } from '@angular/cdk/layout';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  public isPhonePortrait = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private responsive: BreakpointObserver
  ) {}

  ngOnInit(): void {
    this.responsive.observe(Breakpoints.HandsetPortrait).subscribe(result => {
      this.isPhonePortrait = false;
      if (result.matches) {
        this.isPhonePortrait = true;
      }
    });
    this.initializeApp();
  }

  public initializeApp() {
    console.log('--- App.component Initialize ajettu ---');
    // Katsotaan, onko käyttäjä kirjautuneena.
    if (window.sessionStorage.getItem('SESSION_ID') == null) {
      console.log('Session storagessa ei login id:ä.');
      /* Oma kirjautumistapa on oletus ennen kuin käyttäjä valitsee
         Ei siirrytä suoraan /login, koska url sisältää loginid:n. */
      this.authService.sendAskLoginRequest('own').then((response: string) => {
        console.log('AppComponent: saatiin palvelimelta login URL: ' + response);
          this.router.navigateByUrl(response);
      }).catch (error => {
        console.log(error);
      })
      this.router.navigateByUrl('login', { replaceUrl: true });
    } else {
      this.authService.isUserLoggedIn$.next(true);
    }
  }

}
