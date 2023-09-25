/**
 * Mallit, joista tämä moduuli vastaa ja joita voidaan käyttää muuallakin.
 * 
*/


export interface LoginInfo  {
  'login-url': string;
  'login-id': string;
}

export interface LoginResult {
  success: boolean,
  redirectUrl?: string
};

// Saadaan palvelimelta kirjauduttua.
export interface AuthInfo {
  lti_login: boolean,
  perus: boolean
}

export interface Error {
  tunnus: number;
  virheilmoitus?: string;
  originaali?: string;
}

export interface GenericResponse {
  success: boolean,
  error: object
}

export type Role = 'opiskelija' | 'opettaja' | 'admin' | null;

/* Jos ollaan kirjautunena eri kurssille, ei saada id:ä.
   'asemaStr' on käyttöliittymässä näytettävä, käännetty käyttäjän asema.
*/
export interface User {
  id?: number;
  nimi: string;
  sposti: string;
  asema: Role;
  asemaStr?: string
}
