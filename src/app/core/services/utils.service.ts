import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {

  constructor() { }

  // Angularin ActivatedRoute voi palauttaa undefined, niin tämä on varmempi.
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

}
