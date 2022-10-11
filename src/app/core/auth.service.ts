import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError, firstValueFrom, tap } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
// import { LocalStorageModule } from 'angular-2-local-storage';
import * as CryptoJS from "crypto-js";
import cryptoRandomString from 'crypto-random-string';
import { Router } from '@angular/router';
import { LoginComponent } from '../user-management/login/login.component';

export interface LoginResponse { 'login-url': string; }

@Injectable({
  providedIn: 'root'
})

export class AuthService {

  private codeVerifier: string;
  private codeChallenge: string;
  private codeChallengeMethod: string;
  private responseType: string;
  private oAuthState: string;
  public authState$ = new BehaviorSubject(false);
  private askLogin$: BehaviorSubject<any>;

  constructor(
      private http: HttpClient,
      private router: Router
    ) {
    this.codeVerifier = '';
    this.codeChallenge = '';
    this.codeChallengeMethod = 'S256';
    this.responseType = 'code';
    this.oAuthState = '';
    this.askLogin$ = new BehaviorSubject(null);
  }
  
  private getCodeChallenge(codeVerifier: string): string {
    let codeVerifierHash = CryptoJS.SHA256(codeVerifier).toString(CryptoJS.enc.Base64);
    let codeChallenge = codeVerifierHash.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    return codeChallenge;
  }

  // Login type can atm be one of following: 'own'.
  askLogin(loginType: string) {

    this.codeVerifier = cryptoRandomString({ length: 128, type: 'alphanumeric' });
    this.codeChallenge = this.getCodeChallenge(this.codeVerifier);
    this.oAuthState = cryptoRandomString({ length: 30, type: 'alphanumeric' });

    /* 
    console.log('Response type: ' + this.responseType);
    console.log('Code Verifier: ' + this.codeVerifier);
    console.log('Code challenge : ' + this.codeChallenge);
    console.log('Server kogin url: ' + environment.ownLoginUrl);
    console.log('State: ' + this.oAuthState); */
    
    // Jos haluaa storageen tallentaa:
    // this.storage.set('state', state);
    // this.storage.set('codeVerifier', codeVerifier);

    const httpOptions =  {
      headers: new HttpHeaders({
        'login-type': loginType,
        'code-challenge': this.codeChallenge
      })
    };
    
   // console.dir(httpOptions);
   return this.sendAskLogin(httpOptions)

    /* this.askLogin$ = this.postAskLogin(httpOptions).subscribe((subscriber) => {
      subscriber['login-url'];
    });

    //  return this.postAskLogin(httpOptions).subscribe((data) => {
    //   data['login-url'];
    // });
    
    .then(serverResponse => {
      const possibleUrl = serverResponse['login-url'];
      if (loginType == 'own' && this.isValidHttpUrl(possibleUrl)) {
      } 
      }) */
  }

  private async sendAskLogin(httpOptions: object): Promise<any> {
    try {
      const response: any = await firstValueFrom(this.http.post(environment.ownLoginUrl, null, httpOptions));
      // console.log('sendAskLogin Response: '+ response);
      // console.log(typeof url);
      return response;
    } catch (error: any) {
      this.handleError(error);
    }
  }

  /*  private postAskLogin(httpOptions: object): Observable<any> {
      return this.http.post<LoginResponse>(environment.ownLoginUrl, null, httpOptions)
  } */

  // If using obersvables.
  public sendAskLoginObservable(httpOptions: object): Observable<any> {
    return this.http.post<LoginResponse>(environment.ownLoginUrl, null, httpOptions)  
    .pipe(tap(
        {
          next: (data: any) => data['login-url'],
          error: (error: any) => this.handleError(error)
        }
      ))
  }

  private printAskLoginLog(response: any, loginUrl: string) {
    console.log('Got response: ');
    console.dir(response);
    console.log('Response as string: ' + loginUrl);
    if (this.isValidHttpUrl(loginUrl)) {
      console.log('It seems valid url.');
    } else {
      console.log("It's not valid url.");
    }
  }

  private isValidHttpUrl(testString: string) {
    let url;  
    try {
      url = new URL(testString);
    } catch (_) {
      return false;  
    }
    return url.protocol === "http:" || url.protocol === "https:";
  }

  private handleError(error: HttpErrorResponse) {
    if (error.status === 0) {
      // A client-side or network error occurred. 
      console.error('An error occurred:', error.error);
    } else {
      // The backend returned an unsuccessful response code.
      console.error(
        `Backend returned code ${error.status}, body was: `, error.error);
    }
    // Return an observable with error message.
    return throwError(() => new Error("Unable to continue authentication."));
  }

}
