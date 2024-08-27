import { Route, Routes } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { ROUTE } from '@/consts';

const routes = [{ path: ROUTE.HOME, Page: lazy(() => import('./home')) }];

export function Routing() {
  return (
    <Routes>
      {routes.map(({ path, Page }) => (
        <Route
          key={path}
          path={path}
          element={
            <Suspense fallback={<p>Init</p>}>
              <Page />
            </Suspense>
          }
        />
      ))}
    </Routes>
  );
}
