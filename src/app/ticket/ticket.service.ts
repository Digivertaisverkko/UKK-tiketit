import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { firstValueFrom, Subject, Observable, throwError } from 'rxjs';
import '@angular/localize/init';
import { truncate } from '../utils/truncate';
import { AuthService } from '../core/auth.service';
import { ErrorService } from '../core/error.service';
@Injectable({
  providedIn: 'root',
})

// Tämä service on käsittelee tiketteihin liittyvää tietoa.
export class TicketService {

  private activeCourse: number | undefined = undefined;
  private messages$ = new Subject<string>();

  constructor (private auth: AuthService,
    private errorService: ErrorService,
    private http: HttpClient) {}

  // Ota vastaan viestejä tästä servicestä (subscribe vastaukseen).
  public onMessages(): Observable<any> {
    return this.messages$.asObservable();
  }

  // Lopeta viestien vastaanottaminen tästä servicestä.
  public unsubscribeMessage(): void {
    this.messages$.unsubscribe;
  }

  public setActiveCourse(courseID: string | null) {
    // Tallennetaan kurssi-ID sessioon, jos se on vaihtunut.
    if (courseID !== null && this.activeCourse !== Number(courseID)) {
      window.localStorage.setItem('COURSE_ID', courseID);
      this.activeCourse = Number(courseID);
    }
  }

  /* Aseta kurssi aktiiviseksi muistiin. Tarvitaan mm. käyttäjätietojen
     hakemiseen */
  public getActiveCourse(): string {
    var courseID: string = '';
    if (this.activeCourse == undefined) {
      const savedCourseID: string | null = window.localStorage.getItem('COURSE_ID');
      if (savedCourseID !== null) {
          courseID = savedCourseID;
        } else {
          throw new Error('getActiveCourse(): Virhe: kurssi ID:ä ei löydetty.');
        }
      } else {
        courseID = String(this.activeCourse);
      }
    return courseID;
  }

  // Hae kurssin UKK-kysymykset.
  public async getFAQ(courseID: number): Promise<UKK[]> {
    // const httpOptions = this.getHttpOptions();
    let url = environment.apiBaseUrl + '/kurssi/' + courseID + '/ukk';
    let response: any;
    try {
      response = await firstValueFrom(this.http.get<UKK[]>(url));
      console.log(
        'Saatiin GET-kutsusta URL:iin "' + url + '" vastaus: ' + truncate(JSON.stringify(response), 300, true)
      );
    } catch (error: any) {
      this.handleError(error);
    }
    return response;
  }

  // Palauta tiketin sanallinen tila numeerinen arvon perusteella.
  public getTicketState(numericalState: number): string {
    let verbal: string;
    switch (numericalState) {
      case 0: verbal = $localize `:@@Virhetila:Virhetila`; break;
      case 1: verbal = $localize `:@@Lähetetty:Lähetetty`; break;
      case 2: verbal = $localize `:@@Luettu:Luettu`; break;
      case 3: verbal = $localize `:@@Lisätietoa pyydetty:Lisätietoa pyydetty`; break;
      case 4: verbal = $localize `:@@Kommentoitu:Kommentoitu`; break;
      case 5: verbal = $localize `:@@Ratkaistu:Ratkaistu`; break;
      case 6: verbal = $localize `:@@Arkistoitu:Arkistoitu`; break;
      default:
        throw new Error('getTicketState: Tiketin tilan numeerinen arvo täytyy olla välillä 0-6.');
    }
    return verbal;
  }

