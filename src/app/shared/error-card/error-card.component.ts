import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-error-card',
  templateUrl: './error-card.component.html',
  styleUrls: ['./error-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ErrorCardComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
