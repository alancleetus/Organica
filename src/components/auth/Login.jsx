// src/components/Login.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { login, isAuthenticated } from "./authService";

import { toast } from "react-toastify";
import { TextField, Button, Container, Typography, Box } from "@mui/material";
import HighlightIcon from "@mui/icons-material/Highlight";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness5Icon from "@mui/icons-material/Brightness5";

const Login = ({ toggleTheme, theme }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();
  // on click login button
  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await login(email, password);
      toast.success("Login Successful!", {
        position: "top-center",
      });
      window.location.href = "/main";
    } catch (error) {
      toast.error(error.message, { position: "bottom-center" });
    }
  };
  // Check if the user is already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const isAuthenticatedUser = await isAuthenticated();
      if (isAuthenticatedUser) {
        navigate("/main");
      }
    };
    checkAuth();
  }, [navigate]);

  return (
    <>
      <div style={{ width: "100%", textAlign: "right" }}>
        <button
          className="dark-mode-button"
          style={{
            marginRight: "10px",
            color: "var(--primary-color)",
          }}
          onClick={toggleTheme}
        >
          {theme === "light" ? <Brightness4Icon /> : <Brightness5Icon />}{" "}
        </button>
      </div>
      <Container>
        <Box className="login-register-flexbox">
          <div className="login-register-container">
            <form onSubmit={handleSubmit} className="register-form ">
              <Box mb={2}>
                <Typography
                  variant="h4"
                  component="h1"
                  gutterBottom
                  className="organica-title"
                  align="center"
                  style={{ marginBottom: "30px" }}
                >
                  <HighlightIcon></HighlightIcon>Organica
                </Typography>
              </Box>
              <Box mb={2}>
                <TextField
                  fullWidth
                  type="email"
                  label="Email"
                  variant="outlined"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="custom-textfield"
                />
              </Box>
              <Box mb={2}>
                <TextField
                  fullWidth
                  type="password"
                  label="Password"
                  variant="outlined"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="custom-textfield"
                  required
                />
              </Box>
              <Button
                fullWidth
                type="submit"
                variant="contained"
                color="primary"
              >
                Login
              </Button>
            </form>
            <p className="custom-hyperlink">
              Already a member? <a href="/register">Register</a>
            </p>{" "}
            <p className="custom-hyperlink">
              Try app with{" "}
              <a
                href=""
                onClick={(e) => {
                  e.preventDefault();
                  setEmail("test@gmail.com");
                  setPassword("testpassword");
                }}
              >
                Test Account
              </a>
            </p>
          </div>
        </Box>
      </Container>
    </>
  );
};

export default Login;
