import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/* Validator käytettäväksi Reactive Formsiin. Funktion palauttama controller -
   funktio palauttaa null jos controllien kenttien merkkijonot on samat, muuten
    errorin: { notEqual: true } toiselle controllerille. */
export function stringsMatchValidator(controlName1: string, controlName2: string):
    ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const control1 = control.get(controlName1);
    const control2 = control.get(controlName2);
    if (control2?.value && control2.value !== control1?.value) {
      control2.setErrors({ notEqual: true})
    }
    return null
  }
}
