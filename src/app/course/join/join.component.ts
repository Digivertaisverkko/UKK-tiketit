import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { takeWhile } from 'rxjs';

import { Constants } from '@shared/utils';
import { CourseService } from '@course/course.service';
import { StoreService } from '@core/store.service';
import { AuthService } from '@core/auth.service';
import { User } from '@core/core.models';


@Component({
  templateUrl: './join.component.html',
  styleUrls: ['./join.component.scss']
})
export class JoinComponent implements OnInit {

  public courseName: string = '';
  public user: User | null | undefined;
  private readonly courseID: string | null;
  private readonly UUID: string | null;

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
    this.UUID = urlParams.get('UUID');
  }

  ngOnInit(): void {
    if (this.UUID === null) {
      console.error('Virhe: Ei UUID:ä.');
    } else {
      console.log('UUID: ' + this.UUID);
    }
    if (this.courseID) this.trackCourseName(this.courseID);
    this.trackUserInfo();
  }

  public joinCourse(): void{
    if (!this.courseID) {
      throw Error('Ei kurssi ID:ä, ei voida jatkaa.');
    }
    if (!this.UUID) {
      throw Error('Ei UUID:ä, ei voida jatkaa.');
    }
    this.courses.joinCourse(this.courseID, this.UUID).then(res => {
      if (res?.success === true) {
        if (this.store.getIsLoggedIn()) {
          const route = `course/${this.courseID}/list-tickets`
          this.router.navigateByUrl(route);
        } else {
          this.auth.navigateToLogin(this.courseID);
        }
      } else {
        console.error('Ei onnistunut liittyminen.');
      }

    }).catch(err => {
    })
  }

  private trackCourseName(courseID: string) {
    this.courses.getCourseName(courseID).then(response => {
      this.courseName = response ?? '';
    }).catch((response) => {
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
