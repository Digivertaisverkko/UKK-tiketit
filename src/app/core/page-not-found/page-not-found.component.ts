import { Component } from '@angular/core';

@Component({
  templateUrl: './page-not-found.component.html',
  styleUrls: ['./page-not-found.component.scss']
})
export class PageNotFoundComponent {
  public errorMessage: string = $localize `:@@404:Osoitteessa määriteltyä sivua ei ole olemassa.`;
}