import {
  Route,
  Routes,
} from "react-router-dom";


import Home from "./pages/Home";
import Store from "./pages/Store";
import About from "./pages/About";
import Contact from "./pages/Contact";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";


import AdminRoute from "./components/admin/AdminRoute";
import AdminLayout from "./components/admin/AdminLayout";


import AdminDashboard from "./pages/admin/AdminDashboard";
import Clients from "./pages/admin/Clients";
import ClientDetail from "./pages/admin/ClientDetail";


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
        path="/about"
        element={<About />}
      />

      <Route
        path="/contact"
        element={<Contact />}
      />


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