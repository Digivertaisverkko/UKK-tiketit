import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ComponentFixture, TestBed, discardPeriodicTasks, fakeAsync, flush, tick } from '@angular/core/testing';
import { findEl, setFieldValue } from '@shared/spec-helpers/element.spec-helper';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioButtonHarness } from '@angular/material/radio/testing';
import { MatRadioModule } from '@angular/material/radio';
import { MockComponent } from 'ng-mocks';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { Routes } from '@angular/router';
import { Location } from '@angular/common';

import { AuthDummyData } from '@core/services/auth.dummydata';
import { BeginningButtonComponent } from '@shared/components/beginning-button/beginning-button.component';
import { CourseDummyData } from '@course/course.dummydata';
import { CourseService } from '@course/course.service';
import { EditFieldComponent } from '@course/edit-field/edit-field.component';
import { HeadlineComponent } from '@shared/components/headline/headline.component';
import { SettingsComponent } from './settings.component';
import { StoreService } from '@core/services/store.service';
import { TicketDummyData } from '@ticket/ticket.dummydata';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { HarnessLoader } from '@angular/cdk/testing';

describe('SettingsComponent', () => {
  const authDummyData = new AuthDummyData;
  let component: SettingsComponent;
  const courseDummyData = new CourseDummyData;
  let fakeCourseService: jasmine.SpyObj<CourseService>;
  let fixture: ComponentFixture<SettingsComponent>;
  let loader: HarnessLoader;
  let location: Location;
  let store: StoreService;
  const ticketDummyData = new TicketDummyData;

  const routes: Routes = [
    { path: 'course/:courseid/settings/field', component: MockComponent(EditFieldComponent)},
    { path: 'course/:courseid/settings/field/:fieldid', component: MockComponent(EditFieldComponent)},
  ];

  beforeEach(async () => {
    // Exportit ei palauta tiedostoa, jotta sitä ei tallenneta.
    fakeCourseService = jasmine.createSpyObj('CourseService', {
      exportFAQs: Promise.resolve(undefined),
      exportSettings: Promise.resolve(undefined),
      getCourseName: undefined,
      getTicketFieldInfo: Promise.resolve(courseDummyData.ticketFieldInfo),
      getInvitedInfo: undefined,
      importFAQs: Promise.resolve({ success: true }),
      importSettings: Promise.resolve({ success: true }),
      sendInvitation: Promise.resolve({ success: true }),
      setHelpText: Promise.resolve({ success: true })
    });

    await TestBed.configureTestingModule({
      declarations: [
        MockComponent(BeginningButtonComponent),
        MockComponent(HeadlineComponent),
        SettingsComponent
      ],
      imports: [
        BrowserAnimationsModule,
        MatIconModule,
        MatInputModule,
        MatRadioModule,
        ReactiveFormsModule,
        RouterTestingModule.withRoutes(routes)
      ],
      providers: [
        { provide: CourseService, useValue: fakeCourseService },
        Location,
        StoreService
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SettingsComponent);
    location = TestBed.inject(Location);
    store = TestBed.inject(StoreService);
  loader = TestbedHarnessEnvironment.loader(fixture);
    component = fixture.componentInstance;
    component.courseid = '1';
    store.setLoggedIn();
    store.setUserInfo(authDummyData.userInfoTeacher);
    store.setParticipant(true);
    store.setCourseName('Matematiikan perusteet');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('routes to correct view when first Edit field -icon is clicked', fakeAsync(() => {
    fixture.detectChanges();
    tick(0);
    fixture.detectChanges();
    findEl(fixture, 'edit-field-button-0').nativeElement.click();
    tick();
    const expectedTicketID = courseDummyData.ticketFieldInfo.kentat[0].id;
    expect(location.path()).toBe('/course/1/settings/field/' + expectedTicketID);
    discardPeriodicTasks();
  }));

  it('routes to correct view when Add field -button is clicked', fakeAsync(() => {
    fixture.detectChanges();
    tick(0);
    fixture.detectChanges();
    findEl(fixture, 'add-field-button').nativeElement.click();
    tick();
    expect(location.path()).toBe('/course/1/settings/field');
    discardPeriodicTasks();
  }));

  it('calls correct method when "Export FAQ" -button is clicked', fakeAsync(() => {
    fixture.detectChanges();
    tick(0);
    fixture.detectChanges();
    findEl(fixture, 'export-faq-button').nativeElement.click();
    tick();
    expect(fakeCourseService.exportFAQs).toHaveBeenCalledWith(component.courseid);
    discardPeriodicTasks();
  }));

  it('calls correct method when "Export settings" -button is clicked', fakeAsync(() => {
    fixture.detectChanges();
    tick(0);
    fixture.detectChanges();
    findEl(fixture, 'export-settings-button').nativeElement.click();
    tick();
    expect(fakeCourseService.exportSettings).toHaveBeenCalledWith(component.courseid);
    discardPeriodicTasks();
  }));

  it('calls correct method when help text is changed', fakeAsync(() => {
    const expectedHelpText = courseDummyData.ticketFieldInfo.kuvaus;
    fixture.detectChanges();
    tick(0);
    fixture.detectChanges();
    setFieldValue(fixture, 'help-text', expectedHelpText);
    findEl(fixture, 'save-button').nativeElement.click();
    tick();
    expect(fakeCourseService.setHelpText).toHaveBeenCalledWith(
      component.courseid, expectedHelpText
    );
    discardPeriodicTasks();
  }));

  it('calls correct method after typing email and clicking "Send invitation" -button',
      fakeAsync(() => {
    const expectedEmail = "test@example.com";
    const expectedRole = "opiskelija";
    fixture.detectChanges();
    tick(0);
    fixture.detectChanges();
    setFieldValue(fixture, 'email', expectedEmail);
    tick();
    findEl(fixture, 'invite-button').nativeElement.click();
    expect(fakeCourseService.sendInvitation).toHaveBeenCalledWith(
      component.courseid, expectedEmail, expectedRole);
    discardPeriodicTasks();
  }));

  it('calls correct method after typing email, selecting Teacher -role and clicking "Send invitation" -button',
        fakeAsync(async() => {
    const expectedEmail = "anotherTest@example.com";
    const expectedRole = "opettaja";
    fixture.detectChanges();
    tick(0);
    fixture.detectChanges();
    setFieldValue(fixture, 'email', expectedEmail);
    const teacherRadio = await loader.getHarness(MatRadioButtonHarness.with(
      { selector: '[data-testid="teacher-radio"]' }));
    await teacherRadio.check();
    tick();
    findEl(fixture, 'invite-button').nativeElement.click();
    expect(fakeCourseService.sendInvitation).toHaveBeenCalledWith(
      component.courseid, expectedEmail, expectedRole);
    discardPeriodicTasks();
  }));

  /*
  it('calls correct method when add FAQ from file-button is clicked', fakeAsync(() => {
    fixture.detectChanges();
    tick(0);
    fixture.detectChanges();
    findEl(fixture, 'import-faq-button').nativeElement.click();
    tick();
    expect(fakeCourseService.importFAQs).toHaveBeenCalledWith(component.courseid);
    discardPeriodicTasks();
  }));
  */

  it('shows correct additional field titles', fakeAsync(() => {
    const expectedFields = courseDummyData.ticketFieldInfo.kentat;
    fixture.detectChanges();
    tick(0);
    fixture.detectChanges();
    const fieldTitles = fixture.nativeElement.querySelectorAll('[data-testid^="field-title"]');
    for (let i = 0; i < fieldTitles.length; i++) {
      expect(fieldTitles[i].textContent).toContain(expectedFields[i].otsikko);
    }
    discardPeriodicTasks();
  }));

  it('shows correct help text / description', fakeAsync(() => {
    const expectedHelpText = courseDummyData.ticketFieldInfo.kuvaus;
    fixture.detectChanges();
    tick(0);
    fixture.detectChanges();
    const helpText = findEl(fixture, 'help-text').nativeElement;
    expect(helpText).toBeTruthy();
    expect(helpText.value).toContain(expectedHelpText);
    discardPeriodicTasks();
  }));

});
