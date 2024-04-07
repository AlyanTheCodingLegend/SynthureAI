import './App.css';
import Player from './components/Player';
import AuthUser from './components/UserAuthModel';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/Songs-App" element={<Player />}/>
        <Route path="/Songs-App/login" element={<AuthUser />}/>
      </Routes>  
    </Router>
  );
}

export default App;
