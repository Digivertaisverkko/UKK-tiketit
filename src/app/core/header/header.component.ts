import { Component } from '@angular/core';
// import { Subscription } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../auth.service';
import { TicketService } from 'src/app/ticket/ticket.service';
import { environment } from 'src/environments/environment';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  public isUserLoggedIn$: Observable<boolean>;
  public isUserLoggedIn: Boolean = false;
  public productName: string = environment.productName;
  private userRoleSub: Subscription;
  public userRole: string = '';

  constructor(private authService: AuthService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private ticketService: TicketService) {
    this.isUserLoggedIn$ = this.authService.onIsUserLoggedIn();
    this.userRoleSub = this.authService.onGetUserRole().subscribe(newRole => {
      this.userRole = newRole.charAt(0).toUpperCase() + newRole.slice(1);
    });
  }

  public goToFrontPage() {
    if (this.authService.getIsUserLoggedIn() == true) {
      const courseID = this.ticketService.getActiveCourse();
      this.router.navigateByUrl('/list-tickets?courseID=' + courseID);
    }
  }

  public logOut() {
    this.authService.logOut();
    this.authService.sendAskLoginRequest('own').then((response: any) => {
      console.log(' header: saatiin vastaus: ' + JSON.stringify(response));
        console.log('Saatin vastaus 1. kutsuun: ' + response);
        // const loginUrl = response['login-url'];
        this.router.navigateByUrl(response);
    }).catch (error => {
      console.log('Error: Route for login not found: ' + error);
    })
  }

}
