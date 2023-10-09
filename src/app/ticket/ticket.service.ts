import { HttpClient, HttpErrorResponse, HttpEvent, HttpEventType, HttpHeaders }
    from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject, firstValueFrom, of, timeout } from 'rxjs';

import { AddTicketResponse, Kentta, Kommentti, NewCommentResponse,
  SortableTicket, TikettiListassa, Tiketti, UKK, UusiTiketti, UusiUKK }
  from './ticket.models';
import { environment } from 'src/environments/environment';
import { ErrorService } from '../core/services/error.service';
import { Role } from '../core/core.models';
import { StoreService } from '../core/services/store.service';
import { UtilsService } from '@core/services/utils.service';

/**
 * Käsittelee tiketteihin eli kysymyksiin liittyvää tietoa mukaan lukien UKK:t.
 * Tikettipohjat ovat kurssin asetuksia ja niitä käsitelään course servicessä.
 * @export
 * @class TicketService
 */

@Injectable({ providedIn: 'root' })

export class TicketService {
  private api: string = environment.apiBaseUrl

  constructor (
    private errorService: ErrorService,
    private http: HttpClient,
    private store: StoreService,
    private utils: UtilsService
    ) {}

  /**
   * Lisää uusi kommentti tikettiin. Palauttaa true jos viestin lisääminen onnistui.
   *
   * @param {string} ticketID
   * @param {string} courseID
   * @param {string} message
   * @param {number} [tila]
   * @return {*}  {Promise<NewCommentResponse>}
   * @memberof TicketService
   */
  public async addComment(ticketID: string, courseID: string, message: string,
      tila?: number): Promise<NewCommentResponse> {
    if (isNaN(Number(ticketID))) {
      throw new Error('Kommentin lisäämiseen tarvittava ticketID ei ole numero.')
    }
    if (tila !== undefined) {
      if (tila < 0 || tila > 6) {
        throw new Error('ticketService.addComment: tiketin tilan täytyy olla väliltä 0-6.');
      }
    }
    interface newComment {
      viesti: string;
      tila?: number;
    }
    let body: newComment = { viesti: message }
    if (tila !== undefined) body.tila = tila
    let response: any;
    let url = `${this.api}/kurssi/${courseID}/tiketti/${ticketID}/kommentti`;
    try {
      response = await firstValueFrom( this.http.post<NewCommentResponse>(url, body ) );
    } catch (error: any) {
      this.handleError(error);
    }
    return response
  }

  /**
   * Lisää uusi UKK.
   *
   * @param {UusiUKK} newFaq
   * @param {string} courseID
   * @return {*}  {Promise<AddTicketResponse>}
   * @memberof TicketService
   */
  public async addFaq(newFaq: UusiUKK, courseID: string): Promise<AddTicketResponse> {
    const url = `${this.api}/kurssi/${courseID}/ukk`;
    let response: any;
    const body = newFaq;
    try {
      response = await firstValueFrom(this.http.post<UusiUKK>(url, body));
    } catch (error: any) {
      this.handleError(error);
    }
    return response
  }

  /**
   * Lisää uusi tiketti. Ei sisällä liitetiedostojen lisäämistä.
   *
   * @param {string} courseID
   * @param {UusiTiketti} newTicket
   * @return {*}  {Promise<AddTicketResponse>}
   * @memberof TicketService
   */
  public async addTicket(courseID: string, newTicket: UusiTiketti):
      Promise<AddTicketResponse> {
    let response: any;
    const url = `${this.api}/kurssi/${courseID}/tiketti`;
    const body = newTicket;
    try {
      response = await firstValueFrom(this.http.post<AddTicketResponse>(url, body));
    } catch (error: any) {
      this.handleError(error);
    }
    return response
  }

