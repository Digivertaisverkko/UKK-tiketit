import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output }
    from '@angular/core';
import { StoreService } from '@core/store.service';

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
        <button (click)="click()"
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

export class ErrorCardComponent implements OnInit {

  // styles: voi laittaa CSS:ää. Komponenttiin esim:
  // [styles]="{ margin: '1em 0 1em' }"
  @Input() buttonText: string = '';
  @Input() message: string = $localize `:@@Toiminto epäonnistui:Toiminto epäonnistui` + '.';
  @Input() styles: any;
  @Input() title: string = $localize `:@@Virhe:Virhe`;
  @Input() confirmLeave: boolean = false;
  @Output() clickEvent = new EventEmitter<string>();

  constructor(
      private store: StoreService
  ) {}


  ngOnInit(): void {
    if (this.confirmLeave) {
      this.buttonText = $localize `:@@Kyllä:Kyllä`;
      this.message = $localize `:@@Jos poistut:
          Jos poistut näkymästä kesken muokkauksen, menetät kaikki tekemäsi muutokset.`;
      this.title = $localize `:@@Oletko varma:Oletko varma?`;
    }
  }

  public click(): void {
    if (this.confirmLeave) {
      this.store.sendMessage('go begin');
    } else {
      this.clickEvent.emit('1')
    }
  }

}
