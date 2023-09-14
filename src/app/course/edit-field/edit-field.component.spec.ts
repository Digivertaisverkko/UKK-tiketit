import { ComponentFixture, TestBed, discardPeriodicTasks, fakeAsync, flush, tick } from '@angular/core/testing';
import { MockComponent } from 'ng-mocks';

import { EditFieldComponent } from './edit-field.component';
import { CourseService } from '@course/course.service';
import { BeginningButtonComponent } from '@shared/components/beginning-button/beginning-button.component';
import { HeadlineComponent } from '@shared/components/headline/headline.component';
import { CourseDummyData } from '@course/course.dummydata';
import { AuthDummyData } from '@core/services/auth.dummydata';
import { StoreService } from '@core/services/store.service';
import { findEl, setFieldValue } from '@shared/spec-helpers/element.spec-helper';
import { Kenttapohja } from '@course/course.models';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { RouterTestingModule } from '@angular/router/testing';
import { MatTooltip, MatTooltipModule } from '@angular/material/tooltip';

describe('EditFieldComponent', () => {
  const authDummyData = new AuthDummyData;
  let component: EditFieldComponent;
  const courseDummyData = new CourseDummyData;
  let fakeCourseService: jasmine.SpyObj<CourseService>;
  let fixture: ComponentFixture<EditFieldComponent>;
  let store: StoreService;


      beforeEach(async () => {
        fakeCourseService = jasmine.createSpyObj('CourseService', {
          getTicketFieldInfo: Promise.resolve(courseDummyData.ticketFieldInfo),
          setTicketField: Promise.resolve( true )
        });

        await TestBed.configureTestingModule({
          declarations: [
            EditFieldComponent,
            MockComponent(BeginningButtonComponent),
            MockComponent(HeadlineComponent),
          ],
          imports: [
            BrowserAnimationsModule,
            MatCheckboxModule,
            MatChipsModule,
            MatIconModule,
            MatInputModule,
            MatTooltipModule,
            ReactiveFormsModule,
            RouterTestingModule,
          ],
          providers: [
            { provide: CourseService, useValue: fakeCourseService },
            StoreService
          ]
        })
        .compileComponents();

        fixture = TestBed.createComponent(EditFieldComponent);
        store = TestBed.inject(StoreService);
        component = fixture.componentInstance;
        component.courseid = '1';
        store.setLoggedIn();
        store.setUserInfo(authDummyData.userInfoTeacher);
        store.setParticipant(true);
      });

      it('should create', () => {
        expect(component).toBeTruthy();
      });

      /*
      fit('shows correct field title', fakeAsync(() => {
        const newField: Kenttapohja =  {
          id: undefined,
          otsikko: "Uusi kenttä",
          pakollinen: false,
          esitaytettava: false,
          ohje: '',
          valinnat: [],
        };
        let expectedFields = courseDummyData.ticketFieldInfo.kentat;
        expectedFields.push(newField);
        fixture.detectChanges();
        tick(0);
        fixture.detectChanges();
        tick(1000);
        setFieldValue(fixture, 'title-input', newField.otsikko);
        tick();
        findEl(fixture, 'save-button').nativeElement.click();
        expect(component.form.invalid).toBeFalse();
        fixture.detectChanges();
        expect(fakeCourseService.setTicketField).toHaveBeenCalledWith(
          '1', expectedFields);
        discardPeriodicTasks();
      }));
      */

});
