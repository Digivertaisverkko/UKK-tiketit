import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/* Validator käytettäväksi Reactive Formsiin. Funktion palauttama controller -
   funktio palauttaa null jos controllien kenttien merkkijonot on samat, muuten
    errorin: { notEqual: true } toiselle controllerille. */
export function isEmail(controlName: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const emailControl = control.get(controlName);
    const email = emailControl?.value;
    let validationString = new String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
      if (validationString === null) {
        emailControl?.setErrors({ notEmail: true})
      }
      return null
  }
}