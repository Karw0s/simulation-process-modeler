import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ModelerComponent } from './diagram/modeler/modeler.component';
import { HomeComponent } from './home/home.component';
import { ViewerComponent } from './diagram/viewer/viewer.component';

const routes: Routes = [
  {path: '', redirectTo: '/home', pathMatch: 'full'},
  {path: 'home', component: HomeComponent},
  {path: 'viewer', children: [
      {path: '', component: ViewerComponent},
      {path: ':id', component: ViewerComponent}
    ]},
  {path: 'modeler', children: [
      {path: '', component: ModelerComponent},
      {path: ':id', component: ModelerComponent},
      {path: 'new', component: ModelerComponent, runGuardsAndResolvers: 'always'}
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
