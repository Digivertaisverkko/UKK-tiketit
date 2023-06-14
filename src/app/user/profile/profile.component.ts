import { Component, OnInit, Renderer2 } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Title } from '@angular/platform-browser';

import { ErrorService } from '@core/services/error.service';
import { StoreService } from '@core/services/store.service';
import { MinunAsetukset, UserService } from '@user/user.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})

export class ProfileComponent implements OnInit {
  public emailSettingsErrorMessage: string = '';
  public emailSettingsForm: FormGroup = this.buildEmailSettingsForm();
  public emailSettingsSuccessMessage: string = '';
  public errorMessage: string = '';
  public isRemovePressed: boolean = false;
  public personalInfoForm: FormGroup = this.buildPersonalInfoForm();

  get personalInfoEmail(): FormControl {
    return this.personalInfoForm.get('email') as FormControl;
  }

  get personalInfoName(): FormControl {
    return this.personalInfoForm.get('name') as FormControl;
  }

  constructor(private errorService: ErrorService,
              private formBuilder: FormBuilder,
              private renderer: Renderer2,
              private store: StoreService,
              private titleServ: Title,
              private userService: UserService)
  {}

  ngOnInit(): void {
    this.personalInfoForm.disable();
    this.emailSettingsForm.disable();
    this.titleServ.setTitle(
      this.store.getBaseTitle() + $localize `:@@Profiili:Profiili`
    );
    this.userService.getPersonalInfo()
    .then(response => {
      this.personalInfoForm.controls['name'].setValue(response.nimi);
      this.personalInfoForm.controls['email'].setValue(response.sposti);
    });
    this.userService.getSettings()
    .then(response => {
      this.setEmailSettingsFormValues(response);
      this.emailSettingsForm.enable();
    });
  }

  private buildEmailSettingsForm(): FormGroup {
    return this.formBuilder.group({
      notify: [null],
      summary: [null],
      feedback: [null],
    });
  }

  private buildPersonalInfoForm(): FormGroup {
    return this.formBuilder.group({
      name: [ '' ],
      email: [ '' ],
    })
  }

  public changeRemoveButton(): void {
    setTimeout(() => this.isRemovePressed = true, 300);
  }

  public downloadPersonalData(): void {
    this.userService.getGdprData()
    .then(response => {
      let gdprData = JSON.stringify(response, null, 2);
      const link = this.renderer.createElement('a');
      link.setAttribute('target', '_blank');
      link.setAttribute(
          'href',
          "data:text/json;charset=UTF-8," + encodeURIComponent(gdprData));
      link.setAttribute('download', 'datadump.json');
      link.click();
      link.remove();
    })
    .catch(error => {
      this.errorMessage = $localize `:@@Tiedoston lataaminen epäonnistui:
                                        Tiedoston lataaminen epäonnistui`
                                        + '.';
    });
  }

  public removeProfile(): void {
    this.userService.removeUser()
    .then(response => {
      if (response) {
        this.errorService.handleNotLoggedIn();

      } else {
        throw new Error;
      }
    })
    .catch(error => {
      this.errorMessage = $localize `:@@Profiilin poistaminen epäonnistui:
                                        Profiilin poistaminen epäonnistui`
                                        + '.';
    });
  }

  private setEmailSettingsFormValues(defaultSettings: MinunAsetukset): void {
    this.emailSettingsForm.controls['notify']
    .setValue(defaultSettings['sposti-ilmoitus']);

    this.emailSettingsForm.controls['summary']
    .setValue(defaultSettings['sposti-kooste']);

    this.emailSettingsForm.controls['feedback']
    .setValue(defaultSettings['sposti-palaute']);

    this.emailSettingsForm.valueChanges.subscribe(() => {
      let settings: MinunAsetukset = {
        "sposti-ilmoitus": this.emailSettingsForm.controls['notify'].value,
        "sposti-kooste": this.emailSettingsForm.controls['summary'].value,
        "sposti-palaute": this.emailSettingsForm.controls['feedback'].value
      }

      this.userService.postSettings(settings)
      .then(() => {
        this.emailSettingsErrorMessage = '';
        this.emailSettingsSuccessMessage = $localize `:@@Asetusten tallentaminen onnistui.:Asetusten tallentaminen onnistui.`;
      })
      .catch(() => {
        this.emailSettingsSuccessMessage = '';
        this.emailSettingsErrorMessage = $localize `:@@Asetusten tallentaminen epäonnistui.:Asetusten tallentaminen epäonnistui.`;
      });
    });
  }

}
