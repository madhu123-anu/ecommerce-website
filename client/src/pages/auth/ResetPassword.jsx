import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { resetPasswordAPI } from '../../api/authAPI';

const schema = yup.object({
  password: yup.string().required('Password is required').min(8, 'Password must be at least 8 characters'),
  confirmPassword: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password'), null], 'Passwords must match'),
});

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await resetPasswordAPI(token, data.password);
      toast.success('Password reset successful! Please log in with your new password.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password reset link has expired or is invalid');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full card p-8 space-y-6 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-36 h-36 bg-primary-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="text-center">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white">Create New Password 🔒</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
            Enter your new password below to secure and access your account.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* New Password */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              New Password
            </label>
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

          {/* Confirm New Password */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Confirm New Password
            </label>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className={`input-field pl-9 pr-9 ${errors.confirmPassword ? 'input-error' : ''}`}
                {...register('confirmPassword')}
              />
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-red-500 mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 text-base justify-center mt-6"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              'Reset Password'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
