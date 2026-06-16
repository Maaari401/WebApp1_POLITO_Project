import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/api.js";

export function Register() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        username: "",
        password: "",
        firstname: "",
        lastname: "",
        email: "",
        birth_date: "",
    });
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");
        try {
            await API.register(form);
            navigate("/login");
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="login-container">
            <form onSubmit={handleSubmit} className="login-form">
                <h2>Registrazione</h2>
                {error && <p className="login-error">{error}</p>}
                <div className="form-group">
                    <label htmlFor="firstname">Nome</label>
                    <input id="firstname" name="firstname" type="text" required value={form.firstname} onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label htmlFor="lastname">Cognome</label>
                    <input id="lastname" name="lastname" type="text" required value={form.lastname} onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input id="email" name="email" type="email" required value={form.email} onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label htmlFor="username">Username</label>
                    <input id="username" name="username" type="text" required value={form.username} onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input id="password" name="password" type="password" required minLength={6} value={form.password} onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label htmlFor="birth_date">Data di nascita</label>
                    <input id="birth_date" name="birth_date" type="date" required value={form.birth_date} onChange={handleChange} />
                </div>
                <div className="form-actions">
                    <button type="submit">Registrati</button>
                    <Link to="/login">Hai già un account?</Link>
                </div>
            </form>
        </div>
    );
}