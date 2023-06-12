import { Component } from '@angular/core';

@Component({
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {

  public lang: string | null;

  constructor() {
    this.lang = localStorage.getItem('language')?.substring(0,2) ?? 'fi';
  }

}
