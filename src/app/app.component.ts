import { Component, OnInit } from '@angular/core';
import { AuthService } from './core/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'tikettisysteemi';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.authState$.subscribe(isUserLoggedIn => {
      if (isUserLoggedIn == true) {
        this.router.navigateByUrl('/front', { replaceUrl: true });
      } else {
        this.authService.sendAskLoginRequest('own').then((response: string) => {
          console.log('AppComponent: got url from server: ' + response);
          if (response !== 'error') {
            this.router.navigateByUrl(response);
          }
        })
          .catch (error => {
            console.log('Error: Route for login not found: ' + error);
        })
      }
    });
  }

}