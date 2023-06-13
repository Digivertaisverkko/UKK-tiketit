import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { StoreService } from '@core/services/store.service';


@Component({
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})

export class HomeComponent {

  @Input() courseid: string | null = null;
  public lang: string | null;

  constructor(
    private router: Router,
    private store: StoreService
  ) {
    // Kun esim. headerin logoa klikataan.
    this.store.trackMessages().pipe(
      takeUntilDestroyed()).subscribe(response => {
        if (response === 'go begin') {
          const route = `course/${this.courseid}/list-tickets`;
          this.router.navigateByUrl(route);
        }
      });
    this.lang = localStorage.getItem('language')?.substring(0,2) ?? 'fi';
  }


}
