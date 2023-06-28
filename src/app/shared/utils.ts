import { Role } from "@core/core.models";

export function getCourseIDfromURL(): string | null {
  const pathArray = window.location.pathname.split('/');
  let courseID: string | null;
  if (pathArray[1] === 'course' && pathArray[2] != null)  {
    courseID = pathArray[2];
  } else {
    courseID = null;
  }
  return courseID
}

// Rooli muodossa, joka on tarkoitettu näytettäväksi UI:ssa.
export function getRoleString(asema: Role | null): string {
  let role: string;
    switch (asema) {
      case 'opiskelija':
        role = $localize`:@@Opiskelija:Opiskelija`; break;
      case 'opettaja':
        role = $localize`:@@Opettaja:Opettaja`; break;
      case 'admin':
        role = $localize`:@@Admin:Admin`; break;
      default:
        role = '';
    }
    return role;
}

  // Onko annettu aikaleima tänään.
  export function isToday(date: Date) : boolean {
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

  export function isYesterday(date: Date): boolean {
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

  // Onko string muodoltaan HTTP URL.
  export function isValidHttpUrl(testString: string): boolean {
    let url: URL;
    try {
      url = new URL(testString);
    } catch (_) {
      return false;
    }
    return url.protocol === "http:" || url.protocol === "https:";
  }

  // Onko merkkijono muodoltaan email:ksi tunnistettavissa.
  export function isValidEmail(email: string): boolean {
    let validationString = new String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
    return validationString == null ? false : true;
  }

  // Lyhennä pitkiä merkkijonoja vaihtoehtoisesti sanaraja huomioiden.
export function truncate( str: string, length: number, useWordBoundary: boolean ){
  if (typeof str !== 'string') {
    return str;
  }
  if (str.length <= length) { return str; }
  const subString = str.slice(0, length-1);
  return (useWordBoundary
    ? subString.slice(0, subString.lastIndexOf(" "))
    : subString) + "...";
};
