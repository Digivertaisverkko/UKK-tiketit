import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { firstValueFrom, Subject, Observable, throwError } from 'rxjs';
import '@angular/localize/init';
import { truncate } from '../utils/truncate';
import { AuthService } from '../core/auth.service';
@Injectable({
  providedIn: 'root',
})

// Tämä service on käsittelee tiketteihin liittyvää tietoa.
export class TicketService {

  private activeCourse: number | undefined = undefined;
  private messages$ = new Subject<string>();

  constructor (private auth: AuthService,
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

  public async sendFaq(courseID: string, newFaq: UusiUKK) {
    const httpOptions = this.getHttpOptions();
    let response: any;
    const url = environment.apiBaseUrl + '/kurssi/' + courseID + '/ukk';
    const body = newFaq;
    try {
      console.log('Yritetään lähettää UKK POST-kutsulla bodylla: ' + JSON.stringify(body) + '  URL:iin "' +
      url + '"');
      response = await firstValueFrom(this.http.post<any>(url, body, httpOptions));
      console.log(
        'saatiin vastaus UKK:n lisäämiseen: ' + JSON.stringify(response)
      );
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
      console.log('Yritetään lähettää tiketti: ' + JSON.stringify(newTicket) + '  URL:iin "' +
      url + '"');
      response = await firstValueFrom(this.http.post<UusiTiketti>(url, body, httpOptions));
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
    // this.checkErrors(response);
    this.auth.setLoggedIn();
    return response;
  }

  // Palauta yhden tiketin tiedot.
  public async getTicketInfo(ticketID: string): Promise<Tiketti> {
    var sessionID: string | null = window.localStorage.getItem('SESSION_ID');
    const httpOptions = this.getHttpOptions();
    let response: any;
    let url = environment.apiBaseUrl + '/tiketti/' + ticketID;
    try {
      response = await firstValueFrom(this.http.get<Tiketti>(url, httpOptions));
      console.log('Saatiin "' + url + '" vastaus: ' + JSON.stringify(response) + ' . Vastaus myös alla.');
      console.dir(response);
    } catch (error: any) {
      this.handleError(error);
    }
    // this.checkErrors(response);
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
      console.log('Got from "' + url + '" response: ' + JSON.stringify(response));
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
      console.log(
        'Saatiin GET-kutsusta URL:iin "' + url + '" vastaus: ' + JSON.stringify(response)
      );
    } catch (error: any) {
      this.handleError(error);
    }
    // this.checkErrors(response);
    return response;
  }

  // Palauta HttpOptions, johon on asetettu session-id headeriin.
  private getHttpOptions(): object {
    let sessionID = window.localStorage.getItem('SESSION_ID');
    // if (sessionID == undefined) {
    //   throw new Error('getHttpOptions(): Virhe: ei session id:ä.');
    // }
    // console.log('session id on: ' + sessionID);
    // sessionID = '123456789';
    var options;
    if (sessionID == undefined) {
      options = {};
    } else {
      options = {
        headers: new HttpHeaders({ 'session-id': sessionID })
      };
    }
    return options;
  }

  // Lähetä muotoiltu virheviesti consoleen. Ohjaa kirjautumiseen, jos ei olla kirjauduttu.
  // Palauta virhe otettavaksi vastaan komponentissa.
  private handleError(error: any): Observable<never> {
    var message: string;
    if (error.status === 0) {
      // A client-side or network error occurred.
      message = 'Asiakas- tai verkkovirhe tapahtui';
      if (error.error !== undefined) {
        message += ": " + error.error;
      }
    } else {
      // The backend returned an unsuccessful response code.
      message = "Saatin virhe ";
      if (error.status !== undefined) {
        message += "HTTP-tilakoodilla " + error.status;
      }
      if (error.error !== undefined) {
        var errorObject = error.error;
        if (errorObject.error !== undefined) {
          message += ", sisäisellä tilakoodilla " + errorObject.error.tunnus;
          if (errorObject.error.virheilmoitus !== undefined) {
            message += " ja viestillä: ", errorObject.error.virheilmoitus
          }
        }
      }
    }
    console.error(message + ".");

    if (error.status === 403) {
      if (error.error !== undefined && error.error.error.tunnus == 1000) {
        this.auth.handleNotLoggedIn();
      }
    }
    // }
    // Templatessa pitäisi olla catch tälle.
    return throwError(() => new Error(error));
  }

  // private handleError(error: any) {
  //   if (error.status === 0) {
  //     // A client-side or network error occurred.
  //     console.error('Asiakas- tai verkkovirhe tapahtui:', error.error);
  //   } else {
  //     // The backend returned an unsuccessful response code.
  //     console.error(
  //       `Saatiin virhe HTTP-tilakoodilla ${error.status}, sisäisellä tilakoodilla ${error.error.error.tunnus} ja viestillä:`, error.error.error.virheilmoitus
  //     );
  //     if (error.status === 403 ) {
  //       console.dir(error);
  //       if (error.error !== undefined && error.error.error.tunnus == 1000) {
  //         this.auth.handleNotLoggedIn();
  //       }
  //     }
  //   }
    // let message: string = '';
    // if (error !== undefined) {
    //   if (error.error.length > 0) {
    //     message += $localize `:@@Virhe:Virhe` + ': ' + error.error;
    //   }
    //   if (error.status !== undefined) {
    //     message += $localize `:@@Tilakoodi:Tilakoodi` + ': ' + error.status;
    //   }
    // }
    // Templatessa pitäisi olla catch tälle.
  //   return throwError( () => new Error(error) );
  // }

  // Käsitellään mahdollisesti palvelimelta saatu virheilmoitus, joka ei tullut catch-blokkiin.
  // Tätä ei pitäisi enää tarvita.
  private checkErrors(response: any) {
    console.log(' --- checkErrors ----');
    var message: string = '';
    // if (response == undefined) {
    //   message = $localize `:@@Ei vastausta palvelimelta:Ei vastausta palvelimelta`;
    //   this.sendMessage(message);
    //   throw new Error(message);
    // }
    if (response?.error == undefined) {
      return
    }
    console.error(' Huomattiin responsena error, vaikkei jouduttu catch-blokkiin.');
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
      console.error($localize`:@@Virhe:Virhe` + ': ' + message);
    }
    if (error.tunnus == 1000) {
      this.auth.handleNotLoggedIn();
    } else if (error.tunnus !== 2000) {
      const newError = Error('Virhe: tunnus: ' + error.tunnus + ', viesti: ' + truncate(error.virheilmoitus, 250, true));
    }
  }

