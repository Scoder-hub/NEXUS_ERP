import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import LoginPage from '../pages/LoginPage';
import DashboardPage from '../pages/DashboardPage';
import PurchasePage from '../pages/PurchasePage';
import SalesPage from '../pages/SalesPage';
import InventoryPage from '../pages/InventoryPage';
import FinancePage from '../pages/FinancePage';
import HrPage from '../pages/HrPage';
import ReportsPage from '../pages/ReportsPage';
import SettingsPage from '../pages/SettingsPage';
import GenerationPage from '../pages/GenerationPage';
import ProductionPlanPage from '../pages/ProductionPlanPage';
import WorkshopExecPage from '../pages/WorkshopExecPage';
import ProductionDashboardPage from '../pages/ProductionDashboardPage';
import ProfilePage from '../pages/ProfilePage';
import NotificationsPage from '../pages/NotificationsPage';
import MessagesPage from '../pages/MessagesPage';
import OperationLogPage from '../pages/OperationLogPage';
import BackupRestorePage from '../pages/BackupRestorePage';
import NotFound from '../pages/NotFound';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'purchase', element: <PurchasePage /> },
      { path: 'sales', element: <SalesPage /> },
      { path: 'inventory', element: <InventoryPage /> },
      { path: 'finance', element: <FinancePage /> },
      { path: 'hr', element: <HrPage /> },
      { path: 'reports', element: <ReportsPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: 'generation', element: <GenerationPage /> },
      { path: 'production-plan', element: <ProductionPlanPage /> },
      { path: 'workshop-exec', element: <WorkshopExecPage /> },
      { path: 'production-dashboard', element: <ProductionDashboardPage /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'notifications', element: <NotificationsPage /> },
      { path: 'messages', element: <MessagesPage /> },
      { path: 'operation-logs', element: <OperationLogPage /> },
      { path: 'data-backup', element: <BackupRestorePage /> },
    ],
  },
  { path: '*', element: <NotFound /> },
]);
