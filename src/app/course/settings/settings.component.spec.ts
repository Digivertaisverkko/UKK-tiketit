import { ComponentFixture, TestBed, discardPeriodicTasks, fakeAsync, flush, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { MockComponent } from 'ng-mocks';
import { findEl, setFieldValue } from '@shared/spec-helpers/element.spec-helper';

import { SettingsComponent } from './settings.component';
import { CourseService } from '@course/course.service';
import { BeginningButtonComponent } from '@shared/components/beginning-button/beginning-button.component';
import { HeadlineComponent } from '@shared/components/headline/headline.component';
import { StoreService } from '@core/services/store.service';
import { AuthDummyData } from '@core/services/auth.dummydata';
import { CourseDummyData } from '@course/course.dummydata';
import { MatIconModule } from '@angular/material/icon';

fdescribe('SettingsComponent', () => {
  const authDummyData = new AuthDummyData;
  let component: SettingsComponent;
  const courseDummyData = new CourseDummyData;
  let fakeCourseService: jasmine.SpyObj<CourseService>;
  let fixture: ComponentFixture<SettingsComponent>;
  let store: StoreService;

  beforeEach(async () => {
    fakeCourseService = jasmine.createSpyObj('CourseService', {
      getCourseName: undefined,
      getTicketFieldInfo: Promise.resolve(courseDummyData.ticketFieldInfo),
      getInvitedInfo: undefined,
      setHelpText: Promise.resolve({ success: true})
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
        RouterTestingModule
      ],
      providers: [
        { provide: CourseService, useValue: fakeCourseService },
        StoreService
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SettingsComponent);
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
