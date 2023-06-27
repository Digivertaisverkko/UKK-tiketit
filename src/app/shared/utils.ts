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
  export function isToday(timestamp: string | Date) : boolean {
    if (typeof timestamp === 'string') {
      var dateString = new Date(timestamp).toDateString();
    } else {
      var dateString = timestamp.toDateString();
    }
    // console.log(' vertaillaan: ' + dateString + ' ja ' + this.currentDate);
    const CURRENT_DATE = new Date().toDateString();
    return dateString == CURRENT_DATE ? true : false
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
