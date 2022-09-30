import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class HttpTestingService {

  response: any;

  constructor(private http: HttpClient) {

  }

  getResponse(url: string) {
    return this.http.get(url);
  }

  showResponse() {
    this.getResponse
  }

}
