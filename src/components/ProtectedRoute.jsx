import { Navigate } from "react-router-dom";
import Unauthorized from "../pages/Unauthorized";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const userStr = localStorage.getItem("user");

  // ❌ chưa login
  if (!userStr) {
    return <Navigate to="/login" replace />;
  }

  const user = JSON.parse(userStr);

  // ❌ không có token
  if (!user.token) {
    return <Navigate to="/login" replace />;
  }

  // ❌ sai role
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Unauthorized />;
  }

  // ✅ hợp lệ
  return children;
};

export default ProtectedRoute;