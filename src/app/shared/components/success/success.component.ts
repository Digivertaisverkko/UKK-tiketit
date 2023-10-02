import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

/**
 * Näyttää tagien välissä olevan sisällön muotoiltuna onnistumisviestiksi.
 *
 * @export
 * @class SuccessComponent
 */
@Component({
  selector: 'app-success',
  template: `
  <p [ngStyle]="styles">
    <mat-icon fontIcon="done"></mat-icon>
    <span>
      <ng-content></ng-content>
    </span>
  </p>
  `,
  styleUrls: ['./success.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SuccessComponent {

  /**
   * CSS-tyylit, jotka lisätään p-elementille. Syntaksi esim:
   *
   * [styles]="{ 'margin-top': '1.5rem', 'margin-bottom': '-0.5rem' }"
   *
   * @type {*}
   * @memberof SuccessComponent
   */
  @Input() styles?: any;
}
