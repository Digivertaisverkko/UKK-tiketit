import { ValidatorFn, AbstractControl } from '@angular/forms';

/* Reactive Form:ssa käytettävä validator. */

/* Arrayn merkkijonojen yhteenlaskettu pituus huomioiden 1 välimerkki niide
   välissä. */
export function arrayLengthValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const selections = control.value;
    const totalLength = getArraysStringLength(selections);

    if (totalLength > 255) {
      return { maxLengthExceeded: true };
    }

    return null;
  };
}

export function getArraysStringLength(array: string[]): number {
  if (array.length === 0) return 0;
  let totalLength = 0;
  for (const string of array) {
    totalLength += string.length;
  }
  totalLength += array.length - 1;
  return totalLength;
}
