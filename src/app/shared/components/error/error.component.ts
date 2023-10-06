import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output }
    from '@angular/core';
import { StoreService } from '@core/services/store.service';

/**
 *
 * Näyttää virheilmoituksen.
 *
 * @export
 * @class HeadlineComponent
 * @implements {OnInit}
 * @implements {AfterViewInit}
 */
@Component({
  selector: 'app-error',
  template: `

    <div class="border-area" [ngStyle]="styles">
      <div class="headline-wrapper">
      <mat-icon fontIcon="warning_amber"></mat-icon>
        <h3 class="h3">{{ title }}</h3>
      </div>
      <div class="body-wrapper">

        <p>{{ message }}</p>

        <button (click)="click()"
                mat-raised-button
                *ngIf="buttonText.length > 0"
                >
          {{ buttonText }}
        </button>
    </div>

  `,
  styleUrls: ['./error.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class ErrorComponent implements OnInit {

  /**
   * Näyttää näppäimen tällä tekstillä.
   * @memberof ErrorComponent
   */
  @Input() buttonText: string = '';

  /**
   * Virheilmoituksen tekstil.
   * @type {string}
   * @memberof ErrorComponent
   */
  @Input() message: string = $localize `:@@Toiminto epäonnistui:Toiminto epäonnistui` + '.';

  /**
   * Vapaita SCSS-tyylimäärittelyjä. Esim.
   * [styles]="{ margin: '1em 0 1em' }
   * @type {*}
   * @memberof ErrorComponent
   */
  @Input() styles?: any;

  /**
   * Virheilmoituksen otsikko
   * @type {string}
   * @memberof ErrorComponent
   */
  @Input() title: string = $localize `:@@Virhe:Virhe`;

  /**
   * Näytetäänkö virheilmoituksena Ilmoitus, jossa kerrotaan, että käyttäjä poistuu
   * näkymästä kesken muokkauksen, hän menettää tekemänsä muutokset. Tämän lisäksi
   * näytetään ilmoituksesta Kyllä-nappi, jolla käyttäjä voi tämän vahvistaa.
   * @type {boolean}
   * @memberof ErrorComponent
   */
  @Input() confirmLeave: boolean = false;

  /**
   * Jos ilmoituksessa näytetään näppäin, niin sen painalluksen event.
   * @memberof ErrorComponent
   */
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
      /*  1 vittaa ensimmäiseen näppäimeen siltä varalta, jos lisätään useampia
          näppäimiä */
      this.clickEvent.emit('1')
    }
  }

}
