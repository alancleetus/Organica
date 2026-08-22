import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import MailLineIcon from "remixicon-react/MailLineIcon";
import LockPasswordLineIcon from "remixicon-react/LockPasswordLineIcon";
import EyeLineIcon from "remixicon-react/EyeLineIcon";
import EyeOffLineIcon from "remixicon-react/EyeOffLineIcon";
import { login } from "./authService";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await login(email, password);
      toast.success("Login Successful!", { position: "top-center" });
      navigate("/main");
    } catch (error) {
      toast.error(error.message, { position: "bottom-center" });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-backdrop" aria-hidden="true" />
      <form className="login-card" onSubmit={handleSubmit}>
        <div className="login-brand">
          <span className="login-brand-icon-halo">
            <img src="/favIcon.svg" alt="" className="login-brand-icon" />
          </span>
          <h1>Organica</h1>
          <p className="login-tagline">Notes and tasks, organized your way.</p>
        </div>

        <label className="login-field">
          <span>Email</span>
          <span className="login-field-control">
            <MailLineIcon aria-hidden="true" />
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
              data-testid="login-username"
            />
          </span>
        </label>

        <label className="login-field">
          <span>Password</span>
          <span className="login-field-control">
            <LockPasswordLineIcon aria-hidden="true" />
            <input
              type={isPasswordVisible ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
              data-testid="login-password"
            />
            <button
              type="button"
              className="login-field-toggle"
              aria-label={isPasswordVisible ? "Hide password" : "Show password"}
              onClick={() => setIsPasswordVisible((prev) => !prev)}
            >
              {isPasswordVisible ? <EyeOffLineIcon /> : <EyeLineIcon />}
            </button>
          </span>
        </label>

        <button
          type="submit"
          className="login-submit"
          disabled={isSubmitting}
          data-testid="login-submit"
        >
          {isSubmitting ? "Logging in..." : "Log in"}
        </button>
      </form>
    </div>
  );
};

export default Login;
