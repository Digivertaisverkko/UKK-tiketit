import { AuthService } from '../core/auth.service';
import { firstValueFrom } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { environment } from 'src/environments/environment';
import { ErrorService } from '../core/error.service';
import { Kurssini } from './course.models';


@Injectable({
  providedIn: 'root'
})
export class CourseService {

  constructor(
    private auth: AuthService,
    private errorService: ErrorService,
    private http: HttpClient,
  ) { }

  // Palauta listan kaikista kursseista, joilla käyttäjä on.
  public async getMyCourses(): Promise<Kurssini[]> {
    //const httpOptions = this.getHttpOptions();;
    let response: any;
    let url = environment.apiBaseUrl + '/kurssi/omatkurssit';
    try {
      response = await firstValueFrom<Kurssini[]>(this.http.get<any>(url));
      this.auth.setLoggedIn();
    } catch (error: any) {
      this.handleError(error);
    }
    return response;
  }

  private handleError(error: HttpErrorResponse) {
    if (error.status === 403 && error?.error?.error?.tunnus == 1000) {
      this.auth.handleNotLoggedIn();
    } else {
      this.errorService.handleServerError(error);
    }
  }

}
