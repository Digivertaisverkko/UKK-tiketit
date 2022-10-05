import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
// import { LocalStorageModule } from 'angular-2-local-storage';
import * as CryptoJS from "crypto-js";
import cryptoRandomString from 'crypto-random-string';
import { NgStyle } from '@angular/common';

export interface LoginRequestResponse {
  'login-url': string;
}

export interface LoginRequestBody {
  'login-type': string;
  'code-challenge': string;  
};

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

  getCodeChallenge(codeVerifier: string): string {
    let codeVerifierHash = CryptoJS.SHA256(codeVerifier).toString(CryptoJS.enc.Base64);
    let codeChallenge = codeVerifierHash.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    return codeChallenge;
  }

  // Login type can atm be one of following: 'own'
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

    const loginRequestBody = {
      'login-type': 'own',
      'code-challenge': this.codeChallenge  
    };

    console.log('login request body: ' + JSON.stringify(loginRequestBody));

    this.postLoginRequest(loginRequestBody).subscribe(response =>
      console.log('Got response: ' + JSON.stringify(response))
    );
  }

  postLoginRequest(loginRequestBody: LoginRequestBody): Observable<LoginRequestResponse> {
    return this.http.post<LoginRequestResponse>(environment.ownLoginUrl, loginRequestBody)
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
    
 // Yksinkertaisempi tapa.
  private getRandomString(length: number) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

}
