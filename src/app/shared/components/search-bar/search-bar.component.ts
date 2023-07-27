import {  Component, ChangeDetectionStrategy, ElementRef, EventEmitter, Output,
          ViewChild } from '@angular/core';
import { getRandomInt } from '@shared/utils';

@Component({
  selector: 'app-search-bar',
  template: `
    <div class="search-bar">

      <input  class="input"
              id="filter-items-{{inputID}}"
              #input
              type="text"
              (keyup)="searchResult.emit($event)"
              placeholder="&nbsp;"
              >

      <label class="label" for="filter-items-{{inputID}}">
        <ng-content></ng-content>
      </label>

      <span class="highlight"></span>

      <button aria-hidden="true"
              class="search-btn"
              (click)="searchInput.nativeElement.focus()"
              mat-icon-button
              tabindex="-1"
              >
        <mat-icon>search</mat-icon>
      </button>

    </div>
  `,
  styleUrls: ['./search-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class SearchBarComponent {

  @ViewChild('input') searchInput!: ElementRef<HTMLInputElement>;
  @Output() searchResult = new EventEmitter<Event>();
  public inputID: number = getRandomInt(1,10000);

}
