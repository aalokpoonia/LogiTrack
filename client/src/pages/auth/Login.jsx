/**
 * pages/auth/Login.jsx
 *
 * Login page — the entry point for all users.
 *
 * DESIGN: Dark glassmorphism card, animated ambient orbs, Inter typography.
 * Comparable to Linear, Vercel, or Stripe Dashboard login screens.
 *
 * FORM HANDLING with React Hook Form:
 * - register: binds input to form state
 * - handleSubmit: wraps submission with validation
 * - formState.errors: real-time validation errors
 * - isSubmitting: disables button during async submit
 *
 * WHY REACT HOOK FORM OVER useState?
 * For controlled inputs with useState, every keystroke re-renders the component.
 * React Hook Form uses uncontrolled inputs (refs internally), so zero re-renders
 * while typing. For large forms, this is a significant performance win.
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Zap, AlertCircle, Loader2 } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import { ROUTES } from '../../constants/routes';
import AuthLayout from '../../layouts/AuthLayout';

const Login = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [serverError, setServerError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Where to redirect after login — respect the 'from' saved by PrivateRoute
    const from = location.state?.from?.pathname || ROUTES.DASHBOARD;

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm({
        defaultValues: { email: '', password: '' },
    });

    const onSubmit = async ({ email, password }) => {
        try {
            setServerError('');
            await login(email, password);
            navigate(from, { replace: true });
        } catch (error) {
            const message =
                error?.response?.data?.message || 'Login failed. Please try again.';
            setServerError(message);
        }
    };

    return (
        <AuthLayout>
            {/* Glassmorphism Card */}
            <div className="glass-card p-8">

                {/* Logo & Header */}
                <div className="text-center mb-8">
                    <motion.div
                        className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
                        style={{ background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)' }}
                        whileHover={{ scale: 1.05, rotate: 5 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                    >
                        <Zap className="w-7 h-7 text-white" />
                    </motion.div>

                    <h1 className="text-2xl font-bold text-white mb-1">
                        Welcome to <span className="text-gradient">LogiTrack AI</span>
                    </h1>
                    <p className="text-sm text-slate-400">
                        AI-Powered Freight Brokerage Platform
                    </p>
                </div>

                {/* Server Error Alert */}
                {serverError && (
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-start gap-3 p-3.5 rounded-lg mb-5"
                        style={{
                            background: 'rgba(244, 63, 94, 0.1)',
                            border: '1px solid rgba(244, 63, 94, 0.3)',
                        }}
                    >
                        <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-rose-300">{serverError}</p>
                    </motion.div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>

                    {/* Email Field */}
                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium text-slate-300 mb-1.5"
                        >
                            Email Address
                        </label>
                        <input
                            id="email"
                            type="email"
                            autoComplete="email"
                            className="input-dark"
                            placeholder="admin@logitrack.com"
                            style={errors.email ? { borderColor: 'rgba(244, 63, 94, 0.6)' } : {}}
                            {...register('email', {
                                required: 'Email is required',
                                pattern: {
                                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                    message: 'Please enter a valid email address',
                                },
                            })}
                        />
                        {errors.email && (
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="mt-1.5 text-xs text-rose-400 flex items-center gap-1"
                            >
                                <AlertCircle className="w-3 h-3" />
                                {errors.email.message}
                            </motion.p>
                        )}
                    </div>

                    {/* Password Field */}
                    <div>
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium text-slate-300 mb-1.5"
                        >
                            Password
                        </label>
                        <div className="relative">
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                autoComplete="current-password"
                                className="input-dark pr-11"
                                placeholder="Enter your password"
                                style={errors.password ? { borderColor: 'rgba(244, 63, 94, 0.6)' } : {}}
                                {...register('password', {
                                    required: 'Password is required',
                                })}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                        {errors.password && (
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="mt-1.5 text-xs text-rose-400 flex items-center gap-1"
                            >
                                <AlertCircle className="w-3 h-3" />
                                {errors.password.message}
                            </motion.p>
                        )}
                    </div>

                    {/* Submit Button */}
                    <motion.button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3 px-4 rounded-lg text-sm font-semibold text-white transition-all duration-200 relative overflow-hidden mt-2"
                        style={{
                            background: isSubmitting
                                ? 'rgba(59, 130, 246, 0.5)'
                                : 'linear-gradient(135deg, #1d4ed8, #3b82f6)',
                            cursor: isSubmitting ? 'not-allowed' : 'pointer',
                        }}
                        whileHover={!isSubmitting ? { scale: 1.01 } : {}}
                        whileTap={!isSubmitting ? { scale: 0.99 } : {}}
                    >
                        {isSubmitting ? (
                            <span className="flex items-center justify-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Signing In...
                            </span>
                        ) : (
                            'Sign In to LogiTrack'
                        )}
                    </motion.button>
                </form>

                {/* Demo Credentials */}
                <div
                    className="mt-6 p-3.5 rounded-lg"
                    style={{ background: 'rgba(59, 130, 246, 0.07)', border: '1px solid rgba(59, 130, 246, 0.15)' }}
                >
                    <p className="text-xs font-semibold text-blue-400 mb-2 uppercase tracking-wider">
                        Default Admin Credentials
                    </p>
                    <p className="text-xs text-slate-400">
                        Email: <span className="text-slate-200 font-mono">admin@logitrack.com</span>
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                        Password: <span className="text-slate-200 font-mono">Admin@1234</span>
                    </p>
                    <p className="text-xs text-amber-500 mt-2">
                        ⚠️ Run the seed script first: <span className="font-mono">node scripts/seedAdmin.js</span>
                    </p>
                </div>

                {/* Footer */}
                <p className="text-center text-xs text-slate-600 mt-6">
                    © 2026 LogiTrack Systems. All rights reserved.
                </p>
            </div>
        </AuthLayout>
    );
};

export default Login;
