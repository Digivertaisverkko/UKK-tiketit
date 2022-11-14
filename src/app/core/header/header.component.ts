import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../auth.service';
import { TicketService } from 'src/app/ticket/ticket.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  public isUserLoggedIn$: Observable<boolean>;
  public isUserLoggedIn: Boolean = false;
  public productName: string = environment.productName;
  public userRole: string = '';

  constructor(private authService: AuthService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private ticketService: TicketService) {
    this.isUserLoggedIn$ = this.authService.onIsUserLoggedIn();
  }

  ngOnInit(): void {
    this.authService.onGetUserRole().subscribe(newRole => {
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
      console.log(' headerComponent: saatiin vastaus: ' + JSON.stringify(response));
        this.router.navigateByUrl(response);
    }).catch (error => {
      console.log('Error: Route for login not found: ' + error);
    })
  }

}