   /**
    * Arkistoi (poista) UKK.
    *
    * @param {string} ticketID
    * @param {string} courseID
    * @return {*}  {Promise<{ success: boolean }>}
    * @memberof TicketService
    */
   public async archiveFAQ(ticketID: string, courseID: string):
      Promise<{ success: boolean }> {
    let response: any;
    // /api/kurssi/:kurssi-id/ukk/arkisto/:tiketti-id/
    const url = `${this.api}/kurssi/${courseID}/ukk/arkisto`;
    const body = {
      tiketti: Number(ticketID)
    }
    try {
      response = await firstValueFrom<{ success: boolean }>(
        this.http.post<{ success: boolean }>(url, body)
      );
    } catch (error: any) {
      this.handleError(error);
    }
    return response;
  }

  /**
   * Aseta tiketti ratkaistuksi eli arkistoi se.
   *
   * @param {string} ticketID
   * @param {string} courseID
   * @return {*}  {Promise<{ success: boolean }>}
   * @memberof TicketService
   */
  public async archiveTicket(ticketID: string, courseID: string):
      Promise<{ success: boolean }> {
    let response: any;
    const url = `${this.api}/kurssi/${courseID}/tiketti/arkisto`;
    const body = {
      tiketti: Number(ticketID)
    }
    try {
      response = await firstValueFrom<{ success: boolean }>(
        this.http.post<{ success: boolean }>(url, body)
      );
    } catch (error: any) {
      this.handleError(error);
    }
    return response;
  }

  public async editComment(ticketID: string, commentID: string, comment: string,
        state: number, courseID: string): Promise<{ success: boolean }> {
    let response: any;
    const url = `${this.api}/kurssi/${courseID}/tiketti/${ticketID}/kommentti/
        ${commentID}`;
    let body;
    if (state < 3 || state > 5) {
      console.error('Muokattavan Kommentin tila täytyy olla 3, 4 tai 5.');
      body = { viesti: comment }
    } else {
      body = { viesti: comment, tila: state }
    }
    try {
      response = await firstValueFrom(this.http.put(url, body));
    } catch (error: any) {
      this.handleError(error);
    }
    return response
  }

  /**
   * Muokkaa aiemmin lähetettyä UKK:a.
   *
   * @param {string} ticketID
   * @param {UusiUKK} faq
   * @param {string} courseID
   * @return {*}  {Promise<{ success: boolean }>}
   * @memberof TicketService
   */
  public async editFaq(ticketID: string, faq: UusiUKK, courseID: string):
      Promise<{ success: boolean }> {
    let response: any;
    const url = `${this.api}/kurssi/${courseID}/ukk/${ticketID}`;
    const body = faq;
    try {
       response = await firstValueFrom(this.http.put<UusiUKK>(url, body));
    } catch (error: any) {
      this.handleError(error);
    }
    return response
  }

  /**
   * Muokkaa aiemmin lähetettyä tikettiä.
   *
   * @param {string} ticketID
   * @param {UusiTiketti} ticket
   * @param {string} courseID
   * @return {*}  {Promise<{ success: boolean }>}
   * @memberof TicketService
   */
  public async editTicket(ticketID: string, ticket: UusiTiketti, courseID: string):
      Promise<{ success: boolean }> {
    let response: any;
    const url = `${this.api}/kurssi/${courseID}/tiketti/${ticketID}`;
    const body = ticket;
    try {
      response = await firstValueFrom(this.http.put(url, body));
    } catch (error: any) {
      this.handleError(error);
    }
    return { success: response?.success === true ? true : false }
  }

  /**
   * Hae kaikki kurssin UKK:t.
   *
   * @param {string} courseID
   * @return {*}  {Promise<UKK[]>}
   * @memberof TicketService
   */
  public async getFAQlist(courseID: string): Promise<UKK[]> {
    const url = `${this.api}/kurssi/${courseID}/ukk/kaikki`;
    let response: any;
    try {
      response = await firstValueFrom(
        this.http.get<UKK[]>(url).pipe(timeout(3000))
      )
    } catch (error: any) {
      this.handleError(error);
    }
    let FAQlist = response;
    const thisYear = new Date().getFullYear();
    FAQlist.forEach((faq: any) => {
      faq.aikaleima = new Date(faq.aikaleima)
      faq.aikaleimaStr = this.utils.getDateString(faq.aikaleima, thisYear)
    })
    return FAQlist;
  }

