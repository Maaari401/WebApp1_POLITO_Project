import React, {createContext, useState} from 'react'
import { BrowserRouter, Route, Routes} from "react-router-dom";
import './App.css'

import {Navbar} from "./components/Navbar.jsx";
import {Login} from "./components/Login.jsx";
import {Register} from "./components/Register.jsx"
import API from "./api/api.js";
import {Game} from "./components/Game.jsx";


export const UserContext = React.createContext(null)



function UserDetails() {
    return null;
}



function App() {
  const [user, setUser] = useState(null);

  const login = (userData) => setUser(userData);
  const logout = async () => {
    await API.logout();
    setUser(null);
  };

  return (
      <UserContext.Provider value={{ user, login, logout }}>
          <BrowserRouter>
              <Navbar/>
              <Routes>
                    <Route path="/" element={<Game />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/userDetails" element={<UserDetails />} />
                    <Route path="/register" element={<Register />} />
              </Routes>
          </BrowserRouter>
      </UserContext.Provider>
  )
}

export default App
