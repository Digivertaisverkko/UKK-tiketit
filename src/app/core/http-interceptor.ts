import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpEvent, HttpResponse, HttpRequest, HttpHandler } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { truncate } from '../utils/truncate';

@Injectable({ providedIn: 'root' })

// Kaikkien HTTP-pyyntöjen yhteydessä tehtävät toimet.
export class CustomHttpInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      tap(event => {
        if (event instanceof HttpResponse) {
          const responseBody = JSON.stringify(event.body);
          console.log(`Tehtiin ${request.method}-pyyntö URL:iin "${request.url}". Tilakoodi ${event.status}. ` +
          // `Saatiin vastaukseksi "${responseBody}".`);
          `Saatiin vastaukseksi "${truncate(responseBody, 500, true)}".`);
          if (request.body != null && request.body.length > 0) {
            const requestBody = JSON.stringify(request.body);
            console.log(`Pyynnön body: "$${truncate(requestBody, 500, true)}"`);
          }
        }
      })
    );
  }
}
