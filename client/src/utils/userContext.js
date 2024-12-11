import React, { createContext, useState, useContext, useEffect } from "react";

// Create a Context for the User
const UserContext = createContext();

// Create a Provider to manage user state
export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);  // Initially no user is logged in

    // Check for existing user in localStorage when the app is loaded
    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        if (storedUser) {
            setUser(storedUser);  // Set user from localStorage if it exists
        }
    }, []);

    // Login the user and store data in state and localStorage
    const loginUser = (userData) => {
        setUser(userData);  // Set the user state after successful login
        localStorage.setItem("user", JSON.stringify(userData));  // Store user in localStorage
    };

    // Logout the user and clear data from state and localStorage
    const logoutUser = () => {
        setUser(null);  // Remove the user data from state
        localStorage.removeItem("user");  // Clear the user data from localStorage
    };

    return (
        <UserContext.Provider value={{ user, loginUser, logoutUser }}>
            {children}
        </UserContext.Provider>
    );
};

// Custom hook to use the UserContext
export const useUser = () => useContext(UserContext);
