import { useState } from "react";
import { useAuth } from "../../auth/AuthProvider";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import "../../assets/login.css"; // 👈 make sure this file exists

const Login = () => {
  const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;
  const navigate = useNavigate();
  const { loginAction } = useAuth();

  const [inputs, setInputs] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = {
      email: inputs.email,
      password: inputs.password,
    };

    try {
      const endpoint =
        inputs.email === "admin@gmail.com"
          ? `${BACKEND_BASE_URL}/api/user/login`
          : `${BACKEND_BASE_URL}/api/student/login`;

      const { data } = await axios.post(endpoint, formData, {
        withCredentials: true,
      });

      if (data?.success) {
        toast.success(data.message);
        
        const tokenData = { token: data.token, userId: data.userId, role: data.role || "" };

        loginAction(tokenData);
         
        navigate("/dashboard");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  const handleChange = (e) => {
    setInputs({
      ...inputs,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="login-page">
      <div className="login-card">
        {/* Left side – branding / info */}
        <div className="login-card-left">
          <h1 className="login-title">Online Exam Portal</h1>
          <p className="login-subtitle">
            Login to access your dashboard, attempt exams, and track your
            performance in real-time.
          </p>
          <ul className="login-points">
            <li>📝 Attend live & scheduled exams</li>
            <li>📊 View detailed results & analytics</li>
            <li>🎯 Improve with performance insights</li>
          </ul>
        </div>

        {/* Right side – actual form */}
        <div className="login-card-right">
          <h2 className="login-heading">Welcome Back 👋</h2>
          <p className="login-caption">Please sign in to continue</p>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="login-field">
              <label htmlFor="email" className="login-label">
                Email <span className="required">*</span>
              </label>
              <input
                type="email"
                className="login-input"
                name="email"
                onChange={handleChange}
                value={inputs.email}
                placeholder="Ex. abc@gmail.com"
                required
              />
            </div>

            <div className="login-field">
              <label htmlFor="password" className="login-label">
                Password <span className="required">*</span>
              </label>
              <input
                type="password"
                className="login-input"
                onChange={handleChange}
                name="password"
                value={inputs.password}
                placeholder="Enter your password"
                required
              />
            </div>

            <button type="submit" className="login-btn">
              Login
            </button>

            <p className="login-footer-text">
              New user?{" "}
              <Link to="/register" className="login-link">
                Create an account
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
