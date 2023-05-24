/* Tämä service käsittelee kursseihin liittyvää tietoa. */

import { firstValueFrom } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { environment } from 'src/environments/environment';
import { ErrorService } from '../core/error.service';
import { GenericResponse } from '../core/core.models';
import { Kenttapohja, Kurssini } from './course.models';
import { StoreService } from '../core/store.service';

// Metodi: getCourses, API: /api/kurssit/
interface Kurssi {
  id: string;
  nimi: string;
}

@Injectable({ providedIn: 'root' })

export class CourseService {

  constructor(
    private errorService: ErrorService,
    private http : HttpClient,
    private store: StoreService
  ) {
  }

  // Vie kurssin UKK:t JSON--string muodossa.
  public async exportFAQs(courseID: string): Promise<string> {
    let response: any;
    const url = `${environment.apiBaseUrl}/kurssi/${courseID}/ukk/vienti`;
    try {
      response = await firstValueFrom(this.http.get<any>(url));
    } catch (error: any) {
      this.handleError(error);
    }
    let filecontent = JSON.stringify(response, null, 2);
    return filecontent;
  }

  // Palauta listan kaikista kursseista.
  public async getCourses(): Promise<Kurssi[]> {
    //const httpOptions = this.getHttpOptions();;
    let response: any;
    let url = environment.apiBaseUrl + '/kurssit';
    try {
      response = await firstValueFrom<Kurssi[]>(this.http.get<any>(url));
      this.store.setLoggedIn();
    } catch (error: any) {
      this.handleError(error);
    }
    return response;
  }

  // Palauta kurssin nimi.
  public async getCourseName(courseID: string): Promise<string> {
    //const httpOptions = this.getHttpOptions();;
    let response: any;
    let url = `${environment.apiBaseUrl}/kurssi/${courseID}`;
    try {
      response = await firstValueFrom(
        this.http.get<{ 'kurssi-nimi': string }[]>(url)
      );
    } catch (error: any) {
      this.handleError(error);
    }
    return response['nimi'];
  }

  // Palauta listan kaikista kursseista, joilla käyttäjä on.
  public async getMyCourses(): Promise<Kurssini[]> {
    //const httpOptions = this.getHttpOptions();
    let response: any;
    let url = environment.apiBaseUrl + '/kurssi/omatkurssit';
    try {
      response = await firstValueFrom<Kurssini[]>(this.http.get<any>(url));
      this.store.setLoggedIn();
    } catch (error: any) {
      this.handleError(error);
    }
    return response;
  }

  // Hae uutta tikettiä tehdessä tarvittavat lisätiedot.
  public async getTicketFieldInfo(courseID: string):
      Promise<Kenttapohja[]> {
    let response: any;
    let url = `${environment.apiBaseUrl}/kurssi/${courseID}/tiketinkentat`;
    try {
      response = await firstValueFrom(this.http.get<Kenttapohja[]>(url));
    } catch (error: any) {
      this.handleError(error);
    }
    if (response === null) response = [];

    return response;
  }

  // Lähetetään JSON-muotoiset UKK:t lisättäväksi kurssille. 
  public async importFAQs(courseID: string, filecontent: JSON):
      Promise<GenericResponse | any>{
    let response;
    const url = `${environment.apiBaseUrl}/kurssi/${courseID}/ukk/vienti`;
    const body = filecontent;
    try {
      response = await firstValueFrom(this.http.post<any>(url, body));
    } catch (error: any) {
      this.handleError(error);
    }
    return response;
  }

  // Luo uudet kentät tikettipohjalle.
  public async setTicketFieldInfo(courseID: string, fields: Kenttapohja[]) {
    for (let field of fields) {
      if (field.id != null) delete field.id;
    }
    const url = `${environment.apiBaseUrl}/kurssi/${courseID}/tiketinkentat`;
    let response: any;
    const body = { kentat: fields };
    try {
      response = await firstValueFrom( this.http.put(url, body) );
    } catch (error: any) {
      this.errorService.handleServerError(error);
    }
    return (response?.success === true) ? true : false;
    }

  private handleError(error: HttpErrorResponse) {
    this.errorService.handleServerError(error);
  }

}
