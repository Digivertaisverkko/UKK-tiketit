import {  Component, ChangeDetectionStrategy, ElementRef, EventEmitter, Output,
          ViewChild } from '@angular/core';

@Component({
  selector: 'app-search-bar',
  template: `
    <div class="search-bar">

      <input  class="input"
              #input
              type="text"
              (keyup)="searchResult.emit($event)"
              placeholder="&nbsp;"
              >

      <span class="label">
        <ng-content></ng-content>
      </span>

      <span class="highlight"></span>

      <button aria-disabled="true"
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

}
