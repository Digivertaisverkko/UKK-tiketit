import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PageNotFoundComponent } from './core/page-not-found/page-not-found.component';
import { NoPrivilegesComponent } from './core/no-privileges/no-privileges.component';
import { DataConsentComponent } from './core/data-consent/data-consent.component';

// ? viimeisimmän kurssin muistaminen, jos on tallennettuna local storageen?
// courseid:n nappaaminen routesta ei onnistunut, jos käytti loppuosasta vain wildcardia.
const routes: Routes = [
  { path: '', redirectTo: '/course/1/list-tickets', pathMatch: 'full' },
  { path: 'data-consent', component: DataConsentComponent},
  { path: 'forbidden', component: NoPrivilegesComponent },
  { path: 'course/:courseid/forbidden', component: NoPrivilegesComponent },
  { path: 'course/:courseid', pathMatch: 'full', redirectTo: '/course/:courseid/list-tickets' },
  { path: 'course/:courseid/:any',  component: PageNotFoundComponent },
  { path: 'course/:courseid/:any/:any',  component: PageNotFoundComponent },
  { path: 'course/:courseid/:any/:any/:any',  component: PageNotFoundComponent },
  { path: '**', component: PageNotFoundComponent },
];

// redirect esimerkkki:  { path: '', redirectTo: 'login', pathMatch: 'full' }
// lazy-loading esimerkki:
// { path: 'front', loadChildren: () => import('./front/front.module').then(m => m.FrontModule) }
// { path: 'users', loadChildren: () => import('./user-management/user-management.module').then(m => m.UserManagementModule) },

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
