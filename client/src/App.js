// ************** THIS IS YOUR APP'S ENTRY POINT. CHANGE THIS FILE AS NEEDED. **************
// ************** DEFINE YOUR REACT COMPONENTS in ./components directory **************
import './stylesheets/App.css';
import Phreddit from './components/phreddit.js';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; // Import Router and Routes

// Import your page components
import WelcomePage from './pages/welcomePage';  // Assuming WelcomePage is in the pages directory

function App() {
  return (
    <Router> 
      <section className="phreddit">
        <Phreddit /> 
      </section>
    </Router>
  );
}

export default App;

