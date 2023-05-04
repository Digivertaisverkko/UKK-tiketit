import { Component, OnInit, Renderer2 } from '@angular/core';
import { Title } from '@angular/platform-browser';

import { UserManagementService } from '../user-management.service';
import { AuthService } from '../../core/auth.service';
import { Constants } from '../../shared/utils';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})

export class ProfileComponent implements OnInit {
  public errorMessage: string = '';
  public isPersonalInfoLoaded: boolean = false;
  public isRemovePressed: boolean = false;
  public userEmail: string = '';
  public userName: string = '';

  constructor(private authService: AuthService,
              private renderer: Renderer2,
              private titleServ: Title,
              private userManagementService: UserManagementService)
  {}

  ngOnInit(): void {
    this.titleServ.setTitle(
      Constants.baseTitle + $localize `:@@Profiili:Profiili`
    );
    this.userManagementService.getPersonalInfo().then(response => {
      this.userName = response.nimi;
      this.userEmail = response.sposti;
      this.isPersonalInfoLoaded = true;
    });
  }

  public changeRemoveButton(): void {
    setTimeout(() => this.isRemovePressed = true, 300);
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
