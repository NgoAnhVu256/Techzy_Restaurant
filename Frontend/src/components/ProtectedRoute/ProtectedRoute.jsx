import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { StoreContext } from "../../Context/StoreContext";

const ProtectedRoute = ({ children }) => {
  const { token } = useContext(StoreContext);

  if (!token) {
    // Redirect to home page if not logged in
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;

