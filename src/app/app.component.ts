import { Component, OnInit } from '@angular/core';
import { AuthService } from './core/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  public isPhonePortrait = false;
  public isInIframe: boolean = false;

  constructor(
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.isInIframe = this.testIframe();
    window.sessionStorage.setItem('IN-IFRAME', this.isInIframe.toString());
    this.authService.initialize();
  }

  testIframe () {
    try {
        return window.self !== window.top;
    } catch (e) {
        return true;
    }
  }

}
