import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ModelerComponent } from './modeler/modeler.component';

const routes: Routes = [
  {path: '', redirectTo: '/home', pathMatch: 'full'},
  {path: 'modeler', component: ModelerComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
