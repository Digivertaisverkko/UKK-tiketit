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