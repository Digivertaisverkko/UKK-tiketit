import { Component } from '@angular/core';
// import { Subscription } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  public isUserLoggedIn: Observable<boolean>;

  constructor(private authService: AuthService,
    private activatedRoute: ActivatedRoute,
    private router: Router) {
    this.isUserLoggedIn = this.authService.onIsUserLoggedIn();

  }

  public logOut() {
    this.authService.logOut();
    this.authService.sendAskLoginRequest('own').then((response: string) => {
      if (response !== 'error') {
        this.router.navigateByUrl(response);
      }
    }).catch (error => {
      console.log('Error: Route for login not found: ' + error);
    })
  }

}
