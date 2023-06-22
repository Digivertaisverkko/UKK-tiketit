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
      this.emailSettingsForm.controls['notify']
      .setValue(response['sposti-ilmoitus']);

      this.emailSettingsForm.controls['summary']
      .setValue(response['sposti-kooste']);

      this.emailSettingsForm.controls['feedback']
      .setValue(response['sposti-palaute']);

      // lähtöarvot asetettu lomakkeelle, joten nyt lomakkeen voi ottaa käyttöön
      this.emailSettingsForm.enable();

      // kun arvot muuttuvat, niin lähetetään päivitetyt arvot backendille
      this.emailSettingsFormValueChanges();
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
      const blob = new Blob([response], { type: 'application/octet-stream' });
      const downloadUrl = URL.createObjectURL(blob);
      const link = this.renderer.createElement('a');
      link.href = downloadUrl;
      link.download = 'datadump.zip';
      link.click();
      link.remove();
    })
    .catch(error => {
      this.errorMessage = $localize `:@@Tiedoston lataaminen epäonnistui:
                                        Tiedoston lataaminen epäonnistui`
                                        + '.';
    });
  }

  private emailSettingsFormValueChanges(): void {
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

  public removeProfile(): void {
    this.userService.removeUser()
    .then(response => {
      if (response) {
        // Käyttäjä menettää kirjautumisen tilan, kun tili poistetaan.
        // Ohjataan käyttäjä oikeaan paikkaan tässä tilanteessa.
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

}
