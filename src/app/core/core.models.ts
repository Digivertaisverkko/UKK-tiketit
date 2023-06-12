// Tähän tiedostoon modelit, joita käytetään core-moduulissa sekä
// feature-moduuleissa.

export interface LoginInfo  {
  'login-url': string;
  'login-id': string;
}

export interface Error {
  tunnus: number;
  virheilmoitus: string;
  originaali?: string;
}

export interface GenericResponse {
  success: boolean,
  error: object
}

export type Role = 'opiskelija' | 'opettaja' | 'admin' | null;

// Jos ollaan kirjautunena eri kurssille, ei saada id:ä.
export interface User {
  id?: number;
  nimi: string;
  sposti: string;
  asema: Role;
  asemaStr?: string
}
