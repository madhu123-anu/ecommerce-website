import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  selectAuth,
  selectUser,
  selectIsAuthenticated,
  selectIsAdmin,
  loginUser,
  registerUser,
  logoutUser,
  updateUser,
  clearError,
} from '../redux/slices/authSlice';

export function useAuth() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const auth = useSelector(selectAuth);
  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isAdmin = useSelector(selectIsAdmin);

  const login = async (credentials) => {
    try {
      await dispatch(loginUser(credentials)).unwrap();
      toast.success('Welcome back! 🎉');
      return { success: true };
    } catch (error) {
      toast.error(error || 'Login failed');
      return { success: false, error };
    }
  };

  const register = async (userData) => {
    try {
      await dispatch(registerUser(userData)).unwrap();
      toast.success('Account created successfully! 🎉');
      return { success: true };
    } catch (error) {
      toast.error(error || 'Registration failed');
      return { success: false, error };
    }
  };

  const logout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
    } catch {
      // ignore
    }
    toast.success('Logged out successfully');
    navigate('/');
  };

  const handleUpdateUser = (userData) => {
    dispatch(updateUser(userData));
  };

  const handleClearError = () => {
    dispatch(clearError());
  };

  return {
    user,
    token: auth.token,
    isAuthenticated,
    isAdmin,
    loading: auth.loading,
    error: auth.error,
    login,
    register,
    logout,
    updateUser: handleUpdateUser,
    clearError: handleClearError,
  };
}

export default useAuth;
