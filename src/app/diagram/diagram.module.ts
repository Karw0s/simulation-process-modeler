import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SimParameterDialogComponent } from './sim-parameter-dialog/sim-parameter-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ModelerComponent } from './modeler/modeler.component';
import { CodeDialogComponent } from './modeler/code-dialog/code-dialog.component';
import { ViewerComponent } from './viewer/viewer.component';
import { ToolBarComponent } from './tool-bar/tool-bar.component';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FlexLayoutModule, FlexModule } from '@angular/flex-layout';
import { SaveDialogComponent } from './modeler/save-dialog/save-dialog.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MonacoEditorModule } from '@materia-ui/ngx-monaco-editor';



@NgModule({
  declarations: [
    SimParameterDialogComponent,
    ModelerComponent,
    CodeDialogComponent,
    ViewerComponent,
    ToolBarComponent,
    SaveDialogComponent
  ],
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule,
    MatIconModule,
    MatToolbarModule,
    MatMenuModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    FormsModule,
    FlexModule,
    FlexLayoutModule,
    MatTooltipModule,
    MonacoEditorModule,

  ]
})
export class DiagramModule {}
