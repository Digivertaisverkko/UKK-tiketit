import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { ComponentFixture, ComponentFixtureAutoDetect, TestBed
    } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCheckboxHarness } from '@angular/material/checkbox/testing';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MockComponent } from 'ng-mocks';

import { BeginningButtonComponent } from '@shared/components/beginning-button/beginning-button.component';
import { HeadlineComponent } from '@shared/components/headline/headline.component';
import { ErrorService } from '@core/services/error.service';
import { click, findEl } from '@shared/spec-helpers/element.spec-helper';
import { SuccessComponent } from '@shared/success/success.component';
import { Minun, MinunAsetukset, UserService } from '@user/user.service';
import { ProfileComponent } from '@user/profile/profile.component';

fdescribe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fakeUserService: Partial<UserService>;
  let fixture: ComponentFixture<ProfileComponent>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    fakeUserService = jasmine.createSpyObj('UserService', {
      getGdprData: Promise.resolve<any>(true),
      getPersonalInfo: Promise.resolve<Minun>({nimi: 'Test User', sposti: 'test@test.user'}),
      getSettings: Promise.resolve<MinunAsetukset>({'sposti-ilmoitus': true, 'sposti-kooste': true, 'sposti-palaute': true}),
      removeUser: Promise.resolve<boolean>(true),
      postSettings: Promise.resolve<boolean>(true)
    });

    await TestBed.configureTestingModule({
      declarations: [
        MockComponent(BeginningButtonComponent),
        MockComponent(HeadlineComponent),
        MockComponent(SuccessComponent),
        ProfileComponent
      ],
      imports: [
        BrowserAnimationsModule,
        MatCheckboxModule,
        MatInputModule,
        MatTooltipModule,
        ReactiveFormsModule,
      ],
      providers: [
        { provide: ComponentFixtureAutoDetect, useValue: true },
        {
          provide: ErrorService,
          useValue: {
            handleNotLoggedIn: undefined
          }
        },
        { provide: UserService, useValue: fakeUserService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('name and e-mail address is shown', () => {
    const name = findEl(fixture, 'name-input').nativeElement;
    const email = findEl(fixture, 'email-input').nativeElement;
    expect(name.value).toBe('Test User');
    expect(email.value).toBe('test@test.user');
    expect(fakeUserService.getPersonalInfo).toHaveBeenCalled();
  });

  it('current e-mail settings are shown', async () => {
    const notify = await loader.getHarness(MatCheckboxHarness.with(
      {selector: '#email-notify'}));
    const summary = await loader.getHarness(MatCheckboxHarness.with(
      {selector: '#email-summary'}));
    const feedback = await loader.getHarness(MatCheckboxHarness.with(
      {selector: '#email-feedback'}));
    expect(await notify.isChecked()).toBeTruthy();
    expect(await summary.isChecked()).toBeTruthy();
    expect(await feedback.isChecked()).toBeTruthy();
    expect(fakeUserService.getSettings).toHaveBeenCalled();
  });

  it('changing e-mail settings changes current values', async () => {
    const notify = await loader.getHarness(MatCheckboxHarness.with(
      {selector: '#email-notify'}));
    const summary = await loader.getHarness(MatCheckboxHarness.with(
      {selector: '#email-summary'}));
    const feedback = await loader.getHarness(MatCheckboxHarness.with(
      {selector: '#email-feedback'}));

    await notify.toggle();
    expect(await notify.isChecked()).toBeFalsy();
    expect(fakeUserService.postSettings).toHaveBeenCalledWith(
      { "sposti-ilmoitus": false, "sposti-kooste": true, "sposti-palaute":true }
    );

    await summary.toggle();
    expect(await summary.isChecked()).toBeFalsy();
    expect(fakeUserService.postSettings).toHaveBeenCalledWith(
      { "sposti-ilmoitus": false, "sposti-kooste": false, "sposti-palaute":true }
    );

    await feedback.toggle();
    expect(await feedback.isChecked()).toBeFalsy();
    expect(fakeUserService.postSettings).toHaveBeenCalledWith(
      { "sposti-ilmoitus": false, "sposti-kooste": false, "sposti-palaute":false }
    );
  });

  it('downloads gdpr data', () => {
    click(fixture, 'personal-data-download');
    expect(fakeUserService.getGdprData).toHaveBeenCalled();
  });

  it('delete account and personal data', () => {
    click(fixture, 'personal-data-delete');
    expect(fakeUserService.removeUser).not.toHaveBeenCalled();
    component.isRemovePressed = true;
    fixture.detectChanges();
    click(fixture, 'personal-data-delete-confirm');
    expect(fakeUserService.removeUser).toHaveBeenCalled();
  });
});
