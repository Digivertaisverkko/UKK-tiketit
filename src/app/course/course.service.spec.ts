import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { CourseService } from './course.service';
import { environment } from 'src/environments/environment';

const courseID = '1';
const courseName = 'Testikurssi';
const api = environment.apiBaseUrl;

describe('CourseService', () => {
  let courses: CourseService;
  let controller: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule ]
    });
    courses = TestBed.inject(CourseService);
    controller = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(courses).toBeTruthy();
  });

  it('gets the course name', (done) => {
    const url = `${api}/kurssi/${courseID}`
    let actualCourseName: string | undefined;
    courses.getCourseName(courseID).then(res => {
      actualCourseName = res;
      expect(actualCourseName).toEqual(courseName);
      done();
    }).catch(e => {
      done();
    })
    
    const request = controller.expectOne(url);
    request.flush({ nimi: 'Testikurssi' });
    controller.verify();
  })
});
