export type Role = 'opiskelija' | 'opettaja' | 'admin' | '';

// Jos ollaan kirjautunena eri kurssille, ei saada id:ä.
export interface User {
  id?: number;
  nimi: string;
  sposti: string;
  asema: Role;
}