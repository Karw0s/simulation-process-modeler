import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { ModelerComponent } from './diagram/modeler/modeler.component';
import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { HttpClientModule } from '@angular/common/http';
import { HomeComponent } from './home/home.component';
import { NavBarComponent } from './navbar/nav-bar.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatDialogModule } from '@angular/material/dialog';
import { CodeDialogComponent } from './diagram/modeler/code-dialog/code-dialog.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { ViewerComponent } from './diagram/viewer/viewer.component';
import { ToolBarComponent } from './diagram/tool-bar/tool-bar.component';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { DiagramsListComponent } from './diagrams-list/diagrams-list.component';
import { DiagramsListItemComponent } from './diagrams-list/diagrams-list-item/diagrams-list-item.component';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ConfirmationDialogComponent } from './shared/confirmation-dialog/confirmation-dialog.component';
import { UnsavedChangesGuard } from './shared/unsaved-changes.guard';
import { DiagramModule } from './diagram/diagram.module';


@NgModule({
  declarations: [
    AppComponent,
    ModelerComponent,
    HomeComponent,
    NavBarComponent,
    CodeDialogComponent,
    ViewerComponent,
    ToolBarComponent,
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
    MatToolbarModule,
    MatButtonModule,
    HttpClientModule,
    MatDialogModule,
    MatFormFieldModule,
    FormsModule,
    MatInputModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule,
    MatCardModule,
    MatProgressSpinnerModule
  ],
  providers: [UnsavedChangesGuard],
  bootstrap: [AppComponent]
})
export class AppModule { }
