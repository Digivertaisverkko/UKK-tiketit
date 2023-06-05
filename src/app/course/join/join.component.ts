import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnDestroy, OnInit } from '@angular/core';
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

  public courseName: string = '';
  public user: User | null | undefined;
  private isLoggedIn: boolean | null | undefined;
  private loggedIn$ = new Subscription;
  private readonly courseID: string | null;
  private readonly invitationID: string | null;

  constructor(
    private auth: AuthService,
    private courses: CourseService,
    private route: ActivatedRoute,
    private router: Router,
    private store: StoreService,
    private title: Title,
  ) {
    this.courseID = this.route.snapshot.paramMap.get('courseid');
    this.title.setTitle(Constants.baseTitle + 'Liity kurssialueelle');
    const urlParams = new URLSearchParams(window.location.search);
    this.invitationID = urlParams.get('invitation');
  }

  ngOnInit(): void {
    if (this.invitationID === null) {
      console.error('Virhe: Ei UUID:ä.');
    } else {
      console.log('UUID: ' + this.invitationID);
    }
    if (this.courseID) {
      this.getCourseName(this.courseID);
    }
    this.loginIfNeeded();
    this.trackUserInfo();
  }

  ngOnDestroy(): void {
    this.loggedIn$.unsubscribe();
  }

  public joinCourse(): void{
    if (!this.courseID) {
      throw Error('Ei kurssi ID:ä, ei voida jatkaa.');
    }
    if (!this.invitationID) {
      throw Error('Ei UUID:ä, ei voida jatkaa.');
    }

    this.courses.joinCourse(this.courseID, this.invitationID).then(res => {
      if (this.isLoggedIn !== true) {
        this.auth.saveRedirectURL();
        this.auth.navigateToLogin(this.courseID);
      }
      if (res?.success === true) {
        const route = `course/${this.courseID}/list-tickets`
        this.router.navigateByUrl(route);
      } else {
        console.error('Ei onnistunut liittyminen.');
      }

    }).catch(err => {
    })
  }

  private getCourseName(courseID: string) {
    this.courses.getCourseName(courseID).then(response => {
      this.courseName = response ?? '';
    }).catch((response) => {
    });
  }

  private loginIfNeeded(): void {
    this.loggedIn$ = this.store.onIsUserLoggedIn().subscribe(response => {
      if (response === false) {
        this.isLoggedIn = false;
        this.auth.saveRedirectURL();
        this.auth.navigateToLogin(this.courseID);
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
