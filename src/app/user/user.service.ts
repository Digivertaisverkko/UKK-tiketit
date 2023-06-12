import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '@core/auth.service';
import { ErrorService } from '@core/error.service';
import { environment } from 'src/environments/environment';
import { User } from '@core/core.models';
import { StoreService } from '@core/store.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private errorService: ErrorService,
              private http: HttpClient,
              private store: StoreService
              ) { }

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
    this.errorService.handleServerError(error);
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
    let user: User | null = this.store.getUserInfo();
    if (user === null) throw Error('Ei ole käyttäjätietoja.');
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
