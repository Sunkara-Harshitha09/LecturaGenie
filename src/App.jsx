import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import CreateAccount from "./pages/CreateAccount";
import UploadURL from "./pages/UploadURL";
import Summary from "./pages/Summary";

export default function App() {
  // protect routes by checking for token
  const loggedIn = !!localStorage.getItem("lg_token");

  return (
    <div className="app-root">
      <main className="container">
        <Routes>
          {/* Always start with login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/create-account" element={<CreateAccount />} />

          {/* Protected */}
          <Route
            path="/upload-url"
            element={loggedIn ? <UploadURL /> : <Navigate to="/login" replace />}
          />

          <Route
            path="/summary"
            element={loggedIn ? <Summary /> : <Navigate to="/login" replace />}
          />

          {/* fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </main>
    </div>
  );
}
