import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from './core/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'tikettisysteemi';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeApp();
  }

  public initializeApp() {
    console.log('--- App.component Initialize ajettu ---');
    this.authService.onIsUserLoggedIn().subscribe(response => {
      console.log('nIsUserLoggedI saatiin dataa: ' + response);
      console.log('Tsekataan, onko kirjautunut');
      if (response == true) {
        this.router.navigateByUrl('/front', { replaceUrl: true });
      } else {
        /* Oma kirjautumistapa on oletus ennen kuin käyttäjä valitsee
           Ei siirrytä suoraan /login, koska url sisältää loginid:n. */
        this.authService.sendAskLoginRequest('own').then((response: string) => {
          console.log('AppComponent: got url from server: ' + response);
          if (response !== 'error') {
            this.router.navigateByUrl(response);
          }
        }).catch (error => {
          console.log('Error: Route for login not found: ' + error);
        })
      }
    });
  }

  ngOnDestroy(): void {
    this.authService.unsubscribeIsUserLoggedin();
  }

}