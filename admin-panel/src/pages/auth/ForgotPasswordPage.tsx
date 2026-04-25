import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, AlertCircle, Loader, CheckCircle, ArrowLeft } from 'lucide-react';
import { isValidEmail } from '../../utils/helpers';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<'email' | 'otp' | 'reset' | 'success'>(
    'email'
  );
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [otpResendSeconds, setOtpResendSeconds] = useState(0);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    if (!isValidEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send OTP');
      }

      setCurrentStep('otp');
      setOtpResendSeconds(60);
      setError('');

      // Countdown timer for resend
      const interval = setInterval(() => {
        setOtpResendSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send OTP. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (otpResendSeconds > 0) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend OTP');
      }

      setOtpResendSeconds(60);
      setOtp('');
      setError('');

      const interval = setInterval(() => {
        setOtpResendSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to resend OTP';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTPAndResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!otp) {
      setError('Please enter the OTP');
      return;
    }

    if (!newPassword) {
      setError('Please enter a new password');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      // Step 1: Verify OTP
      const verifyResponse = await fetch(`${API_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          otp,
        }),
      });

      if (!verifyResponse.ok) {
        const data = await verifyResponse.json();
        throw new Error(data.error || 'Invalid OTP');
      }

      // Step 2: Reset password
      const resetResponse = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          newPassword,
          confirmPassword,
        }),
      });

      const resetData = await resetResponse.json();

      if (!resetResponse.ok) {
        throw new Error(resetData.error || 'Failed to reset password');
      }

      setCurrentStep('success');
      setError('');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reset password. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-karnataka-primary via-orange-500 to-karnataka-accent flex items-center justify-center px-4 py-8">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full mix-blend-multiply filter blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full mix-blend-multiply filter blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex bg-gradient-to-br from-karnataka-primary to-orange-600 p-3 rounded-xl mb-4">
              <div className="text-white text-2xl">🗑️</div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Nammakasa</h1>
            <p className="text-gray-500 text-sm mt-1">Reset Password</p>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center justify-center space-x-2 mb-8">
            <div
              className={`h-2 w-12 rounded-full transition-colors ${
                currentStep === 'email' || currentStep === 'otp' || currentStep === 'reset' || currentStep === 'success'
                  ? 'bg-karnataka-primary'
                  : 'bg-gray-300'
              }`}
            ></div>
            <div
              className={`h-2 w-12 rounded-full transition-colors ${
                currentStep === 'otp' || currentStep === 'reset' || currentStep === 'success'
                  ? 'bg-karnataka-primary'
                  : 'bg-gray-300'
              }`}
            ></div>
            <div
              className={`h-2 w-12 rounded-full transition-colors ${
                currentStep === 'reset' || currentStep === 'success'
                  ? 'bg-karnataka-primary'
                  : 'bg-gray-300'
              }`}
            ></div>
          </div>

          {/* Email Step */}
          {currentStep === 'email' && (
            <form onSubmit={handleSendOTP} className="space-y-5">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-gray-700">
                  Enter your email address and we'll send you an OTP to reset your password.
                </p>
              </div>

              <div>
                <label className="label">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError('');
                    }}
                    placeholder="admin@government.in"
                    className="input-field pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    <span>Sending OTP...</span>
                  </>
                ) : (
                  <span>Send OTP</span>
                )}
              </button>
            </form>
          )}

          {/* OTP + Password Reset Step */}
          {currentStep === 'otp' && (
            <form onSubmit={handleVerifyOTPAndResetPassword} className="space-y-5">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-gray-700">
                  We've sent a verification code to <strong>{email}</strong>
                </p>
              </div>

              <div>
                <label className="label">Enter OTP</label>
                <input
                  type="text"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value);
                    setError('');
                  }}
                  maxLength={6}
                  className="input-field text-center text-2xl tracking-widest"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="label">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setError('');
                    }}
                    placeholder="••••••••"
                    className="input-field pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <label className="label">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setError('');
                    }}
                    placeholder="••••••••"
                    className="input-field pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    <span>Resetting password...</span>
                  </>
                ) : (
                  <span>Reset Password</span>
                )}
              </button>

              <button
                type="button"
                onClick={handleResendOTP}
                disabled={otpResendSeconds > 0 || isLoading}
                className="w-full text-karnataka-primary text-sm font-semibold hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {otpResendSeconds > 0
                  ? `Resend OTP in ${otpResendSeconds}s`
                  : "Didn't receive OTP? Resend"}
              </button>
            </form>
          )}

          {/* Success Step */}
          {currentStep === 'success' && (
            <div className="space-y-6">
              <div className="flex flex-col items-center space-y-4">
                <div className="bg-green-100 p-4 rounded-full">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 text-center">
                  Password Reset Successful
                </h3>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-gray-700">
                  Your password has been successfully reset. You can now login with your new password.
                </p>
              </div>

              <button
                onClick={() => navigate('/login')}
                className="w-full btn-primary flex items-center justify-center space-x-2"
              >
                <span>Go to Login</span>
              </button>
            </div>
          )}

          {/* Back to Login Link */}
          {currentStep !== 'success' && (
            <div className="text-center mt-6">
              <Link to="/login" className="inline-flex items-center space-x-2 text-karnataka-primary text-sm font-semibold hover:underline">
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Login</span>
              </Link>
            </div>
          )}
        </div>

        {/* Footer Note */}
        <p className="text-center text-white text-xs mt-8 opacity-75">
          Government of Karnataka | Bengaluru Bruhat Mahanagara Palike
        </p>
      </div>
    </div>
  );
}
