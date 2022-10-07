import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { AuthService } from './core/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'tikettisysteemi';

  constructor(
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    if (this.authService.getIsUserAuthenticated() == false) {
      console.log('AppComponent: not authenticated');
      this.authService.askLogin('own');
    }
  }  

}