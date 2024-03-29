import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';

/**
 * Yleishyödyllisiä funktioita, jotka eivät rajoitu vain tietyn komponentin tai
 * servicen vastuualueeseen, vaan voidaan käyttää missä tahansa.
 *
 * @export
 * @class UtilsService
 */
@Injectable({
  providedIn: 'root'
})
export class UtilsService {

  constructor() { }

  /* Palauta 'input' perustuva luku väliltä 0-'maxNumber', jota käytetään
   värin valintaan. */
  public async getColorIndex(input: string, maxNumber: number):
  Promise<number> {
  const hash = await this.getHash(input);
  const hashPart = parseInt(hash.substring(0, 10), 16);
  return hashPart % maxNumber;
  }

  /**
   * Angularin ActivatedRoute voi palauttaa joissain tilanteissa undefined, niin
   * tämä on osoittautunut varmemmaksi.
   *
   * @return {*}  {(string | null)}
   * @memberof UtilsService
   */
  public getCourseIDfromURL(): string | null {
    const pathArray = window.location.pathname.split('/');
    let courseID: string | null;
    if (pathArray[1] === 'course' && pathArray[2] != null)  {
      courseID = pathArray[2];
    } else {
      courseID = null;
    }
    return courseID
  }

  /**
   * Palauta päivämäärä merkkijonona. Jos päivämäärä on tänään, palauta
   * 'Tänään', jos eilen, palauta 'Eilen', muuten palauta päivämäärä
   * muodossa 'd.M.'.
   *
   * @param {Date} date
   * @param {number} thisYear
   * @return {*}  {string}
   * @memberof UtilsService
   */
  public getDateString(date: Date, thisYear: number): string {
    let dateString: string = '';
    const datePipe = new DatePipe('fi-FI');
    if (this.isToday(date)) {
      dateString = $localize `:@@Tänään:Tänään`;
    } else if (this.isYesterday(date)) {
      dateString = $localize `:@@Eilen:Eilen`;
    } else if (date.getFullYear() === thisYear) {
      dateString = datePipe.transform(date, 'd.M.') ?? '';
    } else {
      dateString = datePipe.transform(date, 'shortDate') ?? '';
    }
    return dateString
  }

  /**
   * Palauta merkkijonon hash.
   *
   * @param {string} input
   * @return {*}  {Promise<string>}
   * @memberof UtilsService
   */
  public async getHash(input: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
    return hashHex;
  }

  // Palauta satunnainen kokonaisluku min ja max väliltä.
  public getRandomInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min) + min);
  }

  // Onko annettu aikaleima tänään.
  public isToday(date: Date) : boolean {
    const isDate = date instanceof Date;
    if (!isDate) {
      throw Error('Virhe: "' + JSON.stringify(date) + '" on tyyppiä: ' + typeof date);
    }
    const CURRENT_DATE = new Date();
    const isToday: boolean =
      date.getFullYear() === CURRENT_DATE.getFullYear() &&
      date.getMonth() === CURRENT_DATE.getMonth() &&
      date.getDate() === CURRENT_DATE.getDate();
    return isToday
  }

  /**
   * Palauta, onko annettu päivämäärä eilinen.
   *
   * @param {Date} date
   * @return {*}  {boolean}
   * @memberof UtilsService
   */
  public isYesterday(date: Date): boolean {
    const isDate = date instanceof Date;
    if (!isDate) {
      throw Error('Virhe: "' + JSON.stringify(date) + '" on tyyppiä: ' + typeof date);
    }
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    const yesterday: Date = new Date(currentDate);
    yesterday.setDate(currentDate.getDate() - 1);
    const isYesterday: boolean =
      date.getFullYear() === yesterday.getFullYear() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getDate() === yesterday.getDate();
    return isYesterday
  }

  // Lyhennä pitkiä merkkijonoja vaihtoehtoisesti sanaraja huomioiden.
  public truncate(str: string, length: number, useWordBoundary: boolean) {
    if (typeof str !== 'string') {
      return str;
    }
    if (str.length <= length) { return str; }
    const subString = str.slice(0, length-1);
    return (useWordBoundary
      ? subString.slice(0, subString.lastIndexOf(" "))
      : subString) + "...";
  };

}
