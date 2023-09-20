import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output,
    OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { StoreService } from '@core/services/store.service';

/**
 * Alkuun-nappi, joka menee URL:n osoittaman kurssin list-tickets -
 * näkymään. Tämä tapahtuu napin valitsemalla tai headerin logon klikkaus
 * lähettää messagen, jota tämä komponentti kuuntelee.
 *
 * @export
 * @class BeginningButtonComponent
 * @implements {OnInit}
 * @implements {OnDestroy}
 */
@Component({
  selector: 'app-beginning-button',
  template: `
    <button color="accent"
            (click)="buttonPressed()"
            data-testid='beginning-button'
            [disabled]="disabled"
            mat-raised-button
            >
      <mat-icon>arrow_back_ios</mat-icon>
      <span i18n="@@Alkuun">Alkuun</span>
    </button>
  `,
  styleUrls: ['./beginning-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class BeginningButtonComponent implements OnInit, OnDestroy {

  /**
   * Arvolla true ensimmäisellä napin valinnalla vain odotetaan 300ms,
   * jolloin parent component näyttää varmistusviestin.
   *
   * @type {boolean}
   * @memberof BeginningButtonComponent
   */
  @Input() confirm?: boolean = false;

  /**
   * Onko valinta pois käytöstä.
   *
   * @type {boolean}
   * @memberof BeginningButtonComponent
   */
  @Input() disabled: boolean = false;

  /**
   * Klikkaus-tapahtuma, kun painiketta klikataan.
   *
   * @memberof BeginningButtonComponent
   */
  @Output() clicked = new EventEmitter<void>();

  private messages$: Subscription | null = null;

  constructor (
    private router: Router,
    private route : ActivatedRoute,
    private store : StoreService
    ) {
  }

  ngOnInit(): void {
    this.listenMessages();
  }

  ngOnDestroy(): void {
    this.messages$?.unsubscribe();
  }

  public buttonPressed() {
    if (this.confirm === false) {
      this.goBack();
    } else {
      setTimeout(() => this.confirm = false, 300);
      this.clicked.emit();
    }
  }

  private goBack(): void {
    const courseID = this.route.snapshot.paramMap.get('courseid');
    this.router.navigateByUrl('course/' + courseID +  '/list-tickets');
  }

  private listenMessages(): void {
    this.messages$ = this.store.trackMessages().subscribe(response => {
      if (response === 'go begin') this.buttonPressed();
    })
  }

}
