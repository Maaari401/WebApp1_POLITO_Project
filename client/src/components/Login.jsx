import { useContext, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { UserContext } from "../UserContext.js";
import API from "../api/API.js";

export const Login = () => {
    const { login } = useContext(UserContext);
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");
        try {
            const user = await API.login(username, password);
            login(user);
            navigate("/userDetails");
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="login-container">
            <form onSubmit={handleSubmit} className="login-form">
                <h2>Login</h2>
                {error && <p className="login-error">{error}</p>}
                <div className="form-group">
                    <label htmlFor="username">Email</label>
                    <input
                        id="username"
                        type="text"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                        id="password"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <div className="form-actions">
                    <button type="submit">Login</button>
                    <Link to="/">Torna alla Home</Link>
                </div>
                <div className="form-actions">
                    <Link to="/register">Non sei ancora registrato?</Link>
                </div>
            </form>
        </div>
    );
};