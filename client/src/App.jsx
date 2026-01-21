// App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { TooltipProvider } from "./ui/tooltip.jsx";
import { Toaster } from "./ui/sonner.jsx";

// USER PAGES
import Home from "./pages/Home.jsx";
import CategoryPage from "./pages/CategoryPage.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import About from "./pages/About.jsx";
import Contact from "./pages/Contact.jsx";
import Product from "./pages/Product.jsx";
import Profile from "./pages/Profile.jsx";
import Orders from "./pages/Order.jsx";
import OrderHistory from "./pages/OrderHistory.jsx";
import ProductDetails from "./pages/ProductDetails.jsx";
import Cart from "./pages/Cart.jsx";
import BuyNow from "./pages/buyNow.jsx";
import SubCategoryProducts from "./pages/SubCategoryProducts.jsx";
import OrderDetails from "./pages/OrderDetails.jsx";
import NotFound from "./pages/NotFound.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

// ADMIN LAYOUT + PAGES
import AdminLayout from "../admin/AdminLayout.jsx";
import Dashboard from "../admin/pages/Dashboard.jsx";
import AdminCategories from "../admin/pages/Categories.jsx";
import AdminSubCategories from "../admin/pages/Subcategories.jsx";
import AdminProducts from "../admin/pages/Products.jsx";
import AdminOrders from "../admin/pages/Orders.jsx";
import Customers from "../admin/pages/Customer.jsx";
import AdminPayments from "../admin/pages/Payments.jsx";
import AdminFeedback from "../admin/pages/Feedbacks.jsx";
import AdminLogin from "./pages/AdminLogin.jsx";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router>
            <Routes>
              {/* ================= USER ROUTES ================= */}
              <Route path="/" element={<Home />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/categories" element={<CategoryPage />} />
              <Route
                path="/category/subcategory/:catId"
                element={<SubCategoryProducts />}
              />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/products" element={<Product />} />
              <Route path="/products/:id" element={<ProductDetails />} />
              <Route path="/profile" element={<Profile />} />
              <Route
                path="/orders"
                element={
                  <ProtectedRoute>
                    <Orders />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/order-history"
                element={
                  <ProtectedRoute>
                    <OrderHistory />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/orders/:orderId"
                element={
                  <ProtectedRoute>
                    <OrderDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/buy-now/:id"
                element={
                  <ProtectedRoute>
                    <BuyNow />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/cart"
                element={
                  <ProtectedRoute>
                    <Cart />
                  </ProtectedRoute>
                }
              />
              <Route path="/forgot-password" element={<ForgotPassword />} />

              {/* ================= ADMIN ROUTES ================= */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="subcategories" element={<AdminSubCategories />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="customers" element={<Customers />} />
                <Route path="payments" element={<AdminPayments />} />
                <Route path="feedback" element={<AdminFeedback />} />
              </Route>

              {/* ================= 404 ================= */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
        </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
