import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController }
    from '@angular/common/http/testing';

import { CourseDummyData } from './course.dummydata';
import { CourseService } from './course.service';
import { environment } from 'src/environments/environment';
import { ErrorService } from '@core/services/error.service';
import { Kenttapohja } from './course.models';
import { Role } from '@core/core.models';

environment.testing = true;
const api = environment.apiBaseUrl;
const courseDummyData = new CourseDummyData();
const courseID = '1';
const courseName = 'Testikurssi';

describe('CourseService', () => {
  let courses: CourseService;
  let controller: HttpTestingController;
  let errors: ErrorService

  afterEach(() => {
    controller.verify();
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
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
      fail('got error');
    })
    const request = controller.expectOne(url);
    request.flush({ nimi: 'Testikurssi' });
  });

  it('makes correct requests to remove an additional ticket field', fakeAsync(() => {
    const expectedUrl = `${api}/kurssi/${courseID}/tikettipohja/kentat`;

    let allFields = courseDummyData.ticketFieldInfo.kentat;
    const fieldID = String(allFields[1].id);
    const index = allFields.findIndex(field => field.id == fieldID);
    allFields.splice(index, 1);

    // Lähetettävissä kentissä ei ole id:ä.
    for (let field of allFields) {
      if (field.id) delete field.id;
    }
    let exptectedBody = { kentat: allFields };

    courses.removeField(courseID, fieldID).then((res) => {
      expect(req).toBeDefined();
      expect(req2.request.body).toEqual(exptectedBody);
    }).catch(e => {
      fail('got error');
    });

    const req = controller.expectOne({ method: 'GET', url: expectedUrl });
    req.flush(courseDummyData.ticketFieldInfo);
    tick();

    const req2 = controller.expectOne({ method: 'PUT', url: expectedUrl });
    req2.flush({ success: true });
  }));

  it('makes correct requests when adding a new additional field', fakeAsync(() => {
    const newField: Kenttapohja = {
      otsikko: "Uusi kenttä",
      ohje: "Kentän ohje",
      esitaytettava: false,
      pakollinen: true,
      valinnat: [ "" ]
    }
    let fields = courseDummyData.ticketFieldInfo.kentat;
    for (let field of fields) {
      if (field.id) delete field.id;  // Lähetettävissä kentissä ei ole id:ä.
    }
    fields.push(newField);
    let exptectedBody = { kentat: fields };
    const expectedUrl = `${api}/kurssi/${courseID}/tikettipohja/kentat`;

    courses.addField(courseID, newField, true).then((res) => {
      expect(req).toBeDefined();
      expect(req2).toBeDefined();
      expect(req2.request.body).toEqual(exptectedBody);
    }).catch(e => {
      fail('got error');
    });

    const req = controller.expectOne({ method: 'GET', url: expectedUrl });
    req.flush(courseDummyData.ticketFieldInfo);
    tick();

    const req2 = controller.expectOne({ method: 'PUT', url: expectedUrl });
    req2.flush({ success: true });
  }));

  it('makes correct requests when editing an existing additional field',
      fakeAsync(() => {
    let editedField: Kenttapohja = courseDummyData.ticketFieldInfo.kentat[1];
    editedField.otsikko = "Muokattu otsikko";
    editedField.ohje = "Muokattu ohje";
    editedField.pakollinen = true;

    let allFields = courseDummyData.ticketFieldInfo.kentat;
    const index = allFields.findIndex(field => field.id == editedField.id);
    allFields.splice(index, 1, editedField);

    // Lähetettävissä kentissä ei ole id:ä.
    for (let field of allFields) {
      if (field.id) delete field.id;
    }
    const exptectedBody = { kentat: allFields };
    const expectedUrl = `${api}/kurssi/${courseID}/tikettipohja/kentat`;

    courses.addField(courseID, editedField, false).then((res) => {
      expect(req).toBeDefined();
      expect(req2).toBeDefined();
      expect(req2.request.body).toEqual(exptectedBody);
    }).catch(e => {
      fail('got error');
    });

    const req = controller.expectOne({ method: 'GET', url: expectedUrl });
    req.flush(courseDummyData.ticketFieldInfo);
    tick();

    const req2 = controller.expectOne({ method: 'PUT', url: expectedUrl });
    req2.flush({ success: true });
  }));

  it('sends help text for making tickets', (done) => {
    courses.setHelpText(courseID, 'test help text').then(() => {
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({ kuvaus: 'test help text' });
      done();
    }).catch(e => {
      fail('got error');
    })
    const url = `${api}/kurssi/${courseID}/tikettipohja/kuvaus`;
    const req = controller.expectOne(url);
    req.flush({ success: true });
  });

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
