import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { HomeComponent } from './core/home/home.component';
import { NavBarComponent } from './core/navbar/nav-bar.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule } from '@angular/forms';
import { DiagramsListComponent } from './diagrams-list/diagrams-list.component';
import { DiagramsListItemComponent } from './diagrams-list/diagrams-list-item/diagrams-list-item.component';
import { ConfirmationDialogComponent } from './shared/confirmation-dialog/confirmation-dialog.component';
import { UnsavedChangesGuard } from './shared/unsaved-changes.guard';
import { DiagramModule } from './diagram/diagram.module';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    NavBarComponent,
    DiagramsListComponent,
    DiagramsListItemComponent,
    ConfirmationDialogComponent
  ],
  imports: [
    DiagramModule,
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FlexLayoutModule,
    HttpClientModule,
    FormsModule,
    MatToolbarModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatDialogModule,
    MatButtonModule,
    MatSnackBarModule
  ],
  providers: [UnsavedChangesGuard],
  bootstrap: [AppComponent]
})
export class AppModule {}
