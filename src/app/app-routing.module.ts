import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ModelerComponent } from './diagram/modeler/modeler.component';
import { HomeComponent } from './core/home/home.component';
import { ViewerComponent } from './diagram/viewer/viewer.component';
import { UnsavedChangesGuard } from './shared/unsaved-changes.guard';

const routes: Routes = [
  {path: '', redirectTo: '/home', pathMatch: 'full'},
  {path: 'home', component: HomeComponent},
  {path: 'viewer', children: [
      {path: '', component: ViewerComponent},
      {path: ':id', component: ViewerComponent}
    ]},
  {path: 'modeler', children: [
      {path: '', component: ModelerComponent, canDeactivate: [UnsavedChangesGuard]},
      {path: ':id', component: ModelerComponent, canDeactivate: [UnsavedChangesGuard]},
      {path: 'new', component: ModelerComponent, runGuardsAndResolvers: 'always', canDeactivate: [UnsavedChangesGuard]}
      ]},
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    onSameUrlNavigation: 'reload',
    enableTracing: false,
  })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
