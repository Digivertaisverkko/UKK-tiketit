import {  AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component,
          ContentChild, Input, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';

import { CourseService } from 'src/app/course/course.service';
import { environment } from 'src/environments/environment';
import { StoreService } from '@core/services/store.service';

/**
 *
 * H1-tason otsikko, joka on tavallisesti kurssin nimi. Voidaan asettaa
 * näkymään sovelluksen nimi tai kirjoittaa tagien sisään muu otsikko. Kurssin
 * nimeä ei oletuksen näytetä upotuksessa.
 *
 * @export
 * @class HeadlineComponent
 * @implements {OnInit}
 * @implements {AfterViewInit}
 */
@Component({
  selector: 'app-headline',
  template: `

    <!-- *ngIf="!isInIframe || showInIframe && (headlineText || hasProjectedContent)" -->
    <h1 class="mat-h1"
        [ngClass]="appHeadline ? 'login-h1' : ''"
        *ngIf="isInIframe !== 'true' || showInIframe"
        >
      <!-- Span-tagit tarvitsee otsikon ympärille, että teemassa muotoillaan oikein. -->
      <span>
        {{ headlineText }}
        <ng-content></ng-content>
      </span>
    </h1>

    <!-- <div class="vertical-spacer" *ngIf="isInIframe || !headlineText"></div> -->
  `,
  styleUrls: ['./headline.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeadlineComponent implements OnInit, AfterViewInit {

  /**
   * Arvolla true näytetään kurssin nimen sijaan sovelluksen nimi.
   *
   * @type {boolean}
   * @memberof HeadlineComponent
   */
  @Input() appHeadline: boolean = false

  /**
   * Arvolla false ei näytetä kurssin nimeä.
   *
   * @type {boolean}
   * @memberof HeadlineComponent
   */
  @Input() noCourseTitle: boolean = false;

  /**
   * Oletuksena otsikkoa ei näytetä upotuksessa, mutta arvolla true näytetään
   * myös silloin.
   *
   * @type {boolean}
   * @memberof HeadlineComponent
   */
  @Input() showInIframe: boolean = false;
  public hasProjectedContent = false;
  public headlineText: string | null = null;
  public isInIframe: string | null;

  constructor(
      private change: ChangeDetectorRef,
      private route : ActivatedRoute,
      private router: Router,
      private courses: CourseService,
      private store: StoreService,
  ) {
    this.isInIframe = window.sessionStorage.getItem('inIframe');
  }

  @ContentChild('projectedContent') projectedContent: any

  ngOnInit() {
    this.hasProjectedContent = !!this.hasProjectedContent;
    if (this.appHeadline) {
      this.headlineText = environment.productName + "-" +
          $localize `:@@tikettijärjestelmä:tikettijärjestelmä`;
    } else if (this.noCourseTitle !== true) {
      this.trackCourseID();
    }
  }

  ngAfterViewInit(): void {
    this.hasProjectedContent = !!this.hasProjectedContent;
  }

  private showCourseName(courseID: string) {
    this.courses.getCourseName(courseID).then(response => {
      this.headlineText = response ?? '';
      this.change.detectChanges();
      this.store.setCourseName(this.headlineText);
    }).catch((response) => {
      /* Jälkimmäinen testaa tyhjää objektia. Tulos tarkoittaa, että
          kurssia ei ole olemassa. */
      if (response === null || Object.keys(response).length === 0)  {
        this.router.navigateByUrl('404');
      }
      this.headlineText = '';
    });
  }

  private trackCourseID(): void {
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      var courseID: string | null = paramMap.get('courseid');
      if (courseID === null) {
        console.error('Virhe: ei kurssi ID:ä.');
      } else {
        this.showCourseName(courseID);
      }
    })
  }

}