  /**
   * Palauta tiketin sanallinen tila numeerinen arvon perusteella.
   * muotoa: 'tilan_numero'-'käännös'
   *
   * @param {number} numericalState
   * @param {(Role | '')} role
   * @return {*}  {string}
   * @memberof TicketService
   */
  public getTicketState(numericalState: number, role: Role | ''): string {
    let string: string;
    switch (numericalState) {
      case 0: string = $localize`:@@Virhetila:Virhetila`; break;
      case 1:
        if (role === 'opettaja') {
          string = $localize`:@@Lukematon:Lukematon`;
        } else {
          string = $localize`:@@Lähetetty:Lähetetty`;
        }
        break;
      case 2: string = $localize`:@@Luettu:Luettu`; break;
      case 3: string = $localize`:@@Lisätietoa pyydetty:Lisätietoa pyydetty`; break;
      case 4: string = $localize`:@@Kommentoitu:Kommentoitu`; break;
      case 5: string = $localize`:@@Ehdotettu:Ehdotettu`; break;
      case 6: string = $localize`:@@Ratkaistu:Ratkaistu`; break;
      default:
        throw new Error('getTicketState: Tiketin tilan numeerinen arvo täytyy olla välillä 0-6.');
    }
    // Numero edessä, koska järjestetään taulukossa sen mukaan.
    string = numericalState + '-' + string;
    return string;
  }

  // Testaamista varten.
  public getError(x: any, y : any, z: any): Observable<HttpErrorResponse> {
    const errorResponse = new HttpErrorResponse({
      error: 'File upload failed',
      status: 400,
      statusText: 'Bad Request',
    });
    return of(errorResponse);
  }

  /**
   * Lataa liitetiedosto.
   *
   * @param {string} ticketID
   * @param {string} commentID
   * @param {string} fileID
   * @param {string} courseID
   * @return {*}  {Promise<Blob>}
   * @memberof TicketService
   */
  public async getFile(ticketID: string, commentID: string, fileID: string,
      courseID: string): Promise<Blob> {
    let url = `${this.api}/kurssi/${courseID}/tiketti/${ticketID}`;
    // /api/kurssi/:kurssi-id/tiketti/:tiketti-id/kommentti/:kommentti-id/liite/:liite-id/tiedosto
    url += `/kommentti/${commentID}/liite/${fileID}/tiedosto`;
    const options = {
      responseType: 'blob' as 'json',
      headers: new HttpHeaders({ 'Content-Type': 'multipart/form-data' })
    };
    let response: any;
    try {
      response = await firstValueFrom(this.http.get<Blob>(url, options));
    } catch (error: any) {
      this.handleError(error);
    }
    return response
  }

  /**
   * Poista kommentti.
   *
   * @param {string} ticketID
   * @param {string} commentID
   * @param {string} courseID
   * @return {*}  {Promise<{ success: boolean}>}
   * @memberof TicketService
   */
  public async removeComment(ticketID: string, commentID: string, courseID: string):
      Promise<{ success: boolean}>{
    let response: any;
    const url = `${this.api}/kurssi/${courseID}/tiketti/${ticketID}/kommentti/
      ${commentID}`;
    try {
      response = await firstValueFrom<{ success: boolean }>(
        this.http.delete<{ success: boolean }>(url, {})
      );
    } catch (error: any) {
      this.handleError(error);
    }
    return response;
  }

  /**
   * Poista liitetiedosto.
   *
   * @param {string} ticketID
   * @param {string} commentID
   * @param {string} fileID
   * @param {string} courseID
   * @return {*}  {Promise<{ success: boolean}>}
   * @memberof TicketService
   */
  public async removeFile(ticketID: string, commentID: string, fileID: string,
      courseID: string): Promise<{ success: boolean}> {
    let url = `${this.api}/kurssi/${courseID}/tiketti/${ticketID}/kommentti/`+
      `${commentID}/liite/${fileID}`;
    let response: any;
    try {
      response = firstValueFrom(this.http.delete(url));
    } catch (error: any) {
      this.handleError(error);
    }
    return response
  }

