import { Component, Input } from '@angular/core';
import { takeWhile } from 'rxjs';
import { Title } from '@angular/platform-browser';

import { StoreService } from '../services/store.service';
import { User } from '@core/core.models';

/**
 * "Ei oikeuksia" -näkymä. Näytetään, kun palvelimelta on saatu tieto, että
 * käyttäjällä ei ole oikeuksia näytettävään sisältöön.
 * Näytetään Alkuun -nappi, jos URL:ssa on kurssin id.
 *
 * @export
 * @class NoPrivilegesComponent
 */
@Component({
  template: `

  <div class="top-buttons-wrapper" *ngIf="courseid">
      <app-beginning-button></app-beginning-button>
    </div>

    <app-headline [noCourseTitle]="true" i18n="@@Tästä ei pääse">
      Tästä ei pääse
    </app-headline>

    <p i18n="@@Ei oikeuksia-näkymä">Sinulla ei ole joko oikeuksia tämän
      näkemiseen, tai etsimääsi tietoa ei ole olemassa.
    </p>

  `,
  styleUrls: ['./no-privileges.component.scss']
})

export class NoPrivilegesComponent {
  @Input() courseid: string | undefined;

  constructor(
    private store: StoreService,
    private title: Title
    ) {
      this.title.setTitle(this.store.getBaseTitle() + $localize
            `:@@Tästä ei pääse:Tästä ei pääse`);
  }

}
