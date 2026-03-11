import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Chrome, Apple, Facebook, ShieldCheck } from 'lucide-react';
import api from '../api/axios';

export default function Register() {
  const [formData, setFormData] = useState({ 
    username: '', 
    email: '', 
    password: '',
    confirmPassword: '' 
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear any previous errors when they click submit again

    if (formData.password !== formData.confirmPassword) {
      return setError("Passwords do not match");
    }
    
    setIsLoading(true);
    try {
      // Endpoint for secure registration
      await api.post('/auth/register/', {
        username: formData.username,
        email: formData.email,
        password: formData.password
      });
      
      // Send them to the login page so they can use their new credentials!
      navigate('/login'); 
      
    } catch (err) {
      // Better error handling to catch exact Django validation messages
      const responseData = err.response?.data;
      if (responseData && typeof responseData === 'object') {
        // Grab the first error Django sends back (whether it's username, email, or password)
        const firstErrorKey = Object.keys(responseData)[0];
        const errorMessage = responseData[firstErrorKey];
        setError(Array.isArray(errorMessage) ? errorMessage[0] : 'Registration failed. Check your details.');
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans overflow-x-hidden">
      {/* Left Side: Register Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-12 md:px-24 lg:px-20 xl:px-32 py-12">
        <div className="max-w-md w-full mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Join the Team
          </h1>
          <p className="text-gray-500 mb-8 text-sm sm:text-base">
            Create your account to start <span className="font-bold text-gray-900">creating and managing teams</span> today.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs sm:text-sm font-medium border border-red-100">
                {error}
              </div>
            )}
            
            <input
              type="text"
              placeholder="Username"
              required
              className="w-full px-5 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all text-sm sm:text-base"
              onChange={(e) => setFormData({...formData, username: e.target.value})}
            />

            <input
              type="email"
              placeholder="Email Address"
              required
              className="w-full px-5 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all text-sm sm:text-base"
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />

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
                className="absolute right-4 top-3 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <input
              type="password"
              placeholder="Confirm Password"
              required
              className="w-full px-5 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all text-sm sm:text-base"
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
            />

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-black text-white font-bold py-3 sm:py-3.5 rounded-full hover:bg-gray-800 transition-all shadow-lg active:scale-[0.98] disabled:bg-gray-400"
            >
              {isLoading ? 'Creating Account...' : 'Register Now'}
            </button>
          </form>

          <div className="relative my-8 text-center">
            <hr className="border-gray-200" />
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-4 text-xs text-gray-400 uppercase tracking-widest font-medium">
              Quick Sign Up
            </span>
          </div>

          <div className="flex justify-center space-x-3 sm:space-x-4">
            {[ {Icon: Chrome}, {Icon: Apple}, {Icon: Facebook} ].map((social, idx) => (
              <button key={idx} type="button" className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center border border-gray-200 rounded-full hover:bg-gray-50 transition-all shadow-sm">
                <social.Icon size={18} className="text-gray-900" />
              </button>
            ))}
          </div>

          <p className="mt-10 sm:mt-12 text-center text-gray-500 text-xs sm:text-sm">
            Already have an account? <Link to="/login" className="text-green-600 font-bold hover:underline transition-all">Login here</Link>
          </p>
        </div>
      </div>

      {/* Right Side: Branding Illustration  */}
      <div className="hidden lg:flex w-1/2 bg-[#f4f9f4] items-center justify-center p-8 xl:p-12 relative m-4 rounded-[40px]">
        <div className="text-center max-w-lg">
          <div className="relative inline-block mb-12">
            <div className="w-64 h-64 xl:w-80 xl:h-80 bg-white rounded-full flex items-center justify-center shadow-sm relative">
               <div className="relative">
                 <div className="w-40 h-40 xl:w-48 xl:h-48 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold text-5xl xl:text-6xl">
                   ✅
                 </div>
                 <div className="absolute -top-6 -left-6 w-12 h-12 xl:w-16 xl:h-16 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-green-50 animate-bounce">
                    <ShieldCheck className="text-green-600" />
                 </div>
               </div>
            </div>
            
            {/* Verification Badge */}
            <div className="absolute bottom-[-10px] right-[-20px] bg-white p-4 rounded-2xl shadow-xl border border-gray-100 hidden xl:block">
              <p className="font-bold text-gray-900 text-sm">Security First</p>
              <p className="text-[10px] text-gray-400">Hashed Passwords</p>
            </div>
          </div>

          <h3 className="text-2xl xl:text-3xl font-bold text-gray-900 leading-tight px-4">
            Experience <span className="text-green-600 underline decoration-green-100 underline-offset-4">secure collaboration</span> with our built-in auth system.
          </h3>
          
          <div className="flex justify-center space-x-2 mt-8">
            <div className="w-5 h-2 rounded-full bg-black"></div>
            <div className="w-2 h-2 rounded-full bg-gray-200"></div>
            <div className="w-2 h-2 rounded-full bg-gray-200"></div>
          </div>
        </div>
      </div>
    </div>
  );
}