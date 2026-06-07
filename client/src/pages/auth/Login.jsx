import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { loginUser, clearError } from '../../redux/slices/authSlice';

const schema = yup.object({
  email: yup.string().required('Email is required').email('Invalid email address'),
  password: yup.string().notRequired(),
});

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);

  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);
  
  const from = location.state?.from?.pathname || '/';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      email: localStorage.getItem('lastEmail') || '',
      password: '',
    }
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
    return () => {
      dispatch(clearError());
    };
  }, [isAuthenticated, navigate, from, dispatch]);

  const onSubmit = async (data) => {
    const resultAction = await dispatch(loginUser(data));
    if (loginUser.fulfilled.match(resultAction)) {
      localStorage.setItem('lastEmail', data.email);
      toast.success('Logged in successfully! 👋');
    } else {
      toast.error(resultAction.payload || 'Login failed');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full card p-8 space-y-6 relative overflow-hidden">
        {/* Background glow decorator */}
        <div className="absolute -top-10 -right-10 w-36 h-36 bg-primary-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="text-center">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white">Welcome Back! 👋</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
            Log in to manage orders and access your profile.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="email"
                placeholder="you@example.com"
                className={`input-field pl-9 ${errors.email ? 'input-error' : ''}`}
                {...register('email')}
              />
            </div>
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs text-primary-600 dark:text-primary-400 hover:underline font-medium"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className={`input-field pl-9 pr-9 ${errors.password ? 'input-error' : ''}`}
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 text-base justify-center mt-6"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="text-center pt-2 text-sm text-slate-500 dark:text-slate-400">
          <span>New to ModernShop? </span>
          <Link
            to="/register"
            className="text-primary-600 dark:text-primary-400 hover:underline font-semibold"
          >
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
}
