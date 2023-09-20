import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DataConsentComponent } from './core/data-consent/data-consent.component';
import { HomeComponent } from '@core/home/home.component';
import { NoDataConsentComponent } from './core/no-data-consent/no-data-consent.component';
import { NoPrivilegesComponent } from './core/no-privileges/no-privileges.component';
import { PageNotFoundComponent } from './core/page-not-found/page-not-found.component';

/** Objektien järjestyksellä on väliä, sillä ensimmäinen match näytetään.
 * @type {*} */
const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'course/:courseid/home', component: HomeComponent },
  { path: 'home', component: HomeComponent},
  { path: 'data-consent', component: DataConsentComponent },
  { path: 'no-data-consent', component: NoDataConsentComponent },
  { path: 'course/:courseid/forbidden', component: NoPrivilegesComponent },
  { path: 'forbidden', component: NoPrivilegesComponent },
  { path: 'course/:courseid', pathMatch: 'full', redirectTo: '/course/:courseid/list-tickets' },
  { path: '404', pathMatch: 'full', component: PageNotFoundComponent },
  { path: 'course/:courseid/:any', component: PageNotFoundComponent },
  { path: 'course/:courseid/:any/:any', component: PageNotFoundComponent },
  { path: 'course/:courseid/:any/:any/:any', component: PageNotFoundComponent },
  { path: '**', component: PageNotFoundComponent },
];

/**
 * Pääreititysmoduuli. Feature-moduuleilla on omat reititysmoduulinsa.
 *
 * @export
 * @class AppRoutingModule
 */
@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      bindToComponentInputs: true
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
