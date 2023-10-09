import { APP_INITIALIZER, NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { BrowserModule } from '@angular/platform-browser';
import { LOCALE_ID } from '@angular/core';

import { AppComponent } from './app.component';
import { CoreModule } from './core/core.module';
import { CourseModule } from './course/course.module';
import { initializeLanguage  } from "./app.initializers";
import { SharedModule } from './shared/shared.module';
import { TicketModule } from './ticket/ticket.module';
import { UserModule } from './user/user.module';

/**
 * Importoidaan kaikki päämoduulit. Tämän moduulin ei tulisi sisältää
 * muita komponentteja tai servicejä, vaan niiden tulisi olla muissa moduuleissa.
 * Core.Modulen import pitäisi olla vain tässä tiedostossa.
 *
 * ! AppRoutingModule pitää olla imports-taulukossa viimeisimpänä.
 *
 * @export
 * @class AppModule
 */
@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    CoreModule,
    CourseModule,
    SharedModule,
    TicketModule,
    UserModule,
    AppRoutingModule,
  ],
  providers: [
    { provide: APP_INITIALIZER, useFactory: () => initializeLanguage, multi: true },
    { provide: LOCALE_ID, useValue: 'fi-FI' }
  ],
  bootstrap: [AppComponent],
  exports: []
})

export class AppModule { }
