import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { environment } from 'src/environments/environment';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { PrivacyModalComponent } from '@core/footer/privacy-modal/privacy-modal.component';
import { StoreService } from '@core/services/store.service';
import { Title } from '@angular/platform-browser';

/**
 * Sovelluksen esittelynäkymä.Tähän näkymään ohjataan, jos URL sisältää pelkän
 * domainin tai linkillä.
 *
 * @export
 * @class HomeComponent
 * @implements {OnInit}
 */
@Component({
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})

export class HomeComponent implements OnInit {

  @Input() courseid: string | undefined;
  @ViewChild('privacyModal') privacyModalRef!: ElementRef;
  public lang: string | null;
  // public tietosuojaselosteesta: string = $localize `:@@Tietosuojaselosteen:tietosuojaselosteesta`;

  constructor(
    public dialog: MatDialog,
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
    this.title.setTitle(environment.productName + "-" +
        $localize `:@@tikettijärjestelmä:tikettijärjestelmä`);
  }

  public openPrivacyModal() {
    this.dialog.open(PrivacyModalComponent,  {
      data: { scrollToDataRemoval: true }
    });
  }

}
