/// <reference types="@angular/localize" />

import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { provideAnimations } from '@angular/platform-browser/animations';
import { importProvidersFrom } from '@angular/core';
import { MatCarouselModule } from '@ngmodule/material-carousel';

bootstrapApplication(AppComponent, {
    providers: [
        (appConfig.providers || []),
        provideAnimations(),
        importProvidersFrom(MatCarouselModule.forRoot())
    ]
}).catch((err) => console.error(err));
