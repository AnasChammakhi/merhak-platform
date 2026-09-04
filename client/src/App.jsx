import {
  Route,
  Routes,
} from "react-router-dom";


import Home from "./pages/Home";
import Store from "./pages/Store";
import ProductDetail from "./pages/ProductDetail";
import About from "./pages/About";
import Contact from "./pages/Contact";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import BankPayment from "./pages/BankPayment";


import AdminRoute from "./components/admin/AdminRoute";
import AdminLayout from "./components/admin/AdminLayout";


import AdminDashboard from "./pages/admin/AdminDashboard";
import Clients from "./pages/admin/Clients";
import ClientDetail from "./pages/admin/ClientDetail";
import Categories from "./pages/admin/Categories";
import Products from "./pages/admin/Products";
import Orders from "./pages/admin/Orders";
import OrderDetail from "./pages/admin/OrderDetail";
import CustomOrders from "./pages/admin/CustomOrders";
import CustomOrderDetail from "./pages/admin/CustomOrderDetail";
import CustomOrderCreate from "./pages/admin/CustomOrderCreate";
import Calendar from "./pages/admin/Calendar";


function App() {
  return (
    <Routes>

      {/* PUBLIC */}

      <Route
        path="/"
        element={<Home />}
      />

      <Route
        path="/store"
        element={<Store />}
      />

      <Route
        path="/boutique"
        element={<Store />}
      />

      <Route
        path="/product/:id"
        element={<ProductDetail />}
      />

      <Route
        path="/store/:id"
        element={<ProductDetail />}
      />

      <Route
        path="/about"
        element={<About />}
      />

      <Route
        path="/contact"
        element={<Contact />}
      />

      <Route path="/cart" element={<Cart />} />

      <Route path="/checkout" element={<Checkout />} />

      <Route path="/bank-payment" element={<BankPayment />} />


      {/* AUTH */}

      <Route
        path="/signin"
        element={<SignIn />}
      />

      <Route
        path="/signup"
        element={<SignUp />}
      />


      {/* ADMIN */}

      <Route
        element={
          <AdminRoute />
        }
      >
        <Route
          element={
            <AdminLayout />
          }
        >
          <Route
            path="/admin"
            element={
              <AdminDashboard />
            }
          />

          <Route
            path="/admin/clients"
            element={
              <Clients />
            }
          />

          <Route
            path="/admin/clients/:id"
            element={
              <ClientDetail />
            }
          />

          <Route
            path="/admin/categories"
            element={
              <Categories />
            }
            />
            <Route
            path="/admin/orders"
            element={
              <Orders />
            }
          />

          <Route
            path="/admin/products"
            element={
              <Products />
            }
            />
          <Route
            path="/admin/orders/:id"
            element={
              <OrderDetail />
            }
          />

          <Route
            path="/admin/custom-orders"
            element={
              <CustomOrders />
            }
          />

          <Route
            path="/admin/custom-orders/:id"
            element={
              <CustomOrderDetail />
            }
          />

          <Route
            path="/admin/custom-orders/new"
            element={
              <CustomOrderCreate />
            }
          />

          <Route
            path="/admin/custom-orders/:id/edit"
            element={
              <CustomOrderCreate />
            }
          />

          <Route
            path="/admin/calendar"
            element={
              <Calendar />
            }
          />
        </Route>
      </Route>


      {/* 404 */}

      <Route
        path="*"
        element={
          <div className="flex min-h-screen items-center justify-center bg-[#f7fbfe]">
            <div className="text-center">
              <p className="text-7xl font-bold text-[#29b6f6]">
                404
              </p>

              <h1 className="mt-4 text-2xl font-semibold text-[#10212f]">
                Page introuvable
              </h1>
            </div>
          </div>
        }
      />

    </Routes>
  );
}


export default App;