  // Lisää uusi kommentti tikettiin. Palauttaa true jos viestin lisääminen onnistui.
  public async addComment(ticketID: string, message: string, tila?: number): Promise<any> {
    if (isNaN(Number(ticketID))) {
      throw new Error('Kommentin lisäämiseen tarvittava ticketID ei ole numero.')
    }
    if (tila !== undefined) {
      if (tila  < 0 || tila > 6) {
        throw new Error('ticketService.addComment: tiketin tilan täytyy olla väliltä 0-6.');
      }
    }
    const httpOptions = this.getHttpOptions();
    interface newComment {
      viesti: string;
      tila?: number;
    }
    let body: newComment = { viesti: message }
    if (tila !== undefined) {
      body.tila = tila;
    }
    let response: any;
    let url = environment.apiBaseUrl + '/tiketti/' + ticketID + '/uusikommentti';
    console.dir(httpOptions);
    try {
      console.log('addComment: lähetetään bodyssa: ' + JSON.stringify(body) + ' URL:iin ' + url);
      response = await firstValueFrom(
        this.http.post<object>(url, body, httpOptions)
      );
      console.log(
        'Saatiin POST-kutsusta URL:iin "' + url + '" vastaus: ' + JSON.stringify(response)
      );
      this.auth.setLoggedIn();
    } catch (error: any) {
      console.log('service: napattiin: ' + JSON.stringify(error));
      this.handleError(error);
     //  this.sendMessage($localize `:@@Kommentin lisääminen epäonistui:Kommentin lisääminen tikettiin epäonnistui.`)
    }
    return response;
    // this.checkErrors(response);
    // if (response.success !== undefined && response.success == true) {
    //   this.sendMessage($localize `:@@Kommentin lisääminen:Kommentin lisääminen tikettiin onnistui.`)
    //   return true;
    // } else {
    //   this.sendMessage($localize `:@@Kommentin lisääminen epäonistui:Kommentin lisääminen tikettiin epäonnistui.`)
    //   return false;
    // }
  }

  // Hae uutta tikettiä tehdessä tarvittavat lisätiedot: /api/kurssi/:kurssi-id/uusitiketti/kentat/
  public async getTicketFieldInfo(courseID: string): Promise<KentanTiedot[]> {
    const httpOptions = this.getHttpOptions();
    let response: any;
    let url = environment.apiBaseUrl + '/kurssi/' + courseID + '/uusitiketti/kentat';
    try {
      response = await firstValueFrom(
        this.http.get<KentanTiedot[]>(url, httpOptions)
      );
      console.log('Saatiin GET-kutsusta URL:iin "' + url + '" vastaus: ' + JSON.stringify(response));
    } catch (error: any) {
      this.handleError(error);
    }
    // this.checkErrors(response);
    return response;
  }

  // ID on kurssi ID tai UKK:n ID riippuen, lisätäänkö uusi vai muokataanko vanhaa UKK:a.
  public async sendFaq(ID: string, newFaq: UusiUKK, editFaq?: boolean) {
    const httpOptions = this.getHttpOptions();
    let response: any;
    let url: string;
    if (editFaq?.toString() === 'true') {
      url = `${environment.apiBaseUrl}/tiketti/${ID}/muokkaaukk`;
    } else {
      url = `${environment.apiBaseUrl}/kurssi/${ID}/ukk`;
    }
    const body = newFaq;
    try {
      console.log('Yritetään lähettää body: ' + JSON.stringify(body) + '  URL:iin "' + url + '"');
      response = await firstValueFrom(this.http.post<UusiUKK>(url, body, httpOptions));
      console.log('saatiin vastaus UKK:n lisäämiseen: ' + JSON.stringify(response));
    } catch (error: any) {
      this.handleError(error);
    }
  }

  // Lisää uusi tiketti. Palautusarvo kertoo, onnistuiko tiketin lisääminen.
  public async addTicket(courseID: string, newTicket: UusiTiketti) {
    const httpOptions = this.getHttpOptions();
    let response: any;
    const url = environment.apiBaseUrl + '/kurssi/' + courseID + '/uusitiketti';
    const body = newTicket;
    try {
      console.log('Yritetään lähettää tiketti: ' + JSON.stringify(newTicket) + '  URL:iin "' + url + '"');
      response = await firstValueFrom(this.http.post<UusiTiketti>(url, body, httpOptions));
      console.log('saatiin vastaus tiketin lisäämiseen: ' + JSON.stringify(response));
    } catch (error: any) {
      this.handleError(error);
    }
    let message: string = '';

    // this.checkErrors(response);

    // if (response.success == undefined) {
    //   this.sendMessage($localize `:@@Kysymyksen lisäämisestä ei vahvistusta:Kysymyksen lisäämisen onnistumisesta ei saatu vahvistusta.`)
    //   return false;
    // } else {
    //   if (response.success == true) {
    //     this.sendMessage($localize `:@@Kysymys lisättiin onnistuneesti:Kysymys lisättiin onnistuneesti`);
    //     return true;
    //   } else {
    //     this.sendMessage($localize `:@@Kysymys lisääminen epäonnistui:Kysymys lisääminen epäonnistui`);
    //     return false;
    //   }
    // }
  }

  // Arkistoi (poista) UKK.
  public async archiveFAQ(ticketID: number): Promise<{success: boolean}> {
    const httpOptions = this.getHttpOptions();
    let response: any;
    const url = environment.apiBaseUrl + '/tiketti/' + String(ticketID) + '/arkistoiukk';
    try {
      console.log('Yritetään lähettää body {} POST-kutsu osoitteeseen ' + url);
      response = await firstValueFrom<{success: boolean}>(this.http.post<{success: boolean}>(url, {}, httpOptions));
      console.log('saatiin vastaus UKK poistamiseen: ' + JSON.stringify(response));
    } catch (error: any) {
      this.handleError(error);
    }
    return response;
  }

  // Palauta kurssin nimi.
  public async getCourseName(courseID: string): Promise<string> {
    const httpOptions = this.getHttpOptions();
    let response: any;
    let url = environment.apiBaseUrl + '/kurssi/' + courseID;
    try {
      response = await firstValueFrom(
        this.http.get<{'kurssi-nimi': string}[]>(url, httpOptions)
      );
      console.log(
        'Saatiin GET-kutsusta URL:iin "' + url + '" vastaus: ' + JSON.stringify(response)
      );
    } catch (error: any) {
      this.handleError(error);
    }
    // this.checkErrors(response);
    return response['nimi'];
  }

  // Palauta listan kaikista kursseista.
  public async getCourses(): Promise<Kurssi[]> {
    const httpOptions = this.getHttpOptions();
    let response: any;
    let url = environment.apiBaseUrl + '/kurssit';
    try {
      console.dir(httpOptions);
      response = await firstValueFrom<Kurssi[]>(this.http.get<any>(url, httpOptions));
      console.log(
        'Saatiin GET-kutsusta URL:iin "' + url + '" vastaus: ' + JSON.stringify(response)
      );
      this.auth.setLoggedIn();
    } catch (error: any) {
      this.handleError(error);
    }
    // this.checkErrors(response);
    return response;
  }

    // Palauta listan kaikista kursseista, joilla käyttäjä on.
    public async getMyCourses(): Promise<Kurssini[]> {
      const httpOptions = this.getHttpOptions();
      let response: any;
      let url = environment.apiBaseUrl + '/kurssi/omatkurssit';
      try {
        response = await firstValueFrom<Kurssini[]>(this.http.get<any>(url, httpOptions));
        console.log('Saatiin GET-kutsusta URL:iin "' + url + '" vastaus: ' + JSON.stringify(response));
        this.auth.setLoggedIn();
      } catch (error: any) {
        this.handleError(error);
      }
      // this.checkErrors(response);
      return response;
    }

  /* lähettää kirjautuneen käyttäjän luomat tiketit, jos hän on kurssilla opiskelijana.
  Jos on kirjautunut opettajana, niin palautetaan kaikki kurssin tiketit.
  onlyOwn = true palauttaa ainoastaan itse luodut tiketit. */
  public async getQuestions(courseID: number, onlyOwn?: boolean): Promise<TiketinPerustiedot[]> {
    const httpOptions = this.getHttpOptions();
    let target: string;
    if (onlyOwn !== undefined && onlyOwn == true) {
      target = 'omat';
    } else {
      target = 'kaikki';
    }
    let url = environment.apiBaseUrl + '/kurssi/' + String(courseID) + '/' + target;
    let response: any;
    try {
      response = await firstValueFrom(this.http.get<TiketinPerustiedot[]>(url, httpOptions));
      console.log('Saatiin GET-kutsusta URL:iin "' + url + '" vastaus: ' + truncate(JSON.stringify(response), 300, true));
      this.auth.setLoggedIn();
    } catch (error: any) {
      this.handleError(error);
    }
    // this.checkErrors(response);
    return response;
  }


