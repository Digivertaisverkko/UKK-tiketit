import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AuthService } from 'src/app/core/auth.service';
import { ErrorService } from 'src/app/core/error.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserManagementService {

  constructor(private authService: AuthService,
              private errorService: ErrorService,
              private http: HttpClient) { }

  // /api/minun - profiilitiedot
  public async getPersonalInfo(): Promise<Minun> {
    let response: any;
    let url = environment.apiBaseUrl + '/minun';
    try {
      response = await firstValueFrom(this.http.get<Minun>(url));
    } catch (error: any) {
      this.handleError(error);
    }
    return response
  }

  private handleError(error: HttpErrorResponse) {
    if (error.status === 403 && error?.error?.error?.tunnus == 1000) {
        console.error('Virhe: Et ole kirjautunut. Ohjataan kirjautumiseen.');
        this.authService.handleNotLoggedIn();
    } else {
      this.errorService.handleServerError(error);
    }
  }

}

export interface Minun {
  nimi: string,
  sposti: string,
}
