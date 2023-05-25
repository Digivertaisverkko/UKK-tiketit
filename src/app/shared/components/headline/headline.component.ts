import {  AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component,
          ContentChild, Input, OnInit } from '@angular/core';
import { getIsInIframe } from 'src/app/shared/utils';
import { CourseService } from 'src/app/course/course.service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { StoreService } from '@core/store.service';

@Component({
  selector: 'app-headline',
  template: `

    <h1 class="mat-h1"
        [ngClass]="login ? 'login-h1' : ''"
        *ngIf="!isInIframe || showInIframe && (headlineText || hasProjectedContent)"
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

  // Kirjautumissivulla otsikko on erilainen.
  @Input() login: boolean = false
  // Oletuksena näytetään kurssin nimi.
  @Input() noCourseTitle: boolean = false;
  // Oletuksena otsikkoa ei näytetä upotuksessa. Tällä voi näyttää sen aina.
  @Input() showInIframe: boolean = false;
  public hasProjectedContent = false;
  public headlineText: string | null = null;
  public isInIframe: boolean;

  constructor(
      private change: ChangeDetectorRef,
      private route : ActivatedRoute,
      private router: Router,
      private courses: CourseService,
      private store: StoreService,
  ) {
    this.isInIframe = getIsInIframe();
  }

  @ContentChild('projectedContent') projectedContent: any

  ngOnInit() {
    if (this.login) {
      this.headlineText = "DVV-tikettijärjestelmä";
    } else if (this.noCourseTitle !== true) {
      this.trackCourseID();
    }
  }

  ngAfterViewInit(): void {
    this.hasProjectedContent = !!this.hasProjectedContent;
  }

  private showCourseName(courseID: string) {
    this.courses.getCourseName(courseID).then(response => {
      console.warn(response);
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
        throw new Error('Virhe: ei kurssi ID:ä.');
      }
      this.showCourseName(courseID);
    })
  }

}
