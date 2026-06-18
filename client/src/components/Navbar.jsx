import {UserContext} from "../UserContext.js";
import {useContext} from "react";
import {useNavigate} from "react-router-dom";


export const Navbar = () => {
    const { user, logout } = useContext(UserContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <header>
            <div className="title-block" >
                <h1 className="title" onClick={() => navigate('/')} >Ultima Corsa</h1>
                <p className="subtitle">Rete Metropolitana di Valdoria</p>
            </div>
            <div className="header-actions">
                {user !== null &&
                    <button className="btn-logout" onClick={() => navigate('/leaderBoard')}>LeaderBoard</button>}
                {user !== null ?
                    <button className="btn-logout" onClick={handleLogout}>Logout</button>
                    :
                    <button className="btn-logout" onClick={() => navigate('/login')}>Login</button>
                }
                
                <div className="avatar" onClick={() => navigate('/UserDetails')}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <circle cx="12" cy="8" r="3.2"/>
                        <path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6"/>
                    </svg>
                </div>
            </div>
        </header>
    )
}