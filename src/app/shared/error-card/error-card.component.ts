import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
@Component({
  selector: 'app-error-card',
  template: `

    <div class="border-area">
      <div class="headline-wrapper">
      <mat-icon fontIcon="warning_amber"></mat-icon>
        <h3 class="h3">{{ title }}</h3>
      </div>
      <div class="body-wrapper">
        <p>{{ message }}</p>
        <div>
        <button mat-raised-button *ngIf="buttonText.length > 0">
          {{buttonText}}
        </button>
      </div>
    </div>

  `,
  styleUrls: ['./error-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ErrorCardComponent {

  @Input() message: string =  $localize `:@@Toiminto epäonnistui:Toiminto epäonnistui` + '.';
  @Input() styles: object = {};
  @Input() title: string = $localize `:@@Virhe:Virhe`;
  @Input() buttonText: string = '';

  constructor() { }

}
