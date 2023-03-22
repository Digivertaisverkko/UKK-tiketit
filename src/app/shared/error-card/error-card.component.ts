import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
@Component({
  selector: 'app-error-card',
  template: `

    <div class="border-area">
      <div class="headline-wrapper">
      <mat-icon fontIcon="warning_amber"></mat-icon>
        <h4 class="h4">{{ title }}</h4>
      </div>
      <p>{{ message }}</p>
    </div>

  `,
  styleUrls: ['./error-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ErrorCardComponent {

  @Input() message: string = 'Toiminto epäonnistui.';
  @Input() styles: object = {};
  @Input() title: string = 'Virhe';

  constructor() { }

}
