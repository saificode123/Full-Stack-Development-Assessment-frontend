import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, ArrowLeft, User, Bell, Shield, Palette, CheckCircle2, AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react';
import api from '../api/axios';

export default function SettingsPage() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('profile');
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');

  // Apply dark mode class to <html> element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const sections = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
  ];

  // ─── Profile Section State ───────────────────────────────────────────────
  const [profile, setProfile] = useState({ first_name: '', last_name: '', email: '', username: '' });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileFetching, setProfileFetching] = useState(true);
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/auth/profile/');
        setProfile(res.data);
      } catch (err) {
        console.error('Failed to fetch profile', err);
      } finally {
        setProfileFetching(false);
      }
    };
    fetchProfile();
  }, []);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMsg({ type: '', text: '' });
    try {
      const res = await api.patch('/auth/profile/', {
        first_name: profile.first_name,
        last_name: profile.last_name,
        email: profile.email,
      });
      setProfile(res.data);
      setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.response?.data?.error || 'Failed to update profile.' });
    } finally {
      setProfileLoading(false);
    }
  };

  // ─── Notifications Section State ─────────────────────────────────────────
  const [notifications, setNotifications] = useState({
    task_assignments: true,
    team_invites: true,
    task_status_updates: false,
    weekly_digest: false,
  });
  const [notifSaved, setNotifSaved] = useState(false);

  const handleNotifToggle = (key) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleNotifSave = () => {
    // Persist to localStorage (no backend endpoint needed for this)
    localStorage.setItem('notificationPrefs', JSON.stringify(notifications));
    setNotifSaved(true);
    setTimeout(() => setNotifSaved(false), 2500);
  };

  // Load saved notification prefs on mount
  useEffect(() => {
    const saved = localStorage.getItem('notificationPrefs');
    if (saved) {
      try { setNotifications(JSON.parse(saved)); } catch (e) { console.warn('Invalid notification prefs', e); }
    }
  }, []);

  const notifItems = [
    { key: 'task_assignments', label: 'Task Assignments', desc: 'Get notified when a task is assigned to you' },
    { key: 'team_invites', label: 'Team Invites', desc: 'Get notified when you are invited to a team' },
    { key: 'task_status_updates', label: 'Task Status Updates', desc: 'Get notified when task status changes' },
    { key: 'weekly_digest', label: 'Weekly Digest', desc: 'Receive a weekly summary of your team activity' },
  ];

  // ─── Security Section State ───────────────────────────────────────────────
  const [passwords, setPasswords] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordMsg({ type: '', text: '' });

    if (passwords.new_password !== passwords.confirm_password) {
      setPasswordMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    if (passwords.new_password.length < 8) {
      setPasswordMsg({ type: 'error', text: 'New password must be at least 8 characters.' });
      return;
    }

    setPasswordLoading(true);
    try {
      await api.post('/auth/change-password/', {
        current_password: passwords.current_password,
        new_password: passwords.new_password,
      });
      setPasswordMsg({ type: 'success', text: 'Password changed successfully!' });
      setPasswords({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      setPasswordMsg({ type: 'error', text: err.response?.data?.error || 'Failed to change password.' });
    } finally {
      setPasswordLoading(false);
    }
  };

  // ─── Shared UI helpers ────────────────────────────────────────────────────
  const MessageBanner = ({ msg }) => {
    if (!msg.text) return null;
    return (
      <div className={`flex items-center gap-2 p-3 rounded-xl text-sm font-medium border ${
        msg.type === 'success'
          ? 'bg-green-50 text-green-700 border-green-100'
          : 'bg-red-50 text-red-600 border-red-100'
      }`}>
        {msg.type === 'success' ? <CheckCircle2 size={16} className="shrink-0" /> : <AlertCircle size={16} className="shrink-0" />}
        <p>{msg.text}</p>
      </div>
    );
  };

  const inputClass = "w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-green-50 focus:border-green-400 transition-all text-sm text-gray-900";

  return (
    <div className="min-h-screen bg-[#F4F7F5] font-sans p-4 sm:p-8 lg:p-10">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/')}
            className="p-2 bg-white rounded-xl shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors active:scale-95"
          >
            <ArrowLeft size={20} className="text-gray-700" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center">
              <Settings className="text-green-400 w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Settings</h1>
              <p className="text-gray-500 text-sm font-medium">Manage your account preferences</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Nav */}
          <div className="bg-white rounded-[24px] p-4 shadow-sm border border-gray-100 h-fit">
            <nav className="space-y-1">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                    activeSection === section.id
                      ? 'bg-green-500 text-white shadow-md shadow-green-200'
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <section.icon size={18} />
                  {section.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content Panel */}
          <div className="lg:col-span-3 bg-white rounded-[24px] p-6 sm:p-8 shadow-sm border border-gray-100">

            {/* ── PROFILE ── */}
            {activeSection === 'profile' && (
              <div>
                <h2 className="text-lg font-extrabold text-gray-900 mb-6">Profile Settings</h2>
                {profileFetching ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 size={28} className="animate-spin text-green-500" />
                  </div>
                ) : (
                  <form onSubmit={handleProfileSave} className="space-y-5">
                    <MessageBanner msg={profileMsg} />

                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Username</p>
                      <p className="text-sm font-bold text-gray-700">{profile.username}</p>
                      <p className="text-xs text-gray-400 mt-1">Username cannot be changed.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">First Name</label>
                        <input
                          type="text"
                          placeholder="First name"
                          className={inputClass}
                          value={profile.first_name}
                          onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Last Name</label>
                        <input
                          type="text"
                          placeholder="Last name"
                          className={inputClass}
                          value={profile.last_name}
                          onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Email Address</label>
                      <input
                        type="email"
                        placeholder="your@email.com"
                        className={inputClass}
                        value={profile.email}
                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={profileLoading}
                      className="bg-black text-white font-bold px-6 py-3 rounded-full hover:bg-gray-800 transition-all shadow-md active:scale-95 text-sm disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {profileLoading && <Loader2 size={16} className="animate-spin" />}
                      {profileLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* ── NOTIFICATIONS ── */}
            {activeSection === 'notifications' && (
              <div>
                <h2 className="text-lg font-extrabold text-gray-900 mb-2">Notification Preferences</h2>
                <p className="text-sm text-gray-500 font-medium mb-6">Choose which notifications you want to receive.</p>

                {notifSaved && (
                  <div className="flex items-center gap-2 p-3 mb-4 bg-green-50 text-green-700 border border-green-100 rounded-xl text-sm font-medium">
                    <CheckCircle2 size={16} /> Preferences saved!
                  </div>
                )}

                <div className="space-y-3">
                  {notifItems.map(({ key, label, desc }) => (
                    <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-gray-200 transition-colors">
                      <div>
                        <p className="text-sm font-bold text-gray-800">{label}</p>
                        <p className="text-xs text-gray-400 font-medium mt-0.5">{desc}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleNotifToggle(key)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                          notifications[key] ? 'bg-green-500' : 'bg-gray-200'
                        }`}
                        aria-pressed={notifications[key]}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform ${
                            notifications[key] ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleNotifSave}
                  className="mt-6 bg-black text-white font-bold px-6 py-3 rounded-full hover:bg-gray-800 transition-all shadow-md active:scale-95 text-sm"
                >
                  Save Preferences
                </button>
              </div>
            )}

            {/* ── SECURITY ── */}
            {activeSection === 'security' && (
              <div>
                <h2 className="text-lg font-extrabold text-gray-900 mb-2">Change Password</h2>
                <p className="text-sm text-gray-500 font-medium mb-6">Use a strong password with at least 8 characters.</p>

                <form onSubmit={handlePasswordChange} className="space-y-5">
                  <MessageBanner msg={passwordMsg} />

                  {/* Current Password */}
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Current Password</label>
                    <div className="relative">
                      <input
                        type={showPasswords.current ? 'text' : 'password'}
                        placeholder="••••••••"
                        required
                        className={inputClass}
                        value={passwords.current_password}
                        onChange={(e) => setPasswords({ ...passwords, current_password: e.target.value })}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                        className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">New Password</label>
                    <div className="relative">
                      <input
                        type={showPasswords.new ? 'text' : 'password'}
                        placeholder="••••••••"
                        required
                        className={inputClass}
                        value={passwords.new_password}
                        onChange={(e) => setPasswords({ ...passwords, new_password: e.target.value })}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                        className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {/* Password strength indicator */}
                    {passwords.new_password && (
                      <div className="mt-2 flex gap-1">
                        {[1, 2, 3, 4].map((level) => (
                          <div
                            key={level}
                            className={`h-1 flex-1 rounded-full transition-colors ${
                              passwords.new_password.length >= level * 3
                                ? passwords.new_password.length >= 12 ? 'bg-green-500'
                                  : passwords.new_password.length >= 8 ? 'bg-yellow-400'
                                  : 'bg-red-400'
                                : 'bg-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Confirm New Password */}
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Confirm New Password</label>
                    <div className="relative">
                      <input
                        type={showPasswords.confirm ? 'text' : 'password'}
                        placeholder="••••••••"
                        required
                        className={`${inputClass} ${
                          passwords.confirm_password && passwords.new_password !== passwords.confirm_password
                            ? 'border-red-300 focus:border-red-400 focus:ring-red-50'
                            : ''
                        }`}
                        value={passwords.confirm_password}
                        onChange={(e) => setPasswords({ ...passwords, confirm_password: e.target.value })}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                        className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {passwords.confirm_password && passwords.new_password !== passwords.confirm_password && (
                      <p className="text-xs text-red-500 font-medium mt-1 ml-1">Passwords do not match</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="bg-black text-white font-bold px-6 py-3 rounded-full hover:bg-gray-800 transition-all shadow-md active:scale-95 text-sm disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {passwordLoading && <Loader2 size={16} className="animate-spin" />}
                    {passwordLoading ? 'Updating...' : 'Update Password'}
                  </button>
                </form>
              </div>
            )}

            {/* ── APPEARANCE ── */}
            {activeSection === 'appearance' && (
              <div>
                <h2 className="text-lg font-extrabold text-gray-900 mb-2">Appearance</h2>
                <p className="text-sm text-gray-500 font-medium mb-6">Choose your preferred theme for the dashboard.</p>

                <div className="grid grid-cols-2 gap-4">
                  {/* Light Mode Card */}
                  <button
                    onClick={() => setDarkMode(false)}
                    className={`p-5 rounded-2xl border-2 text-left transition-all ${
                      !darkMode
                        ? 'border-green-500 bg-green-50 shadow-md shadow-green-100'
                        : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                    }`}
                  >
                    <div className="w-full h-16 bg-white rounded-xl border border-gray-200 mb-3 flex items-center justify-center gap-2 shadow-sm">
                      <div className="w-3 h-3 rounded-full bg-gray-200" />
                      <div className="w-12 h-2 rounded-full bg-gray-200" />
                    </div>
                    <p className={`text-sm font-bold ${!darkMode ? 'text-green-700' : 'text-gray-500'}`}>Light Mode</p>
                    {!darkMode && <p className="text-xs text-green-600 font-medium mt-0.5">Currently active</p>}
                  </button>

                  {/* Dark Mode Card */}
                  <button
                    onClick={() => setDarkMode(true)}
                    className={`p-5 rounded-2xl border-2 text-left transition-all ${
                      darkMode
                        ? 'border-green-500 bg-green-50 shadow-md shadow-green-100'
                        : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                    }`}
                  >
                    <div className="w-full h-16 bg-gray-900 rounded-xl border border-gray-700 mb-3 flex items-center justify-center gap-2 shadow-sm">
                      <div className="w-3 h-3 rounded-full bg-gray-600" />
                      <div className="w-12 h-2 rounded-full bg-gray-600" />
                    </div>
                    <p className={`text-sm font-bold ${darkMode ? 'text-green-700' : 'text-gray-500'}`}>Dark Mode</p>
                    {darkMode && <p className="text-xs text-green-600 font-medium mt-0.5">Currently active</p>}
                  </button>
                </div>

                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-100 rounded-2xl">
                  <p className="text-xs font-bold text-yellow-700 uppercase tracking-widest mb-1">Note</p>
                  <p className="text-sm text-yellow-700 font-medium">
                    Dark mode preference is saved in your browser. Full dark mode styling requires Tailwind dark variant classes across all pages.
                  </p>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
