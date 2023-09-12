import { DatePipe } from '@angular/common';
import { Role } from "@core/core.models";

/* Palauta 'input' perustuva luku väliltä 0-'maxNumber', jota käytetään
   värin valintaan. */
 export async function getColorIndex(input: string, maxNumber: number):
   Promise<number> {
 const hash = await getHash(input);
 const hashPart = parseInt(hash.substr(0, 10), 16);
 return hashPart % maxNumber;
}

async function getHash(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    // .then(hashBuffer => {
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
  return hashHex;

  /*
  return crypto.subtle.digest('SHA-256', data)
    .then(hashBuffer => {
      console.log('hashbuffer: ' + hashBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
      return hashHex;
    });
    */
}

 // Palauta satunnainen kokonaisluku min ja max väliltä.
 export function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min) + min);
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

export function isInIframe () {
  try {
    return window.self !== window.top;
  } catch (e) {
    return true;
  }
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