  /* lähettää kirjautuneen käyttäjän luomat tiketit, jos hän on kurssilla opiskelijana.
  Jos on kirjautunut opettajana, niin palautetaan kaikki kurssin tiketit.
  onlyOwn = true palauttaa ainoastaan itse luodut tiketit. */
  public getOnQuestions(courseID: number, onlyOwn?: boolean): Observable<TiketinPerustiedot[]> {
    const httpOptions = this.getHttpOptions();
    let target: string;
    if (onlyOwn !== undefined && onlyOwn == true) {
      target = 'omat';
    } else {
      target = 'kaikki';
    }
    let url = environment.apiBaseUrl + '/kurssi/' + String(courseID) + '/' + target;
    let response: any;
    try {
      response = this.http.get<TiketinPerustiedot[]>(url, httpOptions);

      console.dir(response);
    } catch (error: any) {
      this.handleError(error);
    }
    this.auth.setLoggedIn();
    return response;
  }

  // Palauta yhden tiketin kaikki tiedot mukaanlukien kommentit.
  public async getTicketInfo(ticketID: string): Promise<Tiketti> {
    const httpOptions = this.getHttpOptions();
    let response: any;
    // ticketID = '2309483290';
    let url = environment.apiBaseUrl + '/tiketti/' + ticketID;
    try {
      response = await firstValueFrom(this.http.get<Tiketti>(url, httpOptions));
      console.log('Saatiin "' + url + '" vastaus: ' + JSON.stringify(response) + ' . Vastaus myös alla.');
      console.dir(response);
    } catch (error: any) {
      this.handleError(error);
    }
    let ticket: Tiketti = response;
    response = await this.getFields(ticketID, httpOptions);
    ticket.kentat = response;
    response  = await this.getComments(ticketID, httpOptions);
    // Tiketin viestin sisältö on palautuksen ensimmäinen kommentti.
    ticket.viesti = response[0].viesti;
    response.shift();
    ticket.kommentit = response;
    // console.log('Lopullinen tiketti alla:');
    // console.log(ticket);
    return ticket
  }

  // Palauta listan tiketin kommenteista.
  private async getComments(ticketID: string, httpOptions: object): Promise<Kommentti[]>{
    let response: any;
    let url = environment.apiBaseUrl + '/tiketti/' + ticketID + '/kommentit';
    try {
      response = await firstValueFrom<Kommentti[]>(
        this.http.get<any>(url, httpOptions)
      );
      console.log('Got from "' + url + '" response: ' + truncate(JSON.stringify(response), 300, true));
      console.dir(response);
    } catch (error: any) {
      this.handleError(error);
    }
    // if (Object.keys(response).length === 0) {
    // }
    let comments: Kommentti[];
    comments = this.arrangeComments(response);
    return comments
  }

  // Järjestä kommentit vanhimmasta uusimpaan.
  private arrangeComments(comments: Kommentti[]): Kommentti[] {
    const commentsWithDate = comments.map(comment => {
      return { ...comment, aikaleima: new Date(comment.aikaleima) }
    });
    const commentsAscending = commentsWithDate.sort(
      (commentA, commentB) => commentA.aikaleima.getTime() - commentB.aikaleima.getTime(),
    );
    // const commentsDescending = commentsWithDate.sort(
    //   (commentA, commentB) => commentB.aikaleima.getTime() - commentA.aikaleima.getTime(),
    // );
    // console.log('Kommentit järjestyksessä:');
    // console.dir(commentsAscending);
    return commentsAscending;
  }

  // Hae lisäkentät
  private async getFields(ticketID: string, httpOptions: object): Promise<Kentta[]> {
    let response: any;
    let url = environment.apiBaseUrl + '/tiketti/' + ticketID + '/kentat';
    try {
      response = await firstValueFrom<Kentta[]>(
        this.http.get<any>(url, httpOptions)
      );
      console.log('getFields: Saatiin GET-kutsusta URL:iin "' + url + '" vastaus: ' + JSON.stringify(response));
    } catch (error: any) {
      this.handleError(error);
    }
    // this.checkErrors(response);
    return response;
  }

