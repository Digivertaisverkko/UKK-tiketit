import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-error-card',
  templateUrl: './error-card.component.html',
  styleUrls: ['./error-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ErrorCardComponent {

  @Input() title: string = 'Virhe';
  @Input() message: string = 'Toiminto epäonnistui.';
  @Input() styles: object = {};

  constructor() { }

}
