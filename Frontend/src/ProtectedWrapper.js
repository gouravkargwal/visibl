import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "./AuthContext";

const ProtectedWrapper = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const auth = useContext(AuthContext);

  useEffect(() => {
    fetch("http://localhost:4000/api/verifyToken", { credentials: "include" }) // Adjust URL as needed
      .then((response) => {
        if (!response.ok) throw new Error("Not authenticated");
        return response.json();
      })
      .then((data) => {
        auth.signin(data.user, () => navigate("/"));
        setIsLoading(false);
      })
      .catch(() => {
        navigate("/login");
      });
  }, [auth, navigate]);

  if (isLoading) return <div>Loading...</div>;
  return children;
};

export default ProtectedWrapper;
