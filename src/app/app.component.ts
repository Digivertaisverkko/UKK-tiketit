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
    this.responsive.observe(Breakpoints.HandsetPortrait).subscribe((result) => {
      this.isPhonePortrait = false;
      if (result.matches) {
        this.isPhonePortrait = true;
      }
    });
    this.initializeApp();
  }

  public initializeApp() {
    console.log('--- App.component Initialize ajettu ---');
    console.log('session id: ' + window.sessionStorage.getItem('SESSION_ID'));
    // Katsotaan, onko käyttäjä kirjautuneena.
    if (window.sessionStorage.getItem('SESSION_ID') == null) {
      console.log('ei ole kirjautunut');
      /* Oma kirjautumistapa on oletus ennen kuin käyttäjä valitsee kirjautumisruudussa
        jonkin muun tavan. Ei siirrytä suoraan /login, koska palvelimelta saatava
        URL sisältää login id:n. */
      this.authService.sendAskLoginRequest('own').then((response: string) => {
        console.log('AppComponent: got url from server: ' + response);
        if (response !== undefined) {
          this.router.navigateByUrl(response);
        }
      }).catch (error => {
        console.log('Error: Route for login not found: ' + error);
      })
      this.router.navigateByUrl('login', { replaceUrl: true });
    } else {
      this.authService.isUserLoggedIn$.next(true);
    }
  }

}
