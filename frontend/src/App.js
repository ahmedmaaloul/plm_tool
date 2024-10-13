// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import GlobalStyles from './styles/GlobalStyles';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ProjectsList from './pages/project/ProjectsList';
import ProjectDetails from './pages/project/ProjectDetails';
import CreateProject from './pages/project/CreateProject';
import EditProject from './pages/project/EditProject';
//import ProductsPage from './pages/ProductsPage';
//import CustomersPage from './pages/CustomersPage';
//import BOMsPage from './pages/BOMsPage';
import UserTasks from './pages/UserTasks';
import UnauthorizedPage from './pages/UnauthorizedPage';
import ProtectedRoute from './components/ProtectedRoute';
import BOMDetails from './pages/bom/BOMDetails';
import BOMList from './pages/bom/BOMList';
import SupplierDashboard from './pages/supplier/SupplierDashboard';
import ResourceDashboard from './pages/resource/ResourceDashboard';
import CustomerDashboard from './pages/customer/CustomerDashboard';
import CustomerDetails from './pages/customer/CustomerDetails';


function App() {
  return (
    <Router>
      <GlobalStyles />
      <NavbarWrapper />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        {/* Unauthorized Access Page */}
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
         {/* Protected Routes */}
         <Route
          path="/my_tasks"
          element={
            <ProtectedRoute>
              <UserTasks />
            </ProtectedRoute>
          }
        />

        <Route
          path="/projects"
          element={
            <ProtectedRoute>
              <ProjectsList />
            </ProtectedRoute>
          }
        />

        <Route
          path="/projects/create"
          element={
            <ProtectedRoute accessRight="fullAccess">
              <CreateProject />
            </ProtectedRoute>
          }
        />

        <Route
          path="/projects/:projectId"
          element={
            <ProtectedRoute>
              <ProjectDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/projects/edit/:projectId"
          element={
            <ProtectedRoute>
              <EditProject />
            </ProtectedRoute>
          }
        />
        

        {/* Products Route - Requires 'Product' access right */}
        {/* <Route
          path="/products"
          element={
            <ProtectedRoute accessRight="Product">
              <ProductsPage />
            </ProtectedRoute>
          }
        /> */}

        {/* Customers Route - Requires 'CustomersAndRequirements' access right */}
        {/* <Route
          path="/customers"
          element={
            <ProtectedRoute accessRight="CustomersAndRequirements">
              <CustomersPage />
            </ProtectedRoute>
          }
        /> */}
        <Route
          path="/boms"
          element={
            <ProtectedRoute accessRight="BOMAndSuppliers">
              <BOMList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/boms/:bomId"
          element={
            <ProtectedRoute accessRight="BOMAndSuppliers">
              <BOMDetails />
            </ProtectedRoute>
          }
        />
         <Route
          path="/suppliers"
          element={
            <ProtectedRoute accessRight="BOMAndSuppliers">
              <SupplierDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/resources"
          element={
            <ProtectedRoute accessRight="BOMAndSuppliers">
              <ResourceDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/customers"
          element={
            <ProtectedRoute accessRight="CustomersAndRequirements">
              <CustomerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customers/:id"
          element={
            <ProtectedRoute accessRight="CustomersAndRequirements">
              <CustomerDetails />
            </ProtectedRoute>
          }
        />

        {/* Workflows Route - Requires 'Workflow' access right */}
        {/* <Route
          path="/workflows"
          element={
            <ProtectedRoute accessRight="Workflow">
              <WorkflowsPage />
            </ProtectedRoute>
          }
        /> */}

        {/* Catch-all Route for 404 Not Found */}
        <Route path="*" element={<UnauthorizedPage />} />
      </Routes>
    </Router>
  );
}

// Component to conditionally render Navbar
const NavbarWrapper = () => {
  const location = useLocation();
  const hideNavbarPaths = ['/login', '/register'];

  return !hideNavbarPaths.includes(location.pathname) ? <Navbar /> : null;
};

export default App;
