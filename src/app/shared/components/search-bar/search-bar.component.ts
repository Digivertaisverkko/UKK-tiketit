import {  Component, ChangeDetectionStrategy, ElementRef, EventEmitter, Output,
          ViewChild } from '@angular/core';
import { UtilsService } from '@core/services/utils.service';

@Component({
  selector: 'app-search-bar',
  template: `
    <div class="search-bar">

      <input  class="input"
              id="filter-items-{{inputID}}"
              #input
              (keyup)="onKeyup(input.value)"
              type="text"
              placeholder="&nbsp;"
              >
              <!-- (keyup)="searchResult.emit($event)" -->

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
  @Output() searchResult = new EventEmitter<string>();

  constructor(private utils: UtilsService) { }

  public inputID: number = this.utils.getRandomInt(1,10000);

  public onKeyup(inputValue: string) {
    this.searchResult.emit(inputValue);
  }

}
