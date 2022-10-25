import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Subscription } from 'rxjs';
// import { Router } from '@angular/router';
// import { Location } from '@angular/common';
import { Observable } from 'rxjs';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  // public loggedInSubscription: Subscription;
  // public isUserLoggedIn: boolean = false;
  public isUserLoggedIn: Observable<boolean>;
  // public message$ = new Subject<any>();
 
  //constructor(location: Location, router: Router) {
  
  constructor(private authService: AuthService) {
    this.isUserLoggedIn = this.authService.onIsUserLoggedIn();
    // this.loggedInSubscription = this.authService.onIsUserLoggedIn().subscribe(loggedInState =>
    //   this.isUserLoggedIn = loggedInState
    //);

    // Vaihtoehtoinen tapa sisäänkirjautumisen seurantaan, jossa seurataan router -tapahtumia.
    // router.events.subscribe(route => {
    //   if (location.path().includes('/login')) {
    //     console.log(location.path());
    //     this.isAccountMenuShown = false;
    //   } else {
    //     this.isAccountMenuShown = true;
    //   }
    // });

  }

}
