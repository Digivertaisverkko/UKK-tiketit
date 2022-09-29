import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

export interface getLoginInfoResponse {
  loginRedirectUrl: string;
  loginID: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  loginUrl: string;

  constructor(private http: HttpClient) {
    this.loginUrl = '/api/login';
  }

  getLoginInfo() {

  }

}
