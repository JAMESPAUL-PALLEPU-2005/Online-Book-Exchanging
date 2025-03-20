import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import OnlineBookExchange from './components/OnlineBookExchange';
import Login from './components/Login';
import Signup from './components/Signup';
import './App.css';

const App = () => (
  <Router>
    <Routes>
      <Route path="/" exact element={<OnlineBookExchange />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
    </Routes>
  </Router>
);

export default App;
