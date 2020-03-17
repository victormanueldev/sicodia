import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then(m => m.HomePageModule)
  },
  { path: 'login', loadChildren: './login/login.module#LoginPageModule' },
  { path: 'clients', loadChildren: './clients/clients.module#ClientsPageModule' },
  { path: 'create-clients', loadChildren: './create-clients/create-clients.module#CreateClientsPageModule' },
  { path: 'collections', loadChildren: './collections/collections.module#CollectionsPageModule' },
  { path: 'clients-detail/:id', loadChildren: './clients-detail/clients-detail.module#ClientsDetailPageModule' },  { path: 'analytics', loadChildren: './analytics/analytics.module#AnalyticsPageModule' },
  { path: 'credits-master', loadChildren: './credits-master/credits-master.module#CreditsMasterPageModule' },




];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
