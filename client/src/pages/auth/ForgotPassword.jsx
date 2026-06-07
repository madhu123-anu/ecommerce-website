import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { FiMail, FiArrowLeft } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { forgotPasswordAPI } from '../../api/authAPI';

const schema = yup.object({
  email: yup.string().required('Email is required').email('Invalid email address'),
});

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

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
      await forgotPasswordAPI(data.email);
      setSubmitted(true);
      toast.success('Reset email sent! Check your inbox ✉️');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full card p-8 space-y-6 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-36 h-36 bg-primary-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex justify-start">
          <Link
            to="/login"
            className="flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors"
          >
            <FiArrowLeft size={14} /> Back to Sign In
          </Link>
        </div>

        {submitted ? (
          <div className="text-center space-y-4">
            <div className="text-5xl">✉️</div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">Check Your Email</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              We have sent password reset instructions to your email address if it is registered in our database.
            </p>
          </div>
        ) : (
          <>
            <div className="text-center">
              <h2 className="text-3xl font-black text-slate-900 dark:text-white">Reset Password 🔑</h2>
              <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
                Enter your email address and we will send you instructions to reset your password.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3 text-base justify-center mt-6"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
