/**
 * Mallit, joista tämä moduuli vastaa ja joita käytetään muuallakin.
 *
*/

export interface ConsentResponse {
  success: boolean,
  kurssi: number
}

export interface LoginInfo  {
  'login-url': string;
  'login-id': string;
}

export interface LoginResult {
  success: boolean,
  redirectUrl?: string
};

/**
 * Saadaan palvelimelta kirjauduttua.
 *
 * @export
 * @interface AuthInfo
 */
export interface AuthInfo {
  lti_login: boolean,
  perus: boolean
}

/**
 * Palvelimen virheilmoitus.
 *
 * @export
 * @interface Error
 */
export interface Error {
  tunnus: number;
  virheilmoitus?: string;
  originaali?: string;
}

export interface GenericResponse {
  success: boolean,
  error: object
}

// Rooli on null, jos ei ole kurssille osallistujana.
export type Role = 'opiskelija' | 'opettaja' | 'admin' | null;

/**
 * Käyttäjätiedot.
 *
 * id        Käyttäjä id. On null, jos on kirjautuneena eri kurssille.
 * nimi      Käyttäjän (muille näkyvä) nimi.
 * sposti    Käyttäjän sähköpostiosoite.
 * asema     Käyttäjän asema/rooli aktiivisella kurssilla.
 * asemaStr  Käyttäliittymässä näkyvä, käännetty asema/rooli.
 * osallistuja   Onko käyttäjä osallistujana aktiivisella kurssilla.
 *
 * @export
 * @interface User
 */
export interface User {
  id?: number;
  nimi: string;
  sposti: string;
  asema: Role;
  asemaStr?: string
  osallistuja?: boolean;
}
