import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-error-card',
  templateUrl: './error-card.component.html',
  styleUrls: ['./error-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ErrorCardComponent implements OnInit {

  @Input() title: string = "Virheilmoitus";
  @Input() message: string = '';
  @Input() styles: object = {};

  constructor() { }

  ngOnInit(): void {
  }

}
