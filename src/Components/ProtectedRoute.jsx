import { Navigate } from "react-router-dom";
import { isAuthenticated } from "../Utils/auth";

function ProtectedRoute({ children }) {

  if(!isAuthenticated()){
    return <Navigate to="/" />;
  }

  return children;
}

export default ProtectedRoute;