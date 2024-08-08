import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';

export const routes: Routes = [
    {
        path: 'home',
        component: HomeComponent
    },
    {
        path: 'dashboard',
        loadComponent: () => 
            import('./components/dashboard/dashboard.component').then(c => {
            return c.DashboardComponent
        })
    },
    {
        path: '',
        redirectTo: '/home',
        pathMatch: 'full'
    }
];
