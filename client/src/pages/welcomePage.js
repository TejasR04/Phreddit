import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api"; // Import the api helper

const WelcomePage = () => {
  const [formType, setFormType] = useState("welcome");
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    displayName: "",
    password: "",
    passwordVerification: "",
  });
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleInputChange = (e, dataType) => {
    const { name, value } = e.target;
    if (dataType === "register") {
      setUserData({
        ...userData,
        [name]: value,
      });
    } else if (dataType === "login") {
      setLoginData({
        ...loginData,
        [name]: value,
      });
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (userData.password !== userData.passwordVerification) {
      setErrorMessage("Passwords do not match.");
      return;
    }
    try {
      const response = await api.register({
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        displayName: userData.displayName,
        password: userData.password,
        passwordVerification: userData.passwordVerification,
      });
      navigate(`/welcome`);
    } catch (error) {
      setErrorMessage("Error registering user. Please try again.");
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    console.log("Login data being submitted:", loginData);  // Check the values
    try {
      const response = await api.login({
        email: loginData.email,
        password: loginData.password,
      });
      navigate(`/home`);
    } catch (error) {
      setErrorMessage("Invalid credentials. Please try again.");
      console.error("Login error:", error.response?.data || error);
    }
};

  

  const renderForm = () => {
    switch (formType) {
      case "register":
        return (
          <form onSubmit={handleRegisterSubmit}>
            <h2>Register</h2>
            {errorMessage && <div className="error">{errorMessage}</div>}
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              value={userData.firstName}
              onChange={(e) => handleInputChange(e, "register")}
              required
            />
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              value={userData.lastName}
              onChange={(e) => handleInputChange(e, "register")}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={userData.email}
              onChange={(e) => handleInputChange(e, "register")}
              required
            />
            <input
              type="text"
              name="displayName"
              placeholder="Display Name"
              value={userData.displayName}
              onChange={(e) => handleInputChange(e, "register")}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={userData.password}
              onChange={(e) => handleInputChange(e, "register")}
              required
            />
            <input
              type="password"
              name="passwordVerification"
              placeholder="Verify Password"
              value={userData.passwordVerification}
              onChange={(e) => handleInputChange(e, "register")}
              required
            />
            <button type="submit">Register</button>
          </form>
        );
      case "login":
        return (
          <form onSubmit={handleLoginSubmit}>
            <h2>Login</h2>
            {errorMessage && <div className="error">{errorMessage}</div>}
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={loginData.email}
              onChange={(e) => handleInputChange(e, "login")}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={loginData.password}
              onChange={(e) => handleInputChange(e, "login")}
              required
            />
            <button type="submit">Login</button>
          </form>
        );
      case "guest":
        return (
          <div>
            <h2>Continue as Guest</h2>
            <button onClick={() => navigate(`/guest-home`)}>Go to Guest Home</button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="welcome-page">
      <h1>Welcome to Our Platform</h1>
      <div className="actions">
        <button onClick={() => setFormType("register")}>Register as a New User</button>
        <button onClick={() => setFormType("login")}>Log In</button>
        <button onClick={() => setFormType("guest")}>Continue as Guest</button>
      </div>
      {renderForm()}
    </div>
  );
};

export default WelcomePage;


