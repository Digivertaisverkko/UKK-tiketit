import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { Observable } from 'rxjs';
import { SubmitTicketComponent } from './submit-ticket.component';

@Injectable()
export class SubmitTicketGuard implements CanDeactivate<SubmitTicketComponent> {
  canDeactivate(
    component: SubmitTicketComponent
  ): Observable<boolean> | Promise<boolean> | boolean {
    if (component.form.dirty) {
      return confirm('Are you sure you want to leave? Any unsaved changes will be lost.');
    }
    return true;
  }
}
