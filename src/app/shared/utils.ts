// Vakiot, joita on käytössä useammassa kuin yhdessä komponentissa.
export const Constants = {
  baseTitle: 'UKK Tiketit - ',
  MILLISECONDS_IN_MIN: 60000,
} as const;

// Onko näkymä Iframe -upotuksessa.
export function getIsInIframe(): boolean {
  // Tämä arvo on asetettu app.component.ts
  const isInIframe = window.sessionStorage.getItem('IN-IFRAME');
  return (isInIframe == 'true') ? true : false;
}

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

  export function isValidEmail(email: string): boolean {
    let validationString = new String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
    return validationString == null ? false : true;
  }
