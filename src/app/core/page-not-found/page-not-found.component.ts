import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  templateUrl: './page-not-found.component.html',
  styleUrls: ['./page-not-found.component.scss']
})
export class PageNotFoundComponent {
  public errorMessage: string = $localize `:@@404:Osoitteessa määriteltyä sivua ei ole olemassa.`;
  public isLoggedIn: Boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router) {
      this.isLoggedIn = this.authService.getIsUserLoggedIn();
  }

  public async goToLogin() {
    const loginUrl = await this.authService.sendAskLoginRequest('own');
    this.router.navigateByUrl(loginUrl);
  }

}