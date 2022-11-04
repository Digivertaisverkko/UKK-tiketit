import { Component } from '@angular/core';
// import { Subscription } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../auth.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  public isUserLoggedIn: Observable<boolean>;
  public productName: string = environment.productName;

  constructor(private authService: AuthService,
    private activatedRoute: ActivatedRoute,
    private router: Router) {
    this.isUserLoggedIn = this.authService.onIsUserLoggedIn();

  }

  public logOut() {
    this.authService.logOut();
    this.authService.sendAskLoginRequest('own').then((response: any) => {
      console.log(' header: saatiin vastaus: ' + JSON.stringify(response));
      if (response.success !== 'error') {
        console.log('Saatin vastaus 1. kutsuun: ' + response);
        // const loginUrl = response['login-url'];
        this.router.navigateByUrl(response);
      }
    }).catch (error => {
      console.log('Error: Route for login not found: ' + error);
    })
  }

}
