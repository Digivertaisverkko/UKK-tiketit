import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { firstValueFrom, Subject, Observable, throwError } from 'rxjs';
import '@angular/localize/init';
import { truncate } from '../utils/truncate';

@Injectable({
  providedIn: 'root',
})

// Tämä service on käsittelee tiketteihin liittyvää tietoa.
export class TicketService {
  private messages$ = new Subject<string>();

  constructor (private http: HttpClient) {}

  // Ota vastaan viestejä tästä servicestä (subscribe vastaukseen).
  public onMessages(): Observable<any> {
    return this.messages$.asObservable();
  }

  // Lopeta viestien vastaanottaminen tästä servicestä.
  public unsubscribeMessage(): void {
    this.messages$.unsubscribe;
  }

  public setActiveCourse(courseID: string | null) {
    if (courseID !== null) {
      window.sessionStorage.setItem('COURSE_ID', courseID);
    }
  }

  public getActiveCourse(): string {
    if (window.sessionStorage.getItem('COURSE_ID') === null) {
      throw new Error('Tallennettua kurssi id:ä ei löydetty.');
    }
    let  courseID = window.sessionStorage.getItem('COURSE_ID');
    if (courseID === null) {
      courseID = '0';
    }
    return courseID;
  }

// Hae kurssin UKK-kysymykset.
public async getFAQ(courseID: number): Promise<FAQ[]> {
  const httpOptions = this.getHttpOptions();
  let url = environment.apiBaseUrl + '/kurssi/' + courseID + '/ukk';
  let response: any;
  try {
    response = await firstValueFrom(this.http.get<FAQ[]>(url, httpOptions));
    console.log(
      'Saatiin GET-kutsusta URL:iin "' + url + '" vastaus: ' + JSON.stringify(response)
    );
  } catch (error: any) {
    this.handleError(error);
  }
  return response;
}

