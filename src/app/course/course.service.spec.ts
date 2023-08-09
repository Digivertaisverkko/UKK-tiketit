import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { CourseService } from './course.service';
import { environment } from 'src/environments/environment';
import { ErrorService } from '@core/services/error.service';
import { Role } from '@core/core.models';

const courseID = '1';
const courseName = 'Testikurssi';
const api = environment.apiBaseUrl;

describe('CourseService', () => {
  let courses: CourseService;
  let controller: HttpTestingController;
  let errors: ErrorService

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule ]
    });
    courses = TestBed.inject(CourseService);
    controller = TestBed.inject(HttpTestingController);
    errors = TestBed.inject(ErrorService);
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

  it('sends invitation successfully', async () => {
    const courseID = '1';
    const email = 'test@example.com';
    const role: Role = 'opiskelija';
    const expectedResponse = { success: true, kutsu: 'invitationCode' };

    courses.sendInvitation(courseID, email, role).then((response) => {
      expect(response).toEqual(expectedResponse);
    });

    const req = controller.expectOne(
      `${api}/kurssi/${courseID}/osallistujat/kutsu`
    );
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ sposti: email, rooli: role });

    req.flush(expectedResponse);
  });

  it('handles error when sending invitation', (done) => {
    const courseID = '1';
    const email = 'test@example.com';
    const role: Role = 'opiskelija';

    courses.sendInvitation(courseID, email, role).then(() => {
      fail('Ei catchattu.');
    }).catch((error) => {
      console.log(error);
      expect(error).toBeDefined();
      expect(error.tunnus).toBe(3004);
      done();
    });

    const req = controller.expectOne(
      `${api}/kurssi/${courseID}/osallistujat/kutsu`
    );
    expect(req.request.method).toBe('POST');

    const status = 500;
    const errorid = 3004;
    const error = errors.createError(status, errorid);
    req.flush(error, { status: status, statusText: 'Error'});
  });
  
});
