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

export interface LoginResponse {
  success: boolean,
  'login-code': string
 }

 export interface AuthRequestResponse {
  success: boolean,
  'login-code': string
 }


@Injectable({
  providedIn: 'root'
})

export class AuthService {

  public authState$ = new BehaviorSubject<boolean>(false);
  private codeVerifier: string = '';
  private codeChallenge: string = '';
  private codeChallengeMethod: string = 'S256';
  private responseType: string = 'code';
  private oAuthState: string = '';
  private loginCode: string = '';
  private sessionID: string ='';
  // private askLogin$: BehaviorSubject<any>;

  constructor(
      private http: HttpClient,
      private router: Router
    ) {
  }

  // observable-toteutusta varten.
  // this.askLogin$ = new BehaviorSubject(null);

  /* Send first request in authorized code flow asking for login.
     Login type can atm be one of following: 'own'. */
  public async sendAskLoginRequest(loginType: string) {
    this.codeVerifier = cryptoRandomString({ length: 128, type: 'alphanumeric' });
    this.codeChallenge = this.getCodeChallenge(this.codeVerifier);
    this.oAuthState = cryptoRandomString({ length: 30, type: 'alphanumeric' });
    // console.log('authService (before asking login):');
    // console.log('Response type: ' + this.responseType);
    // console.log('Code Verifier: ' + this.codeVerifier);
    // console.log('Code challenge : ' + this.codeChallenge);
    // console.log('Server login url: ' + environment.ownAskLoginUrl);
    // console.log('oAuthState: ' + this.oAuthState);
    // Jos haluaa storageen tallentaa:
    // this.storage.set('state', state);
    // this.storage.set('codeVerifier', codeVerifier);
    let url: string = environment.ownAskLoginUrl;
    const httpOptions =  {
      headers: new HttpHeaders({
        'login-type': loginType,
        'code-challenge': this.codeChallenge
      })
    };
   // console.dir(httpOptions);
   let response: any;
   try {
      response = await firstValueFrom(this.http.post<{'login-url': string}>(url, httpOptions));
    } catch (error: any) {
      this.handleError(error);
    }
    const loginUrl: string = response['login-url'];
    console.log('loginurl : ' +loginUrl);
   if (loginUrl.length == 0) {
    console.error("Server didn't retrieve login url.");
    return 'error';
   }
   return loginUrl;

    /* this.askLogin$ = this.postAskLogin(httpOptions).subscribe((subscriber) => {
      subscriber['login-url'];
    });

    //  return this.postAskLogin(httpOptions).subscribe((data) => {
    //   data['login-url'];
    // });

    // For URL validation.
    .then(serverResponse => {
      const possibleUrl = serverResponse['login-url'];
      if (loginType == 'own' && this.isValidHttpUrl(possibleUrl)) {
      } 
      }) */
  }

  /* Send 2nd request in authorized code flow for login. */
  public async sendLoginRequest(email: string, password: string, loginID: string) {
    const httpOptions =  {
      headers: new HttpHeaders({
        'ktunnus': email,
        'salasana': password,
        'login-id': loginID
      })
    }
    const url = environment.ownLoginUrl;
    // url = '/api/echoheaders/';
    let response: any;
    try {
       response = await firstValueFrom(this.http.post<LoginResponse>(url, null, httpOptions));
    } catch (error: any) {
      this.handleError(error);
    }
    console.log('sendLoginRequest: Got response:');
    console.dir(response);
    if (response.success == true) {
      console.log(' login-code: ' + response['login-code']);
      this.loginCode = response['login-code'];
      this.sendAuthRequest(this.codeVerifier, this.loginCode);
    } else {
      console.error("Login attempt failed : " + response.error);
    }
  }

  private async sendAuthRequest(codeVerifier: string, LoginCode: string) {
    const httpOptions =  {
      headers: new HttpHeaders({
        'code-verifier': codeVerifier,
        'login-code': LoginCode,
      })
    }
    const url = environment.ownTokenUrl;
    let response: any;
    try {
      response = await firstValueFrom(this.http.get<AuthRequestResponse>(url, httpOptions));
      console.log('sendAuthRequest: got response: ');
      console.dir(response);
    } catch (error: any) {
      this.handleError(error);
    }
    if (response.success == true) {
      console.log('sendAuthRequest: Got Session ID: ' + response['session-id']);
      this.sessionID = response['session-id'];
      this.authState$.next(true);
      console.log('Authorization success.');
    } else {
      console.error('Authorization failed with error: ' + response.error);
    }
  }

  // Send any POST request. tuskin tarvitsee erikseen, koska error handling handling tapahtuu
  // jo omassa metodissaan.
  private async postRequest(url: string, httpOptions: object, method?: string ): Promise<any> {
    try {
      const response: any = await firstValueFrom(this.http.post(url, null, httpOptions));
      return response;
    } catch (error: any) {
      this.handleError(error);
    }
  }

  /*  private postAskLogin(httpOptions: object): Observable<any> {
      return this.http.post<LoginResponse>(environment.ownAskLoginUrl, null, httpOptions)
  } */

  // observable-yritystä.
  public postRequestObservable(url: string, httpOptions: object): Observable<any> {
    return this.http.post<LoginResponse>(url, null, httpOptions)  
    .pipe(tap(
        {
          next: (data: any) => data['login-url'],
          error: (error: any) => this.handleError(error)
        }
      ))
  }

  // Pring logs when asking for login.
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

  private getCodeChallenge(codeVerifier: string): string {
    let codeVerifierHash = CryptoJS.SHA256(codeVerifier).toString(CryptoJS.enc.Base64);
    let codeChallenge = codeVerifierHash.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    return codeChallenge;
  }

  // Test if a string is valid URL.
  private isValidHttpUrl(testString: string) {
    let url;  
    try {
      url = new URL(testString);
    } catch (_) {
      return false;  
    }
    return url.protocol === "http:" || url.protocol === "https:";
  }

  // Handle an error.
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
