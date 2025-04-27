import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  FiMenu, FiX, FiUser, FiLogOut, FiBook, 
  FiHome, FiSettings, FiSun, FiMoon, FiBell 
} from 'react-icons/fi';
import { MessageSquare, Users } from 'lucide-react';
import { useTheme } from '../../context/ThemeProvider';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const location = useLocation();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
    setShowUserMenu(false);
  }, [location]);

  const NavItem = ({ to, icon: Icon, children }) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
          isActive
            ? 'bg-blue-500/10 text-blue-400'
            : 'text-white/80 hover:bg-white/5 hover:text-blue-400'
        }`
      }
    >
      <Icon className="w-4 h-4" />
      <span>{children}</span>
    </NavLink>
  );

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-200 ${
        isScrolled
          ? 'bg-black/95 backdrop-blur-md border-b border-white/10'
          : 'bg-black'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Updated Logo Section */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center transform rotate-12 hover:rotate-0 transition-transform duration-300">
                <span className="text-white font-bold text-xl transform -rotate-12 group-hover:rotate-0 transition-transform duration-300">S</span>
              </div>
              <div className="hidden sm:flex flex-col items-start">
                <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                  SkillSphere
                </span>
                <span className="text-xs text-white/50 font-medium tracking-wider">
                  LEARN • GROW • EXCEL
                </span>
              </div>
              {/* Mobile Logo Text */}
              <span className="sm:hidden font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                SS
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {isAuthenticated && (
              <>
                <NavItem to="/dashboard" icon={FiHome}>Dashboard</NavItem>
                <NavItem to="/classes" icon={FiBook}>Classes</NavItem>
                <NavItem to="/discussions" icon={MessageSquare}>Discussions</NavItem>
                <NavItem to="/community" icon={Users}>Community</NavItem>
              </>
            )}
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-white/80 hover:text-blue-400 hover:bg-white/5 transition-colors"
              aria-label="Toggle theme"
            >
              {isDark ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
            </button>

            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <button className="p-2 rounded-full text-white/80 hover:text-blue-400 hover:bg-white/5 transition-colors relative">
                  <FiBell className="w-5 h-5" />
                  <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 transform translate-x-1/2 -translate-y-1/2"></span>
                </button>

                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 p-2 rounded-full text-white/80 hover:text-blue-400 hover:bg-white/5 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                  </button>

                  {/* Dropdown Menu */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 rounded-xl overflow-hidden backdrop-blur-md bg-black/50 border border-white/10 shadow-lg">
                      <div className="py-1" role="menu">
                        <Link
                          to="/profile"
                          className="flex items-center px-4 py-2 text-sm text-white/80 hover:text-blue-400 hover:bg-white/5"
                        >
                          <FiUser className="mr-2 h-4 w-4" />
                          Profile
                        </Link>
                        <Link
                          to="/settings"
                          className="flex items-center px-4 py-2 text-sm text-white/80 hover:text-blue-400 hover:bg-white/5"
                        >
                          <FiSettings className="mr-2 h-4 w-4" />
                          Settings
                        </Link>
                        <div className="border-t border-white/10"></div>
                        <button
                          onClick={logout}
                          className="flex w-full items-center px-4 py-2 text-sm text-red-400 hover:bg-white/5"
                        >
                          <FiLogOut className="mr-2 h-4 w-4" />
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="hidden md:flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-white/80 hover:text-blue-400 text-sm font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-md text-white/80 hover:text-blue-400 hover:bg-white/5"
            >
              {isOpen ? (
                <FiX className="h-6 w-6" />
              ) : (
                <FiMenu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden py-4 space-y-2 bg-black/50 backdrop-blur-md rounded-xl border border-white/10 mt-2">
            {isAuthenticated ? (
              <>
                <NavItem to="/dashboard" icon={FiHome}>Dashboard</NavItem>
                <NavItem to="/classes" icon={FiBook}>Classes</NavItem>
                <NavItem to="/discussions" icon={MessageSquare}>Discussions</NavItem>
                <NavItem to="/community" icon={Users}>Community</NavItem>
                <div className="border-t border-white/10 my-4"></div>
                <NavItem to="/profile" icon={FiUser}>Profile</NavItem>
                <NavItem to="/settings" icon={FiSettings}>Settings</NavItem>
                <button
                  onClick={logout}
                  className="flex w-full items-center px-3 py-2 text-sm font-medium text-red-400 hover:bg-white/5 rounded-md"
                >
                  <FiLogOut className="mr-2 h-4 w-4" />
                  Logout
                </button>
              </>
            ) : (
              <div className="space-y-2 px-3">
                <Link
                  to="/login"
                  className="block w-full text-left px-3 py-2 text-base font-medium text-white/80 hover:text-blue-400 hover:bg-white/5 rounded-md"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block w-full text-center px-3 py-2 text-base font-medium bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-md"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;