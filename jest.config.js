module.exports = {
    projects: [
      {
        displayName: "server",
        testMatch: ["<rootDir>/server/**/*.test.js"],
        testEnvironment: "node",
      },
      {
        displayName: "client",
        testMatch: ["<rootDir>/client/**/*.test.js"],
        testEnvironment: "jest-environment-jsdom", // Corrected to "jest-environment-jsdom"
      },
    ],
    transform: {
        '^.+\\.(js|jsx)$': 'babel-jest',
      },
  };
  