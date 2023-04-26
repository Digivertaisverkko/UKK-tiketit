import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output }
    from '@angular/core';

@Component({
  selector: 'app-error-card',
  template: `

    <div class="border-area" [ngStyle]="styles">
      <div class="headline-wrapper">
      <mat-icon fontIcon="warning_amber"></mat-icon>
        <h3 class="h3">{{ title }}</h3>
      </div>
      <div class="body-wrapper">

        <p>{{ message }}</p>

        <!-- Lähettää '1' jos implementoidaan useampia nappeja. -->
        <button (click)="clickEvent.emit('1')"
                mat-raised-button
                *ngIf="buttonText.length > 0"
                >
          {{ buttonText }}
        </button>
    </div>

  `,
  styleUrls: ['./error-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class ErrorCardComponent {

  @Input() buttonText: string = '';
  @Input() message: string =  $localize `:@@Toiminto epäonnistui:Toiminto epäonnistui` + '.';
  @Input() styles: any;
  @Input() title: string = $localize `:@@Virhe:Virhe`;
  @Output() clickEvent = new EventEmitter<string>();

}
