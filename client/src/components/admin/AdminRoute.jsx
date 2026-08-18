import {
  Navigate,
  Outlet,
} from "react-router-dom";

import {
  useAuth,
} from "../../context/AuthContext";


function AdminRoute() {
  const {
    user,
    loading,
  } = useAuth();


  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7fbfe]">
        <p className="text-[#667785]">
          Chargement...
        </p>
      </div>
    );
  }


  if (!user) {
    return (
      <Navigate
        to="/signin"
        replace
      />
    );
  }


  if (
    user.role !== "ADMIN"
  ) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }


  return <Outlet />;
}


export default AdminRoute;