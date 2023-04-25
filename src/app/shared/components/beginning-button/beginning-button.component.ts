import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-beginning-button',
  template: `
    <button color="accent"
            (click)="goBack()"
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
export class ToBeginningButtonComponent {

  @Input() disabled: boolean = false;

  constructor (
    private router: Router,
    private route: ActivatedRoute
    ) {
  }

  public goBack(): void {
    const courseID = this.route.snapshot.paramMap.get('courseid');
    this.router.navigateByUrl('course/' + courseID +  '/list-tickets');
  }

}