  /**
   * Poista tiketti.
   *
   * @param {string} ticketID
   * @param {string} courseID
   * @return {*}  {Promise<{ success: boolean}>}
   * @memberof TicketService
   */
  public async removeTicket(ticketID: string, courseID: string):
      Promise<{ success: boolean}> {
    let response: any;
    let url = `${this.api}/kurssi/${courseID}/tiketti/${ticketID}`;
    try {
      response = await firstValueFrom(this.http.delete(url));
    } catch (error: any) {
      this.handleError(error);
    }
    return response;
  }

  /**
   * Palauttaa listan tikettien tiedoista taulukkoa varten. Opiskelijalle itse
   * lähettämät tiketit ja opettajalle kaikki kurssin tiketit. onlyOwn = true
   * palauttaa ainoastaan itse luodut tiketit, 'archived' palauta arkistoidut
   * eli ratkaistut kysymykset.
   *
   * @param {string} courseID
   * @param {({
   *     option: 'onlyOwn' | 'archived' })} [option]
   * @return {*}  {(Promise<SortableTicket[] | null>)}
   * @memberof TicketService
   */
  public async getTicketList(courseID: string, option?: {
    option: 'onlyOwn' | 'archived' }): Promise<SortableTicket[] | null> {
    const currentRoute = window.location.href;
    if (environment.testing === false &&
        currentRoute.indexOf('/list-tickets') === -1) {
      return null
    }
    if (courseID === '') throw new Error('Ei kurssi ID:ä.');
    let target;
    switch (option?.option ?? '') {
      case 'onlyOwn':
        target = 'omat'; break;
      case "archived":
        target = "arkisto"; break;
      default:
        target = "kaikki"
    }
    let url = `${this.api}/kurssi/${String(courseID)}/tiketti/${target}`;
    let response: any;
    try {
      response = await firstValueFrom(
        this.http.get<TikettiListassa[]>(url).pipe(timeout(3000))
      )
    } catch (error: any) {
      this.handleError(error);
    }
    // Muutetaan taulukkoon sopivaan muotoon.
    const user = this.store.getUserInfo();
    const myName = user?.nimi ?? '';
    const myRole = user?.asema ?? '';
    const me = $localize`:@@Minä:Minä`;
    const thisYear = new Date().getFullYear();
    let sortableData: SortableTicket[] = response.map((ticket: TikettiListassa) => {
      let viimeisinStr = '';
      if (ticket.viimeisin) {
        const viimeisinDate = new Date(ticket.viimeisin);
        viimeisinStr = this.utils.getDateString(viimeisinDate, thisYear);
      }
      return {
        tilaID: ticket.tila,
        tila: this.getTicketState(ticket.tila, myRole),
        id: ticket.id,
        otsikko: ticket.otsikko,
        aikaleima: new Date(ticket.aikaleima),
        aloittajanNimi: (ticket.aloittaja.nimi === myName) ? me : ticket.aloittaja.nimi,
        kentat: ticket.kentat,
        liite: ticket.liite ?? false,
        viimeisin: ticket.viimeisin ? new Date(ticket.viimeisin) : ticket.viimeisin,
        viimeisinStr: ticket.viimeisin ? viimeisinStr : ''
      }
    });
    return sortableData;
  }