  // Palauta tiketin sanallinen tila numeerinen arvon perusteella.
public getTicketState(numericalState: number): string {
  if (numericalState < 0 || numericalState > 6 ) {
    throw new Error('getTicketState: Tiketin tilan numeerinen arvo täytyy olla välillä 0-6.');
  }
  let verbal: string = '';
  switch (numericalState) {
      case 0: verbal = $localize `:@@Virhetila:Virhetila`; break;
      case 1: verbal = $localize `:@@Lähetetty:Lähetetty`; break;
      case 2: verbal = $localize `:@@Luettu:Luettu`; break;
      case 3: verbal = $localize `:@@Lisätietoa pyydetty:Lisätietoa pyydetty`; break;
      case 4: verbal = $localize `:@@Kommentoitu:Kommentoitu`; break;
      case 5: verbal = $localize `:@@Ratkaistu:Ratkaistu`; break;
      case 6: verbal = $localize `:@@Arkistoitu:Arkistoitu`
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
  public async getTicketFieldInfo(courseID: string): Promise<FieldInfo[]> {
    const httpOptions = this.getHttpOptions();
    let response: any;
    let url = environment.apiBaseUrl + '/kurssi/' + courseID + '/uusitiketti/kentat';
    console.dir(httpOptions);
    try {
      response = await firstValueFrom(
        this.http.get<FieldInfo[]>(url, httpOptions)
      );
      console.log(
        'Saatiin GET-kutsusta URL:iin "' + url + '" vastaus: ' + JSON.stringify(response)
      );
      console.log(typeof response);
    } catch (error: any) {
      this.handleError(error);
    }
    this.checkErrors(response);
    return response;
  }

  // Lisää uusi tiketti. Palautusarvo kertoo, onnistuiko tiketin lisääminen.
  public async addTicket(courseID: string, newTicket: NewTicket) {
    const httpOptions = this.getHttpOptions();
    let response: any;
    const url = environment.apiBaseUrl + '/kurssi/' + courseID + '/uusitiketti';
    const body = newTicket;
    try {
      console.log('Yritetään lähettää tiketti: ' + JSON.stringify(newTicket) + '  ULR:iin "' +
      url + '"');
      response = await firstValueFrom(
        this.http.post<NewTicket>(url, body, httpOptions)
      );
      console.log(
        'saatiin vastaus tiketin lisäämiseen: ' + JSON.stringify(response)
      );
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

  // Palauta kurssin nimi.
  public async getCourseName(courseID: string): Promise<string> {
    const httpOptions = this.getHttpOptions();
    let response: any;
    let url = environment.apiBaseUrl + '/kurssi/' + courseID;
    console.dir(httpOptions);
    try {
      response = await firstValueFrom(
        this.http.get<{'kurssi-nimi': string}[]>(url, httpOptions)
      );
      console.log(
        'Saatiin GET-kutsusta URL:iin "' + url + '" vastaus: ' + JSON.stringify(response)
      );
      console.log(typeof response);
    } catch (error: any) {
      this.handleError(error);
    }
    // this.checkErrors(response);
    return response['nimi'];
  }

  // Palauta lista käyttäjän kursseista.
  public async getCourses(): Promise<Course[]> {
    const httpOptions = this.getHttpOptions();
    let response: any;
    let url = environment.apiBaseUrl + '/kurssit';
    try {
      response = await firstValueFrom<Course[]>(this.http.get<any>(url, httpOptions));
      console.log(
        'Saatiin GET-kutsusta URL:iin "' + url + '" vastaus: ' + JSON.stringify(response)
      );
    } catch (error: any) {
      this.handleError(error);
    }
    this.checkErrors(response);
    return response;
  }

  /* lähettää kirjautuneen käyttäjän luomat tiketit, jos hän on kurssilla opiskelijana.
  Jos on kirjautunut opettajana, niin palautetaan kaikki kurssin tiketit.
  onlyOwn = true palauttaa ainoastaan itse luodut tiketit. */
  public async getQuestions(courseID: number, onlyOwn?: boolean): Promise<Question[]> {
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
      response = await firstValueFrom(
        this.http.get<Question[]>(url, httpOptions)
      );
      // console.log(
      //   'Saatiin GET-kutsusta URL:iin "' + url + '" vastaus: ' + JSON.stringify(response)
      // );
    } catch (error: any) {
      this.handleError(error);
    }
    this.checkErrors(response);
    return response;
  }


  // Palauta yhden tiketin tiedot.
  public async getTicketInfo(ticketID: string): Promise<Ticket> {
    const httpOptions = this.getHttpOptions();
    let response: any;
    let url = environment.apiBaseUrl + '/tiketti/' + ticketID;
    try {
      response = await firstValueFrom(
        this.http.get<Ticket>(url, httpOptions)
      );
      console.log('Saatiin "' + url + '" vastaus: ' + JSON.stringify(response) + ' . Vastaus myös alla.');
      console.dir(response);
    } catch (error: any) {
      this.handleError(error);
    }
    this.checkErrors(response);
    let ticket: Ticket = response;
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
  private async getComments(ticketID: string, httpOptions: object): Promise<Comment[]>{
    let response: any;
    let url = environment.apiBaseUrl + '/tiketti/' + ticketID + '/kommentit';
    try {
      response = await firstValueFrom<Comment[]>(
        this.http.get<any>(url, httpOptions)
      );
      console.log('Got from "' + url + '" response: ' + JSON.stringify(response));
      console.dir(response);
    } catch (error: any) {
      this.handleError(error);
    }
    // if (Object.keys(response).length === 0) {
    // }
    let comments: Comment[];
    comments = this.arrangeComments(response);
    return comments
  }

  // Järjestä kommentit vanhimmasta uusimpaan.
  private arrangeComments(comments: Comment[]): Comment[] {
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
  private async getFields(ticketID: string, httpOptions: object): Promise<Field[]> {
    let response: any;
    let url = environment.apiBaseUrl + '/tiketti/' + ticketID + '/kentat';
    try {
      response = await firstValueFrom<Field[]>(
        this.http.get<any>(url, httpOptions)
      );
      console.log(
        'Saatiin GET-kutsusta URL:iin "' + url + '" vastaus: ' + JSON.stringify(response)
      );
    } catch (error: any) {
      this.handleError(error);
    }
    this.checkErrors(response);
    return response;
  }

  // Palauta HttpOptions, johon on asetettu session-id headeriin.
  private getHttpOptions(): object {
    let sessionID = window.sessionStorage.getItem('SESSION_ID');
    if (sessionID == undefined) {
      throw new Error('No session id set.');
    }
    console.log('session id on: ' + sessionID);
    let options = {
      headers: new HttpHeaders({
        'session-id': sessionID
      })
    };
    return options;
  }

  // HTTP-kutsujen virheidenkäsittely
  private handleError(error: HttpErrorResponse) {
    if (error.status === 0) {
      // A client-side or network error occurred.
      console.error('Virhe tapahtui:', error.error);
    } else {
      // The backend returned an unsuccessful response code.
      console.error(
        `Saatiin virhe tilakoodilla ${error.status} ja viestillä: `,
        error.error
      );
    }
    let message: string = '';
    if (error !== undefined) {
      if (error.error.length > 0) {
        message += $localize `:@@Virhe:Virhe` + ': ' + error.error;
      }
      if (error.status !== undefined) {
        message += `:@@Tilakoodi:Tilakoodi` + ': ' + error.status;
      }
    }
    return throwError(
      () => new Error(message)
    );
  }

  // Käsitellään mahdollisesti palvelimelta saatu virheilmoitus.
  private checkErrors(response: any) {
    var message: string = '';
    // if (response == undefined) {
    //   message = $localize `:@@Ei vastausta palvelimelta:Ei vastausta palvelimelta`;
    //   this.sendMessage(message);
    //   throw new Error(message);
    // }
    if (response?.error == undefined) {
      return
    }
    const error = response.error;
    console.log('error : ' + JSON.stringify(error));
    switch (error.tunnus) {
      case 1000:
        message = $localize`:@@Et ole kirjautunut:Et ole kirjautunut` + '.';
        break;
      case 1001:
        message = $localize`:@@Kirjautumispalveluun ei saatu yhteyttä:Kirjautumispalveluun ei saatu yhteyttä` + '.';
        break;
      case 1002:
        message = $localize`:@@Väärä käyttäjätunnus tai salasana:Virheellinen käyttäjätunnus tai salasana` + '.';
        break;
      case 1003:
        message = $localize`:@@Ei oikeuksia:Ei käyttäjäoikeuksia resurssiin` + '.';
        break;
      case 1010:
        message = $localize`:@@Luotava tili on jo olemassa:Luotava tili on jo olemassa` + '.';
        break;
      case 2000:
        // Haettavaa tietoa ei löytynyt, mutta ei käsitellä virheenä.
        break;
      case 3000:
      case 3004:
        // Jokin meni vikaan.
      default:
        throw new Error('Tuntematon tilakoodi: ' + JSON.stringify(error.tunnus) + ' Viesti: ' + error.virheilmoitus);
    }
    if (message.length > 0) {
      this.sendMessage(message);
    }
    if (error.tunnus !== 2000) {
      const newError = Error('Virhe: tunnus: ' + error.tunnus + ', viesti: ' + truncate(error.virheilmoitus, 250, true));
    }
  }

  // Lähetä virheviesti komponenttiin ja consoleen.
  private sendMessage(message: string) {
    console.log('ticketService: ' + message);
    this.messages$.next(message);
  }
}

export interface Comment {
  aikaleima: Date;
  lahettaja: {
    id: number;
    nimi: string;
    sposti: string;
    asema: string;
  }
  viesti: string;
}

export interface Course {
  id: string;
  nimi: string;
}

export interface Error {
  tunnus: number;
  virheilmoitus: string;
}

// Field = Tiketin lisäkenttä
export interface Field {
  id: number;
  arvo: string;
}

export interface Question {
  tila: number;
  id: number;
  otsikko: string;
  aikaleima: string;
  aloittaja: {
    id: number,
    nimi: string;
    sposti: string;
    asema: string;
  };
}

// Kentät ja kommentit ovat valinnaisia, koska ne haetaan myöhemmässä vaiheess omilla kutsuillaan.
export interface FieldInfo {
  id: string
  otsikko: string
  pakollinen: boolean
  esitaytettava: boolean
}

export interface NewTicket {
  otsikko: string;
  viesti: string;
  kentat?: Array<Field>;
  ukk: boolean;
}

// TODO: dummy-datassa ei vielä id:ä ja otsikko -> nimi. Tulee muuttumaan tikettiä vastaavaksi.
// id: number;
export interface FAQ {
  id: number;
  otsikko: string;
  aikaleima: string;
  tyyppi: string;
}


// Lisäkentät ja kommentit ovat valinnaisia, koska ne haetaan myöhemmässä vaiheessa omilla kutsuillaan.
export interface Ticket {
  id: number;
  otsikko: string;
  aikaleima: string;
  aloittaja: {
    id: number;
    nimi: string;
    sposti: string;
    asema: string;
  }
  tila: number;
  kentat?: Array<Field>;
  kurssi: number;
  viesti: string;
  kommentit: Array<Comment>;
  ukk?: boolean;
}