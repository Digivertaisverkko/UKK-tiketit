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
    this.authService.initialize();
    
    // this.authService.onIsUserLoggedIn().subscribe(response => {
    //   /* Oma kirjautumistapa on oletus ennen kuin käyttäjä valitsee kirjautumisruudussa
    //     jonkin muun tavan. Ei siirrytä suoraan /login, koska palvelimelta saatava
    //     URL sisältää login id:n. */
    //   if (response == false) {
    //     this.authService.sendAskLoginRequest('own').then((response: string) => {
    //       this.router.navigateByUrl(response);
    //     }).catch(error => {
    //       console.error(error.message);
    //     })
    //     // Ei saatu login id:ä, mutta näytetään kirjautumisruutu.
    //     // this.router.navigateByUrl('login', { replaceUrl: true });
    //   }
    // });


  }
}
