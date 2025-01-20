import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ element: Component, ...rest }) => {
  const token = localStorage.getItem("token");

  // If the token doesn't exist, redirect to login or another page
  if (!token) {
    return <Navigate to="/login" replace />;
  }else{ 
    alert("Unauthorized token");
    return <Component {...rest} />;

  }

};

export default PrivateRoute;
