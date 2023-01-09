/**
 * @ignore
 */
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { CommerceModule, TranslatorLoaderService } from '@congacommerce/ecommerce';

import { environment } from '../environments/environment';
import { ComponentModule } from './components/component.module';
import { RouteGuard } from './services/route.guard';
import { AuthGuard } from './services/auth.guard';
import { ConfigureGuard } from './services/configure.guard';
import { ConstraintRuleGuard } from './services/constraint-rule.guard';

// Register locale data
import localeMx from '@angular/common/locales/es-MX';
import localeMxExtra from '@angular/common/locales/extra/es-MX';
import localeFr from '@angular/common/locales/fr';
import localeFrExtra from '@angular/common/locales/extra/fr';
import { registerLocaleData } from '@angular/common';
import { ModalModule } from 'ngx-bootstrap/modal';
import { HttpClientModule } from '@angular/common/http';

import { ProductDrawerModule, ApttusModalModule } from '@congacommerce/elements';
// If using additional locales, register the locale data here
registerLocaleData(localeMx, 'es-MX', localeMxExtra);
registerLocaleData(localeFr, 'fr-FR', localeFrExtra);

// Translations
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { AboGuard } from './services/abo.guard';
import { SessionGuard, DetailsGuard } from '@congacommerce/ecommerce';


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    CommerceModule.forRoot(environment),
    ProductDrawerModule,
    ModalModule.forRoot(),
    ApttusModalModule,
    TranslateModule.forRoot({
      loader: { provide: TranslateLoader, useClass: TranslatorLoaderService }
    }),
    HttpClientModule,
    ComponentModule
  ],
  providers: [RouteGuard, AuthGuard, AboGuard, ConfigureGuard, ConstraintRuleGuard, SessionGuard, DetailsGuard],
  bootstrap: [AppComponent]
})
export class AppModule { }
