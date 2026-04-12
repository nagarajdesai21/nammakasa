import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Phone, MapPin, User, AlertCircle, Loader, CheckCircle } from 'lucide-react';
import { isValidEmail, isValidPhone } from '../../utils/helpers';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function SignupPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<'details' | 'verification' | 'approval'>(
    'details'
  );
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    wardNo: '',
    password: '',
    confirmPassword: '',
  });
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [approvalMessage, setApprovalMessage] = useState('');
  const [otpResendSeconds, setOtpResendSeconds] = useState(0);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleResendOTP = async () => {
    if (otpResendSeconds > 0) return; // Prevent multiple resend attempts

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend OTP');
      }

      setOtpResendSeconds(60); // Reset countdown
      setOtp(''); // Clear OTP input
      setError('');

      // Restart countdown timer
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

  const validateDetails = (): boolean => {
    if (
      !formData.name ||
      !formData.email ||
      !formData.phone ||
      !formData.wardNo ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setError('Please fill in all fields');
      return false;
    }

    if (!isValidEmail(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    if (!isValidPhone(formData.phone)) {
      setError('Please enter a valid 10-digit phone number');
      return false;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    return true;
  };

  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateDetails()) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send OTP');
      }

      setCurrentStep('verification');
      setOtpResendSeconds(60); // Start 60 second countdown

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

      setError('');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send OTP. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp) {
      setError('Please enter the OTP');
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
          email: formData.email,
          otp: otp,
        }),
      });

      if (!verifyResponse.ok) {
        const data = await verifyResponse.json();
        throw new Error(data.error || 'Invalid OTP');
      }

      // Step 2: Create user in database
      const signupResponse = await fetch(`${API_URL}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          wardNo: parseInt(formData.wardNo),
          password: formData.password,
          confirmPassword: formData.confirmPassword,
        }),
      });

      const signupData = await signupResponse.json();

      if (!signupResponse.ok) {
        throw new Error(signupData.error || 'Failed to create account');
      }

      // Store token temporarily (if needed for any immediate actions)
      localStorage.setItem('signup_token', signupData.token);

      setCurrentStep('approval');
      setApprovalMessage(
        'Your email has been verified! Your account has been created and is pending admin approval. You will receive an email once it is approved. Then you can login with your credentials.'
      );
      setError('');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to verify OTP. Please try again.';
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
            <p className="text-gray-500 text-sm mt-1">Admin Sign Up</p>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center justify-center space-x-2 mb-8">
            <div
              className={`h-2 w-12 rounded-full transition-colors ${
                currentStep === 'details'
                  ? 'bg-karnataka-primary'
                  : 'bg-gray-300'
              }`}
            ></div>
            <div
              className={`h-2 w-12 rounded-full transition-colors ${
                currentStep === 'verification'
                  ? 'bg-karnataka-primary'
                  : 'bg-gray-300'
              }`}
            ></div>
            <div
              className={`h-2 w-12 rounded-full transition-colors ${
                currentStep === 'approval'
                  ? 'bg-karnataka-primary'
                  : 'bg-gray-300'
              }`}
            ></div>
          </div>

          {/* Details Form */}
          {currentStep === 'details' && (
            <form onSubmit={handleDetailsSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="label">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className="input-field pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="label">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="admin@government.in"
                    className="input-field pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="label">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="9876543210"
                    className="input-field pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Ward */}
              <div>
                <label className="label">Ward Number</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <select
                    name="wardNo"
                    value={formData.wardNo}
                    onChange={handleChange}
                    className="input-field pl-10"
                    disabled={isLoading}
                  >
                    <option value="">Select a ward</option>
                    {Array.from({ length: 197 }, (_, i) => i + 1).map((ward) => (
                      <option key={ward} value={ward}>
                        Ward {ward}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="input-field pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="label">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="input-field pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    <span>Creating account...</span>
                  </>
                ) : (
                  <span>Continue</span>
                )}
              </button>
            </form>
          )}

          {/* OTP Verification */}
          {currentStep === 'verification' && (
            <form onSubmit={handleOtpSubmit} className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-gray-700">
                  We've sent a verification code to <strong>{formData.email}</strong>
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
                    <span>Verifying...</span>
                  </>
                ) : (
                  <span>Verify OTP</span>
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

          {/* Approval Status */}
          {currentStep === 'approval' && (
            <div className="space-y-6">
              <div className="flex flex-col items-center space-y-4">
                <div className="bg-green-100 p-4 rounded-full">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 text-center">
                  Pending Approval
                </h3>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-gray-700">{approvalMessage}</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <p className="text-xs text-gray-600">Your Account Details:</p>
                <div className="text-sm space-y-1">
                  <p>
                    <strong>Name:</strong> {formData.name}
                  </p>
                  <p>
                    <strong>Ward:</strong> {formData.wardNo}
                  </p>
                  <p>
                    <strong>Email:</strong> {formData.email}
                  </p>
                </div>
              </div>

              <Link
                to="/login"
                className="w-full block text-center btn-primary"
              >
                Go to Login
              </Link>
            </div>
          )}

          {/* Login Link */}
          <div className="text-center mt-6">
            <p className="text-gray-600 text-sm">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-karnataka-primary font-semibold hover:underline"
              >
                Login here
              </Link>
            </p>
          </div>
        </div>

        {/* Footer Note */}
        <p className="text-center text-white text-xs mt-8 opacity-75">
          Government of Karnataka | Bengaluru Bruhat Mahanagara Palike
        </p>
      </div>
    </div>
  );
}
