// Tähän tiedostoon modelit, joita käytetään core-moduulissa sekä
// feature-moduuleissa.

export type Role = 'opiskelija' | 'opettaja' | 'admin' | null;

// Jos ollaan kirjautunena eri kurssille, ei saada id:ä.
export interface User {
  id?: number;
  nimi: string;
  sposti: string;
  asema: Role;
}