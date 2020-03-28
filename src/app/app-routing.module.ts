import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ModelerComponent } from './diagram/modeler/modeler.component';
import { HomeComponent } from './home/home.component';

const routes: Routes = [
  {path: '', redirectTo: '/home', pathMatch: 'full'},
  {path: 'home', component: HomeComponent},
  {path: 'modeler', component: ModelerComponent},
  {path: 'modeler/new', component: ModelerComponent, runGuardsAndResolvers: 'always'},
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    onSameUrlNavigation: 'reload',
    enableTracing: false,
  })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
