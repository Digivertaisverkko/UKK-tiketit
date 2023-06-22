import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output,
    OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { StoreService } from '@core/services/store.service';

@Component({
  selector: 'app-beginning-button',
  template: `

    <button  color="accent"
            (click)="buttonPressed()"
            mat-raised-button
            [disabled]="disabled"
            >
      <mat-icon>arrow_back_ios</mat-icon>
      <span i18n="@@Alkuun">Alkuun</span>
    </button>
  `,
  styleUrls: ['./beginning-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BeginningButtonComponent implements OnInit, OnDestroy {

  @Input() confirm?: boolean = false;
  @Input() disabled: boolean = false;
  @Output() clicked = new EventEmitter<void>();

  private messages$: Subscription | null = null;

  constructor (
    private router: Router,
    private route: ActivatedRoute,
    private store: StoreService
    ) {
  }

  ngOnInit(): void {
    this.listenMessages();
  }

  ngOnDestroy(): void {
    this.messages$?.unsubscribe();
  }

  private listenMessages(): void {
    this.messages$ = this.store.trackMessages().subscribe(response => {
      if (response === 'go begin') this.buttonPressed();
    })
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

}
