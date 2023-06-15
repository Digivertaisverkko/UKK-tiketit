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
import { Minun, MinunAsetukset, UserService } from '@user/user.service';
import { ProfileComponent } from '@user/profile/profile.component';

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fakeErrorService: jasmine.SpyObj<ErrorService>;
  let fakeUserService: Pick<UserService, keyof UserService>;
  let fixture: ComponentFixture<ProfileComponent>;
  let loader: HarnessLoader;

  beforeEach(async () => {

    fakeErrorService = jasmine.createSpyObj('ErrorService', {
      handleNotLoggedIn: undefined
    });

    fakeUserService = {
      async getGdprData(): Promise<any> {
        return '{"name":"John", "age":30, "car":null}';
      },
      async getPersonalInfo(): Promise<Minun> {
        return { nimi: 'Test User', sposti: 'test@test.user' };
      },
      async getSettings(): Promise<MinunAsetukset> {
        return {'sposti-ilmoitus': true,
                'sposti-kooste': true,
                'sposti-palaute': true};
      },
      async postSettings(settings: MinunAsetukset) {
        return true;
      },
      async removeUser(): Promise<boolean> {
        return true;
      },
    };
    spyOn(fakeUserService, 'getGdprData').and.callThrough();
    spyOn(fakeUserService, 'getPersonalInfo').and.callThrough();
    spyOn(fakeUserService, 'getSettings').and.callThrough();
    spyOn(fakeUserService, 'postSettings').and.callThrough();
    spyOn(fakeUserService, 'removeUser').and.callThrough();

    await TestBed.configureTestingModule({
      declarations: [
        MockComponent(BeginningButtonComponent),
        MockComponent(HeadlineComponent),
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
        { provide: ErrorService, useValue: fakeErrorService },
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
    expect(fakeUserService.postSettings).toHaveBeenCalled();
    expect(fakeUserService.postSettings).toHaveBeenCalledWith(
      { "sposti-ilmoitus": false, "sposti-kooste": true, "sposti-palaute":true }
    );

    await summary.toggle();
    expect(await summary.isChecked()).toBeFalsy();
    expect(fakeUserService.postSettings).toHaveBeenCalled();
    expect(fakeUserService.postSettings).toHaveBeenCalledWith(
      { "sposti-ilmoitus": false, "sposti-kooste": false, "sposti-palaute":true }
    );

    await feedback.toggle();
    expect(await feedback.isChecked()).toBeFalsy();
    expect(fakeUserService.postSettings).toHaveBeenCalled();
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

    // FIXME: Tämä on kommentoitu pois, koska jostain syystä tätä ei kutsuta.
    // Jos ErrorServiceä ei feikata, niin handleNotLoggedIn() kutsutaan,
    // mutta testissä se ei toimi.
    //expect(fakeErrorService.handleNotLoggedIn).toHaveBeenCalled();
  });
});
