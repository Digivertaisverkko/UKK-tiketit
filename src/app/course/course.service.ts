import { firstValueFrom, timeout } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { environment } from 'src/environments/environment';
import { ErrorService } from '@core/services/error.service';
import { GenericResponse, Role } from '@core/core.models';
import { InvitedInfo, Kenttapohja, Kurssini } from './course.models';
import { StoreService } from '@core/services/store.service';

/**
 * Kurssi. Käytetään mdetodissa: getCourses, API: /api/kurssit/
 *
 * @interface Kurssi
 */
interface Kurssi {
  id: string;
  nimi: string;
}

/**
 * Käsittelee kursseihin liittyvää tietoa.
 *
 * @export
 * @class CourseService
 */

@Injectable({ providedIn: 'root' })

export class CourseService {

  private api: string = environment.apiBaseUrl;

  constructor(
    private errorService: ErrorService,
    private http : HttpClient,
    private store: StoreService
  ) {
  }

  /**
   * Lisää uusi lisäkenttä tai muokkaa olemassaolevaa.
   *
   * @param {string} courseID
   * @param {Kenttapohja} editableField
   * @param {boolean} isNewField
   * @return {*}  {Promise<{ success: boolean }>}
   * @memberof CourseService
   */
  public async addField(courseID: string, editableField: Kenttapohja,
      isNewField: boolean): Promise<{ success: boolean }> {
    let info;
    try {
      info = await this.getTicketFieldInfo(courseID);
    } catch {
      throw Error('Ei saatu haettua kenttien tietoja.');
    }
    let allFields: Kenttapohja[] = info.kentat;
    if (isNewField === true) {
      allFields.push(editableField);
    } else {
      const index = allFields.findIndex(field => field.id == editableField.id);
      allFields.splice(index, 1, editableField);
    }
    let res;
    try {
      res = await this.setTicketField(courseID, allFields);
      return { success: true }
    } catch {
      throw Error('Ei saatu asetettua kenttien tietoja.');
    }
  }

  /**
   * Liitä ulkopuolinen käyttäjä kurssille.
   *
   * @param {string} courseID
   * @param {string} UUID
   * @return {*}  {Promise<{ success: boolean }>}
   * @memberof CourseService
   */
  public async joinCourse(courseID: string, UUID: string):
      Promise<{ success: boolean }> {
    let response;
    const url = `${this.api}/kurssi/${courseID}/osallistujat`;
    const body = {
      kutsu: UUID
    }
    try {
      response = await firstValueFrom(this.http.post<any>(url, body));
    } catch (error: any) {
      this.handleError(error);
    }
    return response;
  }

  /**
   * Lataa kurssin UKK:t JSON-stringinä.
   *
   * @param {string} courseID
   * @return {*}  {Promise<string>}
   * @memberof CourseService
   */
  public async exportFAQs(courseID: string): Promise<string> {
    let response: any;
    const url = `${this.api}/kurssi/${courseID}/ukk/vienti`;
    try {
      response = await firstValueFrom(this.http.get(url));
    } catch (error: any) {
      this.handleError(error);
    }
    let filecontent = JSON.stringify(response, null, 2);
    return filecontent;
  }

  /**
   * Lataa kurssin asetukset JSON-stringinä.
   *
   * @param {string} courseID
   * @return {*}  {Promise<string>}
   * @memberof CourseService
   */
  public async exportSettings(courseID: string): Promise<string> {
    let response: any;
    const url = `${this.api}/kurssi/${courseID}/tikettipohja/kentat`;
    try {
      response = await firstValueFrom(this.http.get(url));
    } catch (error: any) {
      this.handleError(error);
    }
    let filecontent = JSON.stringify(response, null, 2);
    return filecontent;
  }

  /**
   * Palauta listan kaikista kursseista.
   *
   * @return {*}  {Promise<Kurssi[]>}
   * @memberof CourseService
   */
  public async getCourses(): Promise<Kurssi[]> {
    let response: any;
    let url = environment.apiBaseUrl + '/kurssit';
    try {
      response = await firstValueFrom<Kurssi[]>(this.http.get<any>(url));
    } catch (error: any) {
      this.handleError(error);
    }
    return response;
  }

  /**
   * Palauta kurssin nimi.
   *
   * @param {string} courseID
   * @return {*}  {Promise<string>}
   * @memberof CourseService
   */
  public async getCourseName(courseID: string): Promise<string> {
    let response: any;
    const url = `${this.api}/kurssi/${courseID}`;
    try {
      response = await firstValueFrom(
        this.http.get<{ 'nimi': string }[]>(url).pipe(timeout(3000))
      )
    } catch (error: any) {
      this.handleError(error);
    }
    return response['nimi'];
  }

  /**
   * Palauta listan kaikista kursseista, joilla kirjautunut käyttäjä on.
   *
   * @return {*}  {Promise<Kurssini[]>}
   * @memberof CourseService
   */
  public async getMyCourses(): Promise<Kurssini[]> {
    let response: any;
    let url = environment.apiBaseUrl + '/minun/kurssit';
    try {
      console.log('Haetaan kurssit, joilla ollaan osallistujana.');
      response = await firstValueFrom<Kurssini[]>(this.http.get<any>(url));
    } catch (error: any) {
      this.handleError(error);
    }
    return response;
  }

