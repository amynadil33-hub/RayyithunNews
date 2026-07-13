import { Navigate } from "react-router-dom";

// Root redirects to the Dhivehi portal
export default function Index() {
  return <Navigate to="/" replace />;
}
