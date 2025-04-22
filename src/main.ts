/// <reference types="@angular/localize" />

import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { provideAnimations } from '@angular/platform-browser/animations';


bootstrapApplication(AppComponent, { providers: [(appConfig.providers || []), provideAnimations()] }).catch((err) => console.error(err));
