import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
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
        this.authService.askLogin('own').then(response => {
          console.log('AppComponent: got url from server: ' + response['login-url']);
          this.router.navigateByUrl(response['login-url']);
        })
          .catch (error => {
            console.log('Error: Route for login not found.');
          })
      }
    });

  } // ngOnInit

}