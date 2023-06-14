import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { StoreService } from '@core/services/store.service';
import { Title } from '@angular/platform-browser';


@Component({
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})

export class HomeComponent implements OnInit{

  @Input() courseid: string | null = null;
  public lang: string | null;

  constructor(
    private router: Router,
    private store: StoreService,
    private title: Title
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

  ngOnInit(): void {
    this.title.setTitle("Tukki-" + $localize `:@@tikettijärjestelmä:tikettijärjestelmä`);
  }


}
