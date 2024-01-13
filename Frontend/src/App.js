import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./components/PrivateRoute";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Inventory from "./pages/Inventory";
import NoPageFound from "./pages/NoPageFound";
import Store from "./pages/Store";
import Sales from "./pages/Sales";
import PurchaseDetails from "./pages/PurchaseDetails";
import Layout from "./Layout/Layout";

import "./index.css";

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Layout />}>
            <Route element={<PrivateRoute />}>
              <Route index element={<Inventory />} />
              <Route path="/purchase-details" element={<PurchaseDetails />} />
              <Route path="/sales" element={<Sales />} />
              <Route path="/manage-store" element={<Store />} />
            </Route>
          </Route>
          <Route path="*" element={<NoPageFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
