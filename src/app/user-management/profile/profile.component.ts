import { Component, OnInit, Renderer2 } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Title } from '@angular/platform-browser';

import { MinunAsetukset, UserManagementService } from '../user-management.service';
import { AuthService } from '../../core/auth.service';
import { Constants } from '../../shared/utils';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})

export class ProfileComponent implements OnInit {
  public emailSettingsForm!: FormGroup;
  public emailSettingsErrorMessage: string = '';
  public emailSettingsSuccessMessage: string = '';
  public errorMessage: string = '';
  public isPersonalInfoLoaded: boolean = false;
  public isRemovePressed: boolean = false;
  public userEmail: string = '';
  public userName: string = '';

  constructor(private authService: AuthService,
              private formBuilder: FormBuilder,
              private renderer: Renderer2,
              private titleServ: Title,
              private userManagementService: UserManagementService)
  {}

  ngOnInit(): void {
    this.titleServ.setTitle(
      Constants.baseTitle + $localize `:@@Profiili:Profiili`
    );
    this.userManagementService.getPersonalInfo()
    .then(response => {
      this.userName = response.nimi;
      this.userEmail = response.sposti;
      this.isPersonalInfoLoaded = true;
    });
    this.userManagementService.getSettings()
    .then(response => {
      this.emailSettingsForm = this.createEmailSettingsForm(response);
    });
  }

  public changeRemoveButton(): void {
    setTimeout(() => this.isRemovePressed = true, 300);
  }

  private createEmailSettingsForm(defaultSettings: MinunAsetukset): FormGroup {
    let form: FormGroup = this.formBuilder.group({
      notify: [defaultSettings['sposti-ilmoitus']],
      summary: [defaultSettings['sposti-kooste']],
      feedback: [defaultSettings['sposti-palaute']],
    });

    form.valueChanges.subscribe(() => {
      let settings: MinunAsetukset = {
        "sposti-ilmoitus": this.emailSettingsForm.controls['notify'].value,
        "sposti-kooste": this.emailSettingsForm.controls['summary'].value,
        "sposti-palaute": this.emailSettingsForm.controls['feedback'].value
      }

      this.userManagementService.postSettings(settings)
      .then(() => {
        this.emailSettingsErrorMessage = '';
        this.emailSettingsSuccessMessage = $localize `:@@Asetusten tallentaminen onnistui.:Asetusten tallentaminen onnistui.`;
      })
      .catch(() => {
        this.emailSettingsSuccessMessage = '';
        this.emailSettingsErrorMessage = $localize `:@@Asetusten tallentaminen epäonnistui.:Asetusten tallentaminen epäonnistui.`;
      });
    });

    return form;
  }

  public downloadPersonalData(): void {
    this.userManagementService.getGdprData()
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
    this.userManagementService.removeUser()
    .then(response => {
      if (response) {
        this.authService.handleNotLoggedIn();
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
