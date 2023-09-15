import { ComponentFixture, TestBed, discardPeriodicTasks, fakeAsync, flush, tick } from '@angular/core/testing';
import { Location } from '@angular/common';
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
import { Routes } from '@angular/router';
import { SettingsComponent } from '@course/settings/settings.component';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatCheckboxHarness } from '@angular/material/checkbox/testing';

describe('EditFieldComponent', () => {
  const authDummyData = new AuthDummyData;
  let component: EditFieldComponent;
  const courseDummyData = new CourseDummyData;
  let fakeCourseService: jasmine.SpyObj<CourseService>;
  let fixture: ComponentFixture<EditFieldComponent>;
  let loader: HarnessLoader;
  let location: Location;
  let store: StoreService;

  const routes: Routes = [
    { path: 'course/:courseid/settings', component: MockComponent(SettingsComponent)}
  ];

      beforeEach(async () => {
        fakeCourseService = jasmine.createSpyObj('CourseService', {
          addField: Promise.resolve({ success: true }),
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
            RouterTestingModule.withRoutes(routes),
          ],
          providers: [
            { provide: CourseService, useValue: fakeCourseService },
            Location,
            StoreService
          ]
        })
        .compileComponents();

        fixture = TestBed.createComponent(EditFieldComponent);
        loader = TestbedHarnessEnvironment.loader(fixture);
        location = TestBed.inject(Location);
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

      it('calls correct service method when making a new field and clicking "Save"',
          fakeAsync(async() => {
        const expectedField: Kenttapohja =  {
          id: undefined,
          otsikko: "Uusi kenttä",
          pakollinen: true,
          esitaytettava: false,
          ohje: 'Testiohje',
          valinnat: [],
        };
        fixture.detectChanges();
        tick(0);
        fixture.detectChanges();
        tick();
        setFieldValue(fixture, 'title-input', expectedField.otsikko);
        const mandatory = await loader.getHarness(MatCheckboxHarness.with(
          { selector: '[data-testid="mandatory-checkbox"]' }));
        await mandatory.check();
        setFieldValue(fixture, 'info-text-input', expectedField.ohje);
        tick();
        findEl(fixture, 'save-button').nativeElement.click();
        expect(component.form.invalid).toBeFalse();
        fixture.detectChanges();
        expect(fakeCourseService.addField).toHaveBeenCalledWith(
            component.courseid, expectedField, true);
        discardPeriodicTasks();
      }));


      //it('calls correct service method after editing field and clicking "Save"', fakeAsync(() => {
      // }));


});
