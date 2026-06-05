import { Navigate, createBrowserRouter, useLocation } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import { useAuthStore } from '../store/authStore';
import DashboardPage from '../pages/DashboardPage';
import LoginPage from '../pages/LoginPage';
import POSPage from '../pages/POSPage';
import ProductsPage from '../pages/ProductsPage';
import SalesPage from '../pages/SalesPage';
import ReportsPage from '../pages/ReportsPage';
import SettingsPage from '../pages/SettingsPage';
import ServicesPage from '../pages/ServicesPage';
import CategoriesPage from '../pages/CategoriesPage';
import StockLoadsPage from '../pages/StockLoadsPage';

function RequireAuth() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const location = useLocation();

  if (!accessToken) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <AppLayout />;
}

function LoginRoute() {
  const accessToken = useAuthStore((state) => state.accessToken);

  if (accessToken) {
    return <Navigate to="/" replace />;
  }

  return <LoginPage />;
}

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginRoute />,
  },
  {
    path: '/',
    element: <RequireAuth />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'pos', element: <POSPage /> },
      { path: 'products', element: <ProductsPage /> },
      { path: 'sales', element: <SalesPage /> },
      { path: 'reports', element: <ReportsPage /> },
      { path: 'services', element: <ServicesPage /> },
      { path: 'categories', element: <CategoriesPage /> },
      { path: 'stock-loads', element: <StockLoadsPage /> },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
