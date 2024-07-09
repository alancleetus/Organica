// src/components/Register.js
import React, { useState } from "react";
import { register } from "./authService";

import { toast } from "react-toastify";
import { TextField, Button, Container, Typography, Box } from "@mui/material";

import HighlightIcon from "@mui/icons-material/Highlight";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness5Icon from "@mui/icons-material/Brightness5";

const Register = ({ theme, toggleTheme }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await register(email, password);
      toast.success("User Registered Successfully!", {
        position: "top-center",
      });
      window.location.href = "/login"; // Fix the redirection
    } catch (error) {
      toast.error(error.message, { position: "bottom-center" });
    }
  };

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
      <Container maxWidth="sm">
        <Box className="login-register-flexbox">
          <div className="login-register-container">
            <form onSubmit={handleSubmit} className="register-form">
              <Box mb={2}>
                <Typography
                  variant="h4"
                  component="h1"
                  gutterBottom
                  className="keeper-title"
                  align="center"
                  style={{ marginBottom: "30px" }}
                >
                  <HighlightIcon></HighlightIcon>Keeper
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
                Register
              </Button>
            </form>
            <p className="custom-hyperlink">
              Already a member? <a href="/login">Login</a>
            </p>
          </div>
        </Box>
      </Container>
    </>
  );
};

export default Register;