  /**
   * Palauta yhden tiketin, myös UKK:n, kaikki tiedot mukaanlukien lisäkentät ja
   * kommentit.
   *
   * @param {string} ticketID
   * @param {string} courseID
   * @return {*}  {(Promise<Tiketti | null>)}
   * @memberof TicketService
   */
  public async getTicket(ticketID: string, courseID: string): Promise<Tiketti | null> {
    let response: any;
    const url = `${this.api}/kurssi/${courseID}/tiketti/${ticketID}`;
    try {
      response = await firstValueFrom(this.http.get<Tiketti>(url));
    } catch (error: any) {
      this.handleError(error);
    }
    if (response === null) return null;
    response.aikaleima = new Date(response.aikaleima);
    let ticket: Tiketti = response;
    const fields = await this.getFields(ticketID, courseID);
    // const fields: Kentta[] = await this.getFields(ticketID, courseID);
    ticket.kentat = fields;
    let comments: Kommentti[] = await this.getComments(ticketID, courseID);
    // Tiketin tiedot sisältyvät 1. kommentissa.
    const originalComment: Kommentti | null = this.getOldestComment(comments);
    ticket.kommenttiID = originalComment!.id;
    ticket.viesti = originalComment!.viesti;
    ticket.liitteet = originalComment!.liitteet;
    if (originalComment?.aikaleima) {
      ticket.aikaleima = new Date(originalComment?.aikaleima);
    }
    if (originalComment!.muokattu) {
      ticket.muokattu = new Date(originalComment!.muokattu);
    }
    ticket.kommentit = comments.filter(comment => comment !== originalComment);
    return ticket
  }

  // Palauta kommentti, jonka aikaleima on vanhin.
  private getOldestComment(comments: Kommentti[]): Kommentti | null {
    return comments.reduce((oldestComment: Kommentti | null,
          currentComment: Kommentti) => {
      if (!oldestComment || currentComment.aikaleima < oldestComment.aikaleima) {
        return currentComment;
      }
      return oldestComment;
    }, null);
  }

  /**
   * Palauta listan tiketin kommenteista.
   *
   * @private
   * @param {string} ticketID
   * @param {string} courseID
   * @return {*}  {Promise<Kommentti[]>}
   * @memberof TicketService
   */
  private async getComments(ticketID: string, courseID: string): Promise<Kommentti[]>{
    let response: any;
    // /api/kurssi/:kurssi-id/tiketti/:tiketti-id/kommentti/kaikki
    let url = `${this.api}/kurssi/${courseID}/tiketti/${ticketID}/kommentti/kaikki`;
    try {
      response = await firstValueFrom<Kommentti[]>(this.http.get<any>(url));
    } catch (error: any) {
      this.handleError(error);
    }
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
    return commentsAscending;
  }

  /**
   * Hae yhden tiketin kuvaus ja lisäkentät.
   *
   * @private
   * @param {string} ticketID
   * @param {string} courseID
   * @return {*}  {Promise<Kentta[]>}
   * @memberof TicketService
   */
  private async getFields(ticketID: string, courseID: string): Promise<Kentta[]> {
    let response: any;
    let url = `${this.api}/kurssi/${courseID}/tiketti/${ticketID}/kentat`;
    try {
      response = await firstValueFrom<Kentta[]>( this.http.get<any>(url) );
    } catch (error: any) {
      this.handleError(error);
    }
    return response;
  }

  private handleError(error: HttpErrorResponse) {
    this.errorService.handleServerError(error);
  }

  /**
   * Lähetä yksi liitetiedosto.
   *
   * @param {string} ticketID
   * @param {string} commentID
   * @param {string} courseID
   * @param {File} file
   * @return {*}  {Observable<number>}  Edistymisprosentti
   * @memberof TicketService
   */
  public uploadFile(ticketID: string, commentID: string, courseID: string, file: File):
      Observable<number>{
    let formData = new FormData();
    formData.append('tiedosto', file);
    const progress = new Subject<number>();
    // /api/kurssi/:kurssi-id/tiketti/:tiketti-id/kommentti/:kommentti-id/liite
    let url = `${this.api}/kurssi/${courseID}/tiketti/${ticketID}/kommentti/` +
        `${commentID}/liite`;
    this.http.post(url, formData, { reportProgress: true, observe: 'events' }, )
      .subscribe({
        next: (event: HttpEvent<any>) => {
          if (event.type === HttpEventType.UploadProgress && event.total !== undefined) {
            const percentDone = Math.round(100 * event.loaded / event.total);
            progress.next(percentDone);
          } else if (event.type === HttpEventType.Response) {
            progress.complete();
          }
        },
        error: (error) => {
          console.error('ticketService.uploadFile: saatiin virhe.');
          // this.handleError(error);
          progress.error(error);
        }
      })
    return progress.asObservable()
  }

}
