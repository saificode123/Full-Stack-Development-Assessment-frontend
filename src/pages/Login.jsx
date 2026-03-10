import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Chrome, Apple, Facebook } from 'lucide-react';
import api from '../api/axios';

export default function Login() {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Authenticates via Django REST Framework as per instructions
      await api.post('/auth/login/', formData);
      navigate('/'); 
    } catch (err) {
      setError('Invalid credentials. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans overflow-x-hidden">
      {/* Left Side: Login Form - Responsive Widths */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-12 md:px-24 lg:px-20 xl:px-32 py-12">
        <div className="max-w-md w-full mx-auto">
          {/* Main Heading from Assessment */}
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Team Task Manager
          </h1>
          <p className="text-gray-500 mb-8 text-sm sm:text-base">
            Simplify your workflow and boost productivity. <span className="font-bold text-gray-900">Register or login securely</span> to start managing your teams and tasks.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs sm:text-sm font-medium border border-red-100">
                {error}
              </div>
            )}
            
            <div className="relative">
              <input
                type="text"
                placeholder="Username"
                required
                className="w-full px-5 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all text-sm sm:text-base"
                onChange={(e) => setFormData({...formData, username: e.target.value})}
              />
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                required
                className="w-full px-5 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all text-sm sm:text-base"
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-3 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="text-right">
              <a href="#" className="text-xs sm:text-sm font-semibold text-gray-900 hover:underline">
                Forgot Password?
              </a>
            </div>

            <button
              type="submit"
              className="w-full bg-black text-white font-bold py-3 sm:py-3.5 rounded-full hover:bg-gray-800 transition-all shadow-lg active:scale-[0.98]"
            >
              Login
            </button>
          </form>

          {/* Social Auth Placeholder */}
          <div className="relative my-8 text-center">
            <hr className="border-gray-200" />
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-4 text-xs text-gray-400 uppercase tracking-widest font-medium">
              or continue with
            </span>
          </div>

          <div className="flex justify-center space-x-3 sm:space-x-4">
            {[ {Icon: Chrome}, {Icon: Apple}, {Icon: Facebook} ].map((social, idx) => (
              <button key={idx} className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center border border-gray-200 rounded-full hover:bg-gray-50 transition-all shadow-sm active:bg-gray-100">
                <social.Icon size={18} className="text-gray-900" />
              </button>
            ))}
          </div>

          <p className="mt-10 sm:mt-12 text-center text-gray-500 text-xs sm:text-sm">
            Not a member? <Link to="/register" className="text-green-600 font-bold hover:underline transition-all">Register now</Link>
          </p>
        </div>
      </div>

      {/* Right Side: Branding Illustration - Visible only on LG screens */}
      <div className="hidden lg:flex w-1/2 bg-[#f4f9f4] items-center justify-center p-8 xl:p-12 relative m-4 rounded-[40px]">
        <div className="text-center max-w-lg">
          <div className="relative inline-block mb-12">
            <div className="w-64 h-64 xl:w-80 xl:h-80 bg-white rounded-full flex items-center justify-center shadow-sm relative overflow-visible">
               <div className="relative">
                 <div className="w-40 h-40 xl:w-48 xl:h-48 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold text-5xl xl:text-6xl animate-pulse">
                    🚀
                 </div>
                 {/* Decorative elements representing members */}
                 <div className="absolute -top-6 -left-6 w-12 h-12 xl:w-16 xl:h-16 bg-white rounded-full shadow-lg flex items-center justify-center text-xl xl:text-2xl border-2 border-green-50">👨‍💻</div>
                 <div className="absolute top-16 -right-12 w-12 h-12 xl:w-16 xl:h-16 bg-white rounded-full shadow-lg flex items-center justify-center text-xl xl:text-2xl border-2 border-green-50">👩‍💼</div>
               </div>
            </div>
            
            {/* Task Card Overlay - Representing CRUD features */}
            <div className="absolute bottom-[-10px] left-[-30px] bg-white p-4 rounded-2xl shadow-xl w-40 xl:w-48 text-left border border-gray-100 hidden xl:block">
              <p className="font-bold text-gray-900 text-sm">Team Alpha</p>
              <p className="text-[10px] text-gray-400 mb-2">4 Active Tasks</p>
              <div className="flex items-center justify-between">
                <span className="text-[9px] px-2 py-0.5 bg-green-50 text-green-700 border border-green-100 rounded-full font-bold">In Progress</span>
                <div className="w-8 h-8 rounded-full border-2 border-green-500 flex items-center justify-center text-[8px] font-bold">75%</div>
              </div>
            </div>
          </div>

          <h3 className="text-2xl xl:text-3xl font-bold text-gray-900 leading-tight px-4">
            Manage your <span className="text-green-600 underline decoration-green-100 underline-offset-4">teams and tasks</span> with professional efficiency.
          </h3>
          
          <div className="flex justify-center space-x-2 mt-8">
            <div className="w-2 h-2 rounded-full bg-gray-200"></div>
            <div className="w-5 h-2 rounded-full bg-black"></div>
            <div className="w-2 h-2 rounded-full bg-gray-200"></div>
          </div>
        </div>
      </div>
    </div>
  );
}