  // Lähetä virheviesti komponenttiin ja consoleen.
  private sendMessage(message: string) {
    this.messages$.next(message);
  }
}

// ========== Rajapinnat ==============

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

// Metodi: getQuestions, API: /api/kurssi/:kurssi-id/[kaikki|omat]/
export interface TiketinPerustiedot {
  id: number;
  otsikko: string;
  aikaleima: string;
  aloittaja: Kurssilainen;
  tila: number;
}

export interface Kurssilainen {
  id: number,
  nimi: string;
  sposti: string;
  asema: string;
}

// Metodi: getTicketInfo. Koostetaan useammista API-kutsuista.
// Lisäkentät ja kommentit ovat valinnaisia, koska ne haetaan
// eri vaiheessa omilla kutsuillaan.
// Backend palauttaa 1. kommentissa tiketin viestin sisällön, josta
// tulee rajapinnan jäsenmuuttujan "viesti" -sisältö.
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
}

// Metodi: addTicket, API: /api/kurssi/:kurssi-id/uusitiketti/
export interface UusiTiketti {
  otsikko: string;
  viesti: string;
  kentat?: Array<Kentta>;
}

// Metodi: sendFaq. API: /api/kurssi/:kurssi-id/ukk/
export interface UusiUKK extends UusiTiketti {
  vastaus: string;
}

// Tiketin lisäkenttä.
// Metodi: getFields, API: /api/tiketti/:tiketti-id/kentat/
// Uusia propertyjä: tyyppi ja ohje.
export interface Kentta {
  id: number;
  arvo: string;
  tyyppi?: string;
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
