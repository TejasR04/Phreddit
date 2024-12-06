import React, { createContext, useState, useContext } from "react";

// Create a Context for the User
const UserContext = createContext();

// Create a Provider to manage user state
export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);  // Initially no user is logged in

    const loginUser = (userData) => {
        setUser(userData);  // Set the user state after successful login
    };

    const logoutUser = () => {
        setUser(null);  // Remove the user data on logout
    };

    return (
        <UserContext.Provider value={{ user, loginUser, logoutUser }}>
            {children}
        </UserContext.Provider>
    );
};

// Custom hook to use the UserContext
export const useUser = () => useContext(UserContext);
