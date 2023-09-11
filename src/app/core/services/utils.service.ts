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

}
