import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DataConsentComponent } from './core/data-consent/data-consent.component';
import { HomeComponent } from '@core/home/home.component';
import { NoDataConsentComponent } from './core/no-data-consent/no-data-consent.component';
import { NoPrivilegesComponent } from './core/no-privileges/no-privileges.component';
import { PageNotFoundComponent } from './core/page-not-found/page-not-found.component';

// ? viimeisimmän kurssin muistaminen, jos on tallennettuna local storageen?
// courseid:n nappaaminen routesta ei onnistunut, jos käytti loppuosasta vain wildcardia.
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

// redirect esimerkkki:  { path: '', redirectTo: 'login', pathMatch: 'full' }
// lazy-loading esimerkki:
// { path: 'front', loadChildren: () => import('./front/front.module').then(m => m.FrontModule) }
// { path: 'users', loadChildren: () => import('./user/user.module').then(m => m.UserModule) },

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      bindToComponentInputs: true
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
