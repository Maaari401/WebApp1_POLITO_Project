import {useState} from 'react'
import { BrowserRouter, Route, Routes} from "react-router-dom";
import './App.css'

import {Navbar} from "./components/Navbar.jsx";
import {Login} from "./components/Login.jsx";
import {Register} from "./components/Register.jsx"
import API from "./api/API.js";
import {Game} from "./components/Game.jsx";
import {UserDetails} from "./components/UserDetails.jsx"
import {LeaderBoardSection} from "./components/LeaderBoard.jsx";
import {UserContext} from "./UserContext.js"



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
                    <Route path="/" element={<Game key={user ? user.id : "guest"} />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/leaderBoard" element={<LeaderBoardSection />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/userDetails" element={<UserDetails />} />
              </Routes>
          </BrowserRouter>
      </UserContext.Provider>
  )
}

export default App
