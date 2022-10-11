import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: 'front', loadChildren: () => import('./front/front.module').then(m => m.FrontModule) },
];

// redirect esimerkkki:  { path: '', redirectTo: 'login', pathMatch: 'full' }
// lazy-loading esimerkki:
// { path: 'users', loadChildren: () => import('./user-management/user-management.module').then(m => m.UserManagementModule) },

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
