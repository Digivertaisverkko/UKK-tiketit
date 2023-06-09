import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnDestroy, OnInit, Input } from '@angular/core';
import { Subscription, takeWhile } from 'rxjs';
import { Title } from '@angular/platform-browser';

import { AuthService } from '@core/auth.service';
import { Constants } from '@shared/utils';
import { CourseService } from '@course/course.service';
import { StoreService } from '@core/store.service';
import { User } from '@core/core.models';


@Component({
  templateUrl: './join.component.html',
  styleUrls: ['./join.component.scss']
})
export class JoinComponent implements OnInit, OnDestroy {

  @Input() courseid: string | null = null;
  @Input() invitation: string | null = null;
  public courseName: string = '';
  public errorMessage: string = '';
  public user: User | null | undefined;
  private isLoggedIn: boolean | null | undefined;
  private loggedIn$ = new Subscription;

  constructor(
    private auth: AuthService,
    private courses: CourseService,
    private router: Router,
    private store: StoreService,
    private title: Title,
  ) {
  }

  ngOnInit(): void {
    if (this.invitation === null) {
      console.error('Virhe: Ei UUID:ä.');
    } else {
      console.log('UUID: ' + this.invitation);
    }
    if (this.courseid) {
      this.getCourseName(this.courseid);
    }
    this.loginIfNeeded();
    this.trackUserInfo();
  }

  ngOnDestroy(): void {
    this.loggedIn$.unsubscribe();
  }

  public goToHome() {
   this.router.navigateByUrl('home');
  }

  public joinCourse(): void{
    if (!this.courseid) {
      throw Error('Ei kurssi ID:ä, ei voida jatkaa.');
    }
    if (!this.invitation) {
      throw Error('Ei UUID:ä, ei voida jatkaa.');
    }

    this.courses.joinCourse(this.courseid, this.invitation).then(res => {
      this.errorMessage = '';
      if (this.isLoggedIn !== true) {
        this.auth.saveRedirectURL();
        this.auth.navigateToLogin(this.courseid);
      }
      if (res?.success === true) {
        const route = `course/${this.courseid}/list-tickets`
        this.router.navigateByUrl(route);
      } else {
      this.errorMessage = $localize `:@@Liittyminen epäonnistui:Kurssille liittyminen ei onnistunut` + '.';
      }
    }).catch(err => {
      this.errorMessage = $localize `:@@Liittyminen epäonnistui:Kurssille liittyminen ei onnistunut` + '.';
    })
  }

  private getCourseName(courseid: string) {
    this.courses.getCourseName(courseid).then(response => {
      this.courseName = response ?? '';
      this.title.setTitle(Constants.baseTitle + 'Liity kurssialueelle ' + this.courseName);
    }).catch((response) => {
    });
  }

  private loginIfNeeded(): void {
    this.loggedIn$ = this.store.onIsUserLoggedIn().subscribe(response => {
      if (response === false) {
        this.isLoggedIn = false;
        this.auth.saveRedirectURL();
        this.auth.navigateToLogin(this.courseid);
      } else if (response === true) {
        this.isLoggedIn = true;
      }
    });
  }

  private trackUserInfo() {
    this.store.trackUserInfo().pipe(
      takeWhile(() => this.user === undefined)
      ).subscribe(res => {
      if (res?.nimi ) this.user = res;
    })
  }
  


}