  // Palauta HttpOptions, johon on asetettu session-id headeriin.
  private getHttpOptions(): object {
     
    var sessionID = window.localStorage.getItem('SESSION_ID');
    // if (sessionID == undefined) {
    //   throw new Error('getHttpOptions(): Virhe: ei session id:ä.');
    // }
    // console.log('session id on: ' + sessionID);
    // var sessionID = '123456789';

    if (sessionID === undefined || sessionID === null) {
      return {}
    } else {
      return  {
        headers: new HttpHeaders({ 'session-id': sessionID })
      };
    }
  }

  private getMethodName() {
    return this.getMethodName.caller.name
  }

  private handleError(error: HttpErrorResponse) {
    if (error.status === 403 && error?.error?.error?.tunnus == 1000) {
        console.error('Virhe: Et ole kirjautunut. Ohjataan kirjautumiseen.');
        this.auth.handleNotLoggedIn();
    } else {
      this.errorService.handleServerError(error);
    }
  }

}

// ========== Rajapinnat ==============

// Jäsenmuuttujien järjestys pitäisi vastata palvelimen API-dokumenttia.

export interface Error {
  tunnus: number;
  virheilmoitus: string;
}

// Rajapinnoissa on mainittu, missä metodissa sitä käytetään ja mitä palvelimen API:a se vastaa.

// Metodi: getCourses, API: /api/kurssit/
export interface Kurssi {
  id: string;
  nimi: string;
}

// Metodi: getMyCourses, API: /api/kurssi/omatkurssit/
export interface Kurssini {
  kurssi: number;
  asema: 'opiskelija' | 'opettaja' | 'admin';
}

export interface Kurssilainen {
  id: number,
  nimi: string;
  sposti: string;
  asema: string;
}

// Metodi: getQuestions, API: /api/kurssi/:kurssi-id/[kaikki|omat]/
// Tikettilistan näyttämistä varten.
export interface TiketinPerustiedot {
  id: number;
  otsikko: string;
  aikaleima: string;
  aloittaja: Kurssilainen;
  tila: number;
}

/* Metodi: getTicketInfo. API /api/tiketti/:tiketti-id/[|kentat|kommentit]
  Lisäkentät ja kommentit ovat valinnaisia, koska ne haetaan
  eri vaiheessa omilla kutsuillaan.
  Backend palauttaa 1. kommentissa tiketin viestin sisällön, josta
  tulee rajapinnan jäsenmuuttujan "viesti" -sisältö. */
export interface Tiketti extends TiketinPerustiedot {
  kurssi: number;
  viesti: string;
  ukk?: boolean;
  kentat?: Array<Kentta>;
  kommentit: Array<Kommentti>;
}

// Metodi: getFAQ. API: /api/kurssi/:kurssi-id/ukk/
export interface UKK {
  id: number;
  otsikko: string;
  aikaleima: string;
  tyyppi: string;
  tila: number;
}

// Metodi: addTicket, API: /api/kurssi/:kurssi-id/uusitiketti/
export interface UusiTiketti {
  otsikko: string;
  viesti: string;
  kentat?: Array<{ id: number, arvo: string }>;
}

// Metodi: sendFaq. API: /api/kurssi/:kurssi-id/ukk/
export interface UusiUKK extends UusiTiketti {
  vastaus: string;
}

/* Tiketin lisäkenttä.
  Metodi: getTicketInfo -> getTickgetFields,
  API: /api/tiketti/:tiketti-id/kentat/
  Uusia propertyjä: tyyppi ja ohje.
  Palautustyypit tarkistettu 25.1.23. */
export interface Kentta {
  otsikko: string;
  arvo: string;
  tyyppi: string;
  ohje?: string;
}

// Metodi: getTicketFieldInfo
// API: /api/kurssi/:kurssi-id/uusitiketti/kentat/,
// api/kurssi/:kurssi-id/tiketinkentat/
export interface KentanTiedot {
  id: string;
  otsikko: string;
  pakollinen: boolean;
  esitaytettava: boolean;
  esitäyttö: string;
}

// Tiketin kommentti
// Metodi: getComments. API: /api/tiketti/:tiketti-id/kommentit/
// TODO: tiketin ja kommentin aikaleimojen tyypin voisi yhtenäistää.
export interface Kommentti {
  aikaleima: Date;
  lahettaja: Kurssilainen;
  tila: number;
  viesti: string;
}
