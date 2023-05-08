import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AuthService } from 'src/app/core/auth.service';
import { ErrorService } from 'src/app/core/error.service';
import { environment } from 'src/environments/environment';
import { User } from '../core/core.models';

@Injectable({
  providedIn: 'root'
})
export class UserManagementService {

  constructor(private authService: AuthService,
              private errorService: ErrorService,
              private http: HttpClient) { }

  // GET /api/gdpr - GDPR data
  public async getGdprData(): Promise<any> {
    let response: any;
    let url = environment.apiBaseUrl + '/minun/gdpr';
    try {
      response = await firstValueFrom(this.http.get<any>(url));
    } catch (error: any) {
      this.handleError(error);
    }
    return response;
  }

  // GET /api/minun - profiilitiedot
  public async getPersonalInfo(): Promise<Minun> {
    let response: any;
    let url = environment.apiBaseUrl + '/minun';
    try {
      response = await firstValueFrom(this.http.get<Minun>(url));
    } catch (error: any) {
      this.handleError(error);
    }
    return response;
  }

  // GET /api/minun/asetukset - sähköpostiasetukset
  public async getSettings(): Promise<MinunAsetukset> {
    let response: any;
    let url = environment.apiBaseUrl + '/minun/asetukset';
    try {
      response = await firstValueFrom(this.http.get<MinunAsetukset>(url));
    } catch (error: any) {
      this.handleError(error);
    }
    return response;
  }

  private handleError(error: HttpErrorResponse) {
    if (error.status === 403 && error?.error?.error?.tunnus == 1000) {
        console.error('Virhe: Et ole kirjautunut. Ohjataan kirjautumiseen.');
        this.authService.handleNotLoggedIn();
    } else {
      this.errorService.handleServerError(error);
    }
  }

  // POST /api/minun/asetukset - sähköpostiasetukset
  public async postSettings(settings: MinunAsetukset) {
    let response: any;
    let url = environment.apiBaseUrl + '/minun/asetukset';
    let body = settings;
    try {
      response = await firstValueFrom(this.http.post<MinunAsetukset>(url, body));
    } catch (error: any) {
      this.handleError(error);
    }
    return response;
  }

  // DELETE /api/minun - poista käyttäjä
  public async removeUser(): Promise<boolean> {
    let user: User = this.authService.getUserInfo();
    const options = {
      body: {
        id: user.id,
        sposti: user.sposti,
      },
    };
    let response: any;
    let url = `${environment.apiBaseUrl}/minun`;
    try {
      response = await firstValueFrom(this.http.delete(url, options));
    } catch (error: any) {
      this.handleError(error);
    }
    return response?.success === true ? true : false;
  }

}

// /api/minun/
export interface Minun {
  nimi: string,
  sposti: string,
}

// /api/minun/asetukset/
export interface MinunAsetukset {
  'sposti-ilmoitus': boolean,
  'sposti-kooste': boolean,
  'sposti-palaute': boolean,
}
