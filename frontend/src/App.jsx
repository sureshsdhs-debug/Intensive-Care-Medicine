import { useState, useEffect } from 'react';
import './App.css';

import { Dashboard } from './admin/pages/Dashboard';
import { UserDashboard } from './admin/pages/UserDashboard';
import Login from './admin/pages/Login';
import Register from './admin/pages/Register';
import Nav from './admin/includes/Nav';
import Header from './admin/includes/Header';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Students from './admin/pages/students/Manage';
import AddStudents from './admin/pages/students/Add';
import EditStudents from './admin/pages/students/Edit';
import ViewStudents from './admin/pages/students/View';
import Profile from './admin/pages/students/Profile';

import Subjects from './admin/pages/subjects/Manage';
import AddSubject from './admin/pages/subjects/Add';
import EditSubject from './admin/pages/subjects/Edit';
import ViewSubject from './admin/pages/subjects/View';

import Courses from './admin/pages/courses/Manage';
import AddCourse from './admin/pages/courses/Add';
import EditCourse from './admin/pages/courses/Edit';
import ViewCourse from './admin/pages/courses/View';

import Questions from './admin/pages/questions/Manage';
import AddQuestion from './admin/pages/questions/Add';
import EditQuestion from './admin/pages/questions/Edit';
import ViewQuestion from './admin/pages/questions/View';

import Exams from './admin/pages/exams/Manage';
import AddExam from './admin/pages/exams/Add';
import EditExam from './admin/pages/exams/Edit';
import ViewExam from './admin/pages/exams/View';

import TableOfContents from './admin/pages/table-of-contents/Manage';
import AddTableOfContents from './admin/pages/table-of-contents/Add';
import EditTableOfContents from './admin/pages/table-of-contents/Edit';
import ViewTableOfContents from './admin/pages/table-of-contents/View';

import ProtectedRoute from './auth/ProtectedRoute';
import { AuthProvider } from './auth/AuthProvider'; 

function App() {
  const [roleAuth, setRoleAuth] = useState(null);

  const getRole = () => {
    const userRole = localStorage.getItem('role');
    if (userRole) {
      setRoleAuth(userRole); // if you store JSON, parse it here
    } else {
      setRoleAuth(null);
    }
  };

  // Load role on first render
  useEffect(() => {
    getRole();
  }, []);

  return (
    <Router> 
      <AuthProvider> 
        <ProtectedRoute>
          <Header getRole={getRole} roleAuth={roleAuth} />
        </ProtectedRoute>
        <div className="main-container">
          {/* Show Nav only if authenticated */}
          <ProtectedRoute>
            <Nav getRole={getRole} roleAuth={roleAuth} />
          </ProtectedRoute>

          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  {roleAuth === "1" ? (
                    <Dashboard getRole={getRole} roleAuth={roleAuth} />
                  ) : (
                    <UserDashboard getRole={getRole} roleAuth={roleAuth} />
                  )}
                </ProtectedRoute>
              }
            />

            <Route
              path="/students"
              element={
                <ProtectedRoute role={roleAuth}>
                  <Students />
                </ProtectedRoute>
              }
            />
            <Route
              path="/students/add"
              element={
                <ProtectedRoute>
                  <AddStudents />
                </ProtectedRoute>
              }
            />
            <Route
              path="/students/edit/:id"
              element={
                <ProtectedRoute>
                  <EditStudents />
                </ProtectedRoute>
              }
            />
            <Route
              path="/students/view/:id"
              element={
                <ProtectedRoute>
                  <ViewStudents />
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            <Route
              path="/subjects"
              element={
                <ProtectedRoute>
                  <Subjects />
                </ProtectedRoute>
              }
            />
            <Route
              path="/subjects/add"
              element={
                <ProtectedRoute>
                  <AddSubject />
                </ProtectedRoute>
              }
            />
            <Route
              path="/subjects/edit/:id"
              element={
                <ProtectedRoute>
                  <EditSubject />
                </ProtectedRoute>
              }
            />
            <Route
              path="/subjects/view/:id"
              element={
                <ProtectedRoute>
                  <ViewSubject />
                </ProtectedRoute>
              }
            />

            <Route
              path="/courses"
              element={
                <ProtectedRoute>
                  <Courses />
                </ProtectedRoute>
              }
            />
            <Route
              path="/courses/add"
              element={
                <ProtectedRoute>
                  <AddCourse />
                </ProtectedRoute>
              }
            />
            <Route
              path="/courses/edit/:id"
              element={
                <ProtectedRoute>
                  <EditCourse />
                </ProtectedRoute>
              }
            />
            <Route
              path="/courses/view/:id"
              element={
                <ProtectedRoute>
                  <ViewCourse />
                </ProtectedRoute>
              }
            />

            <Route
              path="/questions"
              element={
                <ProtectedRoute>
                  <Questions />
                </ProtectedRoute>
              }
            />
            <Route
              path="/questions/add"
              element={
                <ProtectedRoute>
                  <AddQuestion />
                </ProtectedRoute>
              }
            />
            <Route
              path="/questions/edit/:id"
              element={
                <ProtectedRoute>
                  <EditQuestion />
                </ProtectedRoute>
              }
            />
            <Route
              path="/questions/view/:id"
              element={
                <ProtectedRoute>
                  <ViewQuestion />
                </ProtectedRoute>
              }
            />

            <Route
              path="/exams"
              element={
                <ProtectedRoute>
                  <Exams getRole={getRole} roleAuth={roleAuth} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/exams/add"
              element={
                <ProtectedRoute>
                  <AddExam />
                </ProtectedRoute>
              }
            />
            <Route
              path="/exams/edit/:id"
              element={
                <ProtectedRoute>
                  <EditExam />
                </ProtectedRoute>
              }
            />
            <Route
              path="/exams/view/:id"
              element={
                <ProtectedRoute>
                  <ViewExam />
                </ProtectedRoute>
              }
            />
            {/* Table Of Contents */}
             <Route
              path="/table-of-contents"
              element={
                <ProtectedRoute>
                  <TableOfContents getRole={getRole} roleAuth={roleAuth} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/table-of-contents/add"
              element={
                <ProtectedRoute>
                  <AddTableOfContents />
                </ProtectedRoute>
              }
            />
            <Route
              path="/table-of-contents/edit/:id"
              element={
                <ProtectedRoute>
                  <EditTableOfContents />
                </ProtectedRoute>
              }
            />
            <Route
              path="/table-of-contents/view/:id"
              element={
                <ProtectedRoute>
                  <ViewTableOfContents />
                </ProtectedRoute>
              }
            />

          </Routes>
        </div>
      </AuthProvider> 
    </Router>
  );
}

export default App;
