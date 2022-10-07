import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
// import { LocalStorageModule } from 'angular-2-local-storage';
import * as CryptoJS from "crypto-js";
import cryptoRandomString from 'crypto-random-string';

export interface LoginRequestResponse {
  'login-url': string;
}

@Injectable({
  providedIn: 'root'
})

export class AuthService {

  private codeVerifier: string;
  private codeChallenge: string;
  private codeChallengeMethod: string;
  private responseType: string;
  private state: string;

  constructor(private http: HttpClient) {
    this.codeVerifier = '';
    this.codeChallenge = '';
    this.codeChallengeMethod = 'S256';
    this.responseType = 'code';
    this.state = '';
  }
  
  private getCodeChallenge(codeVerifier: string): string {
    let codeVerifierHash = CryptoJS.SHA256(codeVerifier).toString(CryptoJS.enc.Base64);
    let codeChallenge = codeVerifierHash.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    return codeChallenge;
  }

  // Login type can atm be one of following: 'own'.
  requestLogin(loginType: string) {

    this.codeVerifier = cryptoRandomString({ length: 128, type: 'alphanumeric' });
    // this.codeVerifier = this.getRandomString(128);
    this.codeChallenge = this.getCodeChallenge(this.codeVerifier);
    this.state = cryptoRandomString({ length: 30, type: 'alphanumeric' });
    // this.state = this.getRandomString(30);

    console.log('Response type: ' + this.responseType);
    console.log('Code Verifier: ' + this.codeVerifier);
    console.log('Code challenge : ' + this.codeChallenge);
    console.log('Login url: ' + environment.ownLoginUrl);
    console.log('State: ' + this.state);
    
    // Jos haluaa storageen tallentaa:
    // this.storage.set('state', state);
    // this.storage.set('codeVerifier', codeVerifier);

    const httpOptions =  {
      headers: new HttpHeaders({
        'login-type': 'own',
        'code-challenge': this.codeChallenge
      })
    };
    
    console.dir(httpOptions);

    this.postLoginRequest(httpOptions).subscribe(response => {
      console.log('Got response: ');
      console.dir(response);
      let loginUrl = JSON.stringify(response);
      console.log(' Response as string: ' + loginUrl);
      if (this.isValidHttpUrl(response)) {
        console.log('It seems valid url.');
      } else {
        console.log("It's not valid url.");
      }
      
    });
  }

  isValidHttpUrl(testString: string) {
    let url;  
    try {
      url = new URL(testString);
    } catch (_) {
      return false;  
    }
    return url.protocol === "http:" || url.protocol === "https:";
  }

  postLoginRequest(httpOptions: object): Observable<any> {
    return this.http.post(environment.ownLoginUrl, null, httpOptions)
      .pipe(
        catchError(this.handleError)
      )
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
