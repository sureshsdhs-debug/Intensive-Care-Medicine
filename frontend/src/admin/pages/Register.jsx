import { useState } from "react";
import { useAuth } from "../../auth/AuthProvider";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import "../../assets/register.css"; 

const Register = () => {
  const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;
  const navigate = useNavigate();
  const { loginAction } = useAuth();

  const [inputs, setInputs] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    gender: "Male",
    status: 1,
  });

  const handleChange = (e) => {
    setInputs({ ...inputs, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const { data } = await axios.post(
        `${BACKEND_BASE_URL}/api/student/add`,
        inputs
      );

      if (data?.success) {
        toast.success(data.message);
        loginAction({ token: data.token, role: "" });
        navigate("/dashboard");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">

        {/* LEFT PANEL */}
        <div className="auth-left">
          <h2>Online Exam Portal</h2>
          <p>Create an account and start your journey</p>

          <ul>
            <li>📝 Attend live & scheduled exams</li>
            <li>📊 Track results & analytics</li>
            <li>🎯 Improve with performance insights</li>
          </ul>
        </div>

        {/* RIGHT PANEL */}
        <div className="auth-right">
          <h3>Create Account ✨</h3>
          <p>Please fill the details below</p>

          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6">
                <label>Name *</label>
                <input
                  type="text"
                  name="name"
                  value={inputs.name}
                  onChange={handleChange}
                  placeholder="Ex. Abc"
                  required
                />
              </div>

              <div className="col-md-6">
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={inputs.email}
                  onChange={handleChange}
                  placeholder="Ex. abc@gmail.com"
                  required
                />
              </div>

              <div className="col-md-6">
                <label>Mobile *</label>
                <input
                  type="number"
                  name="mobile"
                  value={inputs.mobile}
                  onChange={handleChange}
                  placeholder="Ex. 9876567654"
                  required
                />
              </div>

              <div className="col-md-6">
                <label>Password *</label>
                <input
                  type="password"
                  name="password"
                  value={inputs.password}
                  onChange={handleChange}
                  placeholder="Password"
                  required
                />
              </div>

              <div className="col-md-6">
                <label>Gender</label>
                <select
                  name="gender"
                  value={inputs.gender}
                  onChange={handleChange}
                >
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
            </div>

            <button className="auth-btn">Sign Up</button>

            <p className="auth-footer">
              Already have an account? <Link to="/login">Login</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