  /**
   * Palauta käyttäjäkutsun tiedot.
   *
   * @param {string} courseID
   * @param {string} inviteID
   * @return {*}  {Promise<InvitedInfo>}
   * @memberof CourseService
   */
  public async getInvitedInfo(courseID: string, inviteID: string):
        Promise<InvitedInfo> {
    if (inviteID.length === 0) {
      throw Error('Ei kutsu ID:ä.');
    }
    let response;
    const url = `${this.api}/kurssi/${courseID}/osallistujat/kutsu/${inviteID}`;
    try {
      response = await firstValueFrom(this.http.get<any>(url));
    } catch (error: any) {
      this.handleError(error);
    }
    return response;
  }

    /**
     * Palauta tikettien lisäkentät sekä käyttäjälle uutta tikettiä tehdessä
     * näytettävä kuvaus.
     *
     * @param {string} courseID
     * @return {*}  {Promise<{ kuvaus: string,
     *       kentat: Kenttapohja[] }>}
     * @memberof CourseService
     */
    public async getTicketFieldInfo(courseID: string): Promise<{ kuvaus: string,
      kentat: Kenttapohja[] }> {
    let response: any;
    let url = `${this.api}/kurssi/${courseID}/tikettipohja/kentat`;
    try {
      response = await firstValueFrom(this.http.get<Kenttapohja[]>(url));
    } catch (error: any) {
      this.handleError(error);
    }
    return response;
  }

  /**
   * Lähetä tiedostoon tallennetut UKK:t lisättäväksi kurssille.
   *
   * @param {string} courseID
   * @param {JSON} filecontent
   * @return {*}  {(Promise<GenericResponse | any>)}
   * @memberof CourseService
   */
  public async importFAQs(courseID: string, filecontent: JSON):
      Promise<GenericResponse | any>{
    let response;
    const url = `${this.api}/kurssi/${courseID}/ukk/vienti`;
    const body = filecontent;
    try {
      response = await firstValueFrom(this.http.post<any>(url, body));
    } catch (error: any) {
      this.handleError(error);
    }
    return response;
  }

  /**
   * Lähetä tiedostoon tallennetut asetukset lisättäväksi kurssille.
   *
   * @param {string} courseID
   * @param {JSON} filecontent
   * @return {*}  {(Promise<GenericResponse | any>)}
   * @memberof CourseService
   */
  public async importSettings(courseID: string, filecontent: JSON):
      Promise<GenericResponse | any> {
    let response;
    const url = `${this.api}/kurssi/${courseID}/tikettipohja/vienti`;
    const body = filecontent;
    try {
      response = await firstValueFrom(this.http.post(url, body));
    } catch (error: any) {
      this.handleError(error);
    }
    return response;
  }

  /**
   * Poista lisäkenttä.
   *
   * @param {string} courseID
   * @param {string} removeFieldID
   * @return {*}  {Promise<{ success: boolean}>}
   * @memberof CourseService
   */
  public async removeField(courseID: string, removeFieldID: string):
      Promise<{ success: boolean}> {
    let info;
    try {
      info = await this.getTicketFieldInfo(courseID);
    } catch {
      throw Error('Ei saatu haettua kenttien tietoja.');
    }
    let allFields: Kenttapohja[] = info.kentat;
    const index = allFields.findIndex(field => field.id == removeFieldID);
    allFields.splice(index, 1);
    try {
      await this.setTicketField(courseID, allFields);
      return { success: true}
    } catch {
      throw Error('Ei saatu asetettua kenttien tietoja.');
    }
  }

  /**
   * Kutsu ulkopuolinen käyttäjä kurssille.
   *
   * @param {string} courseID
   * @param {string} email
   * @param {Role} role
   * @return {*}  {(Promise<{ success: boolean, kutsu: string } | any>)}
   * @memberof CourseService
   */
  public async sendInvitation(courseID: string, email: string, role: Role):
      Promise<{ success: boolean, kutsu: string } | any> {
    if (role === null) {
      throw Error('Ei roolia.');
    }
    let response;
    const url = `${this.api}/kurssi/${courseID}/osallistujat/kutsu`;
    const body = {
      sposti: email,
      rooli: role
    }
    try {
      response = await firstValueFrom(this.http.post(url, body));
    } catch (error: any) {
      this.handleError(error);
    }
    return response;
  }

  /**
   * Aseta kurssille ohjeteksti, joka on näkyvillä, kun käyttäjät
   * lisäävät tikettejä.
   *
   * @param {string} courseID
   * @param {string} helpText
   * @return {*}  {Promise<{ success: boolean }>}
   * @memberof CourseService
   */
  public async setHelpText(courseID: string, helpText: string):
      Promise<{ success: boolean }> {
    const url = `${this.api}/kurssi/${courseID}/tikettipohja/kuvaus`;
    let response: any;
    const body = { kuvaus: helpText };
    try {
      response = await firstValueFrom( this.http.put(url, body) );
    } catch (error: any) {
      this.errorService.handleServerError(error);
    }
    return response
  }

  /**
   * Luo uudet kentät kurssin tikettipohjalle.
   *
   * @param {string} courseID
   * @param {Kenttapohja[]} fields
   * @return {*}  {Promise<boolean>}
   * @memberof CourseService
   */
  public async setTicketField(courseID: string, fields: Kenttapohja[]):
      Promise<boolean> {
    // Haetuissa kentissä on id, mutta lähetettävissä ei ole.
    for (let field of fields) {
      if (field.id) delete field.id;
    }
    const url = `${this.api}/kurssi/${courseID}/tikettipohja/kentat`;
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
