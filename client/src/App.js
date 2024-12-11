// ************** THIS IS YOUR APP'S ENTRY POINT. CHANGE THIS FILE AS NEEDED. **************
// ************** DEFINE YOUR REACT COMPONENTS in ./components directory **************
import './stylesheets/App.css';
import Phreddit from './components/phreddit.js';
import { BrowserRouter as Router } from 'react-router-dom'; 
import { UserProvider } from './utils/userContext';  


// Import your page components

function App() {
  return (
    <UserProvider>
      <Router> 
        <section className="phreddit">
          <Phreddit /> 
        </section>
      </Router>
    </UserProvider>
  );
}

export default App;

