import ProtectedRoute from "./components/common/ProtectedRoute";

<Routes>
  <Route path="/" element={<Login />} />

  <Route
    path="/dashboard"
    element={
      <ProtectedRoute role="INTERN">
        <InternDashboard />
      </ProtectedRoute>
    }
  />

  <Route
    path="/admin"
    element={
      <ProtectedRoute role="ADMIN">
        <AdminDashboard />
      </ProtectedRoute>
    }
  />
</Routes>