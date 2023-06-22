import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

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

  @Input() styles: any;

}
