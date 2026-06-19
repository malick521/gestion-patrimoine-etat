import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import Layout from './components/common/Layout';

import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';

import BiensPage from './pages/biens/BiensPage';
import BienFormPage from './pages/biens/BienFormPage';
import BienDetailPage from './pages/biens/BienDetailPage';

import AffectationsPage from './pages/affectations/AffectationsPage';
import MaintenancesPage from './pages/maintenances/MaintenancesPage';
import MouvementsPage from './pages/mouvements/MouvementsPage';

import MinisteresPage from './pages/ministeres/MinisteresPage';
import CategoriesPage from './pages/categories/CategoriesPage';

import UsersPage from './pages/users/UsersPage';
import AuditLogPage from './pages/audit/AuditLogPage';


export const App: React.FC = () => {

  return (
    <BrowserRouter>

      <AuthProvider>

        <Routes>

          {/* PUBLIC */}
          <Route
            path="/login"
            element={<LoginPage />}
          />


          {/* PROTECTED */}
          <Route element={<ProtectedRoute />}>

            <Route
              path="/"
              element={
                <Layout>
                  <DashboardPage />
                </Layout>
              }
            />


            <Route
              path="/biens"
              element={
                <Layout>
                  <BiensPage />
                </Layout>
              }
            />


            <Route
              path="/biens/nouveau"
              element={
                <Layout>
                  <BienFormPage />
                </Layout>
              }
            />


            <Route
              path="/biens/:id"
              element={
                <Layout>
                  <BienDetailPage />
                </Layout>
              }
            />


            <Route
              path="/affectations"
              element={
                <Layout>
                  <AffectationsPage />
                </Layout>
              }
            />


            <Route
              path="/maintenances"
              element={
                <Layout>
                  <MaintenancesPage />
                </Layout>
              }
            />


            <Route
              path="/mouvements"
              element={
                <Layout>
                  <MouvementsPage />
                </Layout>
              }
            />


            <Route
              path="/ministeres"
              element={
                <Layout>
                  <MinisteresPage />
                </Layout>
              }
            />


            <Route
              path="/categories"
              element={
                <Layout>
                  <CategoriesPage />
                </Layout>
              }
            />


            <Route
              path="/users"
              element={
                <Layout>
                  <UsersPage />
                </Layout>
              }
            />


            <Route
              path="/audit"
              element={
                <Layout>
                  <AuditLogPage />
                </Layout>
              }
            />

          </Route>



          {/* UNKNOWN */}
          <Route
            path="*"
            element={
              <Navigate
                to="/"
                replace
              />
            }
          />


        </Routes>

      </AuthProvider>

    </BrowserRouter>
  );
};


export default App;