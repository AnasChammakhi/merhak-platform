import { Navigate, Outlet } from "react-router-dom";

function AdminRoute() {
  const token = localStorage.getItem("token");
  const storedUser = localStorage.getItem("user");

  if (!token || !storedUser) {
    return <Navigate to="/signin" replace />;
  }

  try {
    const user = JSON.parse(storedUser);

    if (user.role !== "ADMIN") {
      return <Navigate to="/" replace />;
    }
  } catch {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    return <Navigate to="/signin" replace />;
  }

  return <Outlet />;
}

export default AdminRoute;