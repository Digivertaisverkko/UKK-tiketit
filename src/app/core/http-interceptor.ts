import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpEvent, HttpResponse, HttpRequest, HttpHandler } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { truncate } from '../utils/truncate';

@Injectable({ providedIn: 'root' })

// Kaikkien HTTP-pyyntöjen yhteydessä tehtävät toimet.
export class CustomHttpInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const SESSION_ID = window.localStorage.getItem('SESSION_ID');
    // console.log('session id on: ' + sessionID);
    // var sessionID = '123456789';
    if (SESSION_ID === undefined || SESSION_ID === null) {
      console.warn('getHttpOptions: ei session ID:ä.');
    } else {
      request = request.clone({ 
        headers: request.headers.set('session-id', SESSION_ID),
      });
    }
    return next.handle(request).pipe(
      tap(event => {
        if (event instanceof HttpResponse) {
          const responseBody = JSON.stringify(event.body);
          console.log(`Tehtiin ${request.method}-pyyntö URL:iin "${request.url}". Tilakoodi ${event.status}. ` +
            `Saatiin vastaukseksi "${truncate(responseBody, 200, true)}".`);
          if (request.body != null) {
            const requestBody = JSON.stringify(request.body);
            console.log(`Pyynnön body: "$${truncate(requestBody, 200, true)}"`);
          }
        }
      })
    );
  }
}