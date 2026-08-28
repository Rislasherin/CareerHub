'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { GlassCard } from '@/components/shared/GlassCard';
import { Button } from '@/components/shared/Button';
import { Input } from '@/components/shared/Input';
import { 
  Building2, 
  UserCircle, 
  Mail, 
  Lock,
  Globe,
  MapPin,
  Phone,
  Check,
  X,
  Eye,
  EyeOff
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  getCollegeProfile,
  updateCollegeProfile,
  changeCollegePassword,
  requestCollegeEmailChange,
  verifyCollegeEmailChange
} from '@/services/college/settings.service';

export default function CollegeSettingsPage() {
  const [profileData, setProfileData] = useState({
    name: '',
    organizerName: '',
    email: '',
    phone: '',
    website: '',
    instituteType: 'IIT',
    address: ''
  });
  const [originalEmail, setOriginalEmail] = useState('');
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Email OTP Modal State
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [isRequestingEmail, setIsRequestingEmail] = useState(false);
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // Password State
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const fetchProfile = async () => {
    setIsLoadingProfile(true);
    try {
      const res = await getCollegeProfile();
      if (res.success && res.data) {
        const p = res.data;
        setProfileData({
          name: p.name || '',
          organizerName: p.organizerName || '',
          email: p.email || '',
          phone: p.phone || '',
          website: p.website || '',
          instituteType: p.instituteType || 'IIT',
          address: p.address || ''
        });
        setOriginalEmail(p.email || '');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch college profile');
    } finally {
      setIsLoadingProfile(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileData.name.trim()) {
      toast.error('College/Institute name is required');
      return;
    }
    if (!profileData.organizerName.trim()) {
      toast.error('Organizer name is required');
      return;
    }
    if (!profileData.email.trim()) {
      toast.error('Official email is required');
      return;
    }

    const emailChanged = profileData.email.toLowerCase().trim() !== originalEmail.toLowerCase().trim();

    if (emailChanged) {
      setIsRequestingEmail(true);
      try {
        await requestCollegeEmailChange({ newEmail: profileData.email.toLowerCase().trim() });
        setShowOtpModal(true);
        setResendTimer(60);
        toast.success('Verification code sent to your new email address');
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to request email change');
      } finally {
        setIsRequestingEmail(false);
      }
      return;
    }

    setIsSavingProfile(true);
    try {
      await updateCollegeProfile({
        name: profileData.name,
        organizerName: profileData.organizerName,
        phone: profileData.phone,
        website: profileData.website,
        instituteType: profileData.instituteType,
        address: profileData.address
      });
      toast.success('Profile updated successfully');
      setOriginalEmail(profileData.email);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleVerifyOtpAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpValue.trim()) {
      toast.error('Please enter the verification code');
      return;
    }

    setIsVerifyingEmail(true);
    try {
      // 1. Verify OTP & update email
      await verifyCollegeEmailChange({
        email: profileData.email.toLowerCase().trim(),
        otp: otpValue.trim()
      });

      // 2. Save profile updates
      await updateCollegeProfile({
        name: profileData.name,
        organizerName: profileData.organizerName,
        phone: profileData.phone,
        website: profileData.website,
        instituteType: profileData.instituteType,
        address: profileData.address
      });

      toast.success('Email verified and profile updated successfully');
      setOriginalEmail(profileData.email);
      setShowOtpModal(false);
      setOtpValue('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Invalid or expired verification code');
    } finally {
      setIsVerifyingEmail(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    try {
      await requestCollegeEmailChange({ newEmail: profileData.email.toLowerCase().trim() });
      setResendTimer(60);
      toast.success('Verification code resent to your new email address');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to resend verification code');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordData.currentPassword) {
      toast.error('Current password is required');
      return;
    }
    if (!passwordData.newPassword) {
      toast.error('New password is required');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New password and confirm password do not match');
      return;
    }

    setIsSavingPassword(true);
    try {
      await changeCollegePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      toast.success('Password updated successfully');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update password');
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50">
      <DashboardLayout>
        <div className="max-w-4xl mx-auto space-y-8 p-4 lg:p-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Settings</h1>
            <p className="text-slate-500 font-medium">Manage college profile and account credentials.</p>
          </div>

          {isLoadingProfile ? (
            <div className="space-y-6">
              <div className="h-[500px] rounded-3xl bg-white border border-slate-100 p-8 animate-pulse flex flex-col gap-6">
                <div className="h-6 w-48 bg-slate-200 rounded" />
                <div className="h-4 w-72 bg-slate-100 rounded mb-8" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="space-y-2">
                      <div className="h-4 w-32 bg-slate-200 rounded" />
                      <div className="h-12 bg-slate-50 rounded-xl border border-slate-100" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* College Profile Form */}
              <GlassCard className="p-8 border-slate-200 bg-white shadow-sm rounded-[2rem]">
                <div className="flex items-center gap-3 mb-8 pb-6 border-b border-slate-100">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                    <Building2 size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900">College Profile</h2>
                    <p className="text-slate-500 text-sm">Update your institution details and contacts.</p>
                  </div>
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">College / Institute Name</label>
                      <div className="relative">
                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <Input
                          placeholder="e.g. Indian Institute of Technology Bombay"
                          value={profileData.name}
                          onChange={e => setProfileData({ ...profileData, name: e.target.value })}
                          className="pl-11 bg-slate-50 border-slate-200 text-slate-900 focus:bg-white"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Organizer Name</label>
                      <div className="relative">
                        <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <Input
                          placeholder="e.g. Prof. Prakash Kumar"
                          value={profileData.organizerName}
                          onChange={e => setProfileData({ ...profileData, organizerName: e.target.value })}
                          className="pl-11 bg-slate-50 border-slate-200 text-slate-900 focus:bg-white"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Official Email</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <Input
                          placeholder="e.g. organizer@iitb.ac.in"
                          type="email"
                          value={profileData.email}
                          onChange={e => setProfileData({ ...profileData, email: e.target.value })}
                          className="pl-11 bg-slate-50 border-slate-200 text-slate-900 focus:bg-white"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Phone</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <Input
                          placeholder="e.g. +91 22 2572 2500"
                          value={profileData.phone}
                          onChange={e => setProfileData({ ...profileData, phone: e.target.value })}
                          className="pl-11 bg-slate-50 border-slate-200 text-slate-900 focus:bg-white"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Website</label>
                      <div className="relative">
                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <Input
                          placeholder="e.g. https://www.iitb.ac.in"
                          value={profileData.website}
                          onChange={e => setProfileData({ ...profileData, website: e.target.value })}
                          className="pl-11 bg-slate-50 border-slate-200 text-slate-900 focus:bg-white"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Institute Type</label>
                      <select
                        value={profileData.instituteType}
                        onChange={e => setProfileData({ ...profileData, instituteType: e.target.value })}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200"
                      >
                        <option value="IIT">IIT</option>
                        <option value="NIT">NIT</option>
                        <option value="IIIT">IIIT</option>
                        <option value="State University">State University</option>
                        <option value="Private University">Private University</option>
                        <option value="Central University">Central University</option>
                        <option value="Others">Others</option>
                      </select>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Address</label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-4 text-slate-400" size={18} />
                        <textarea
                          placeholder="e.g. IIT Bombay, Powai, Mumbai - 400076, Maharashtra"
                          value={profileData.address}
                          onChange={e => setProfileData({ ...profileData, address: e.target.value })}
                          rows={3}
                          className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-100 flex justify-end">
                    <Button
                      type="submit"
                      isLoading={isSavingProfile || isRequestingEmail}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 shadow-sm rounded-xl"
                    >
                      Save Profile
                    </Button>
                  </div>
                </form>
              </GlassCard>

              {/* Change Password Form */}
              <GlassCard className="p-8 border-slate-200 bg-white shadow-sm rounded-[2rem]">
                <div className="flex items-center gap-3 mb-8 pb-6 border-b border-slate-100">
                  <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
                    <Lock size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900">Change Password</h2>
                    <p className="text-slate-500 text-sm">Update your account credentials securely.</p>
                  </div>
                </div>

                <form onSubmit={handleChangePassword} className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Current Password</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <Input
                          placeholder="••••••••"
                          type={showCurrentPass ? 'text' : 'password'}
                          value={passwordData.currentPassword}
                          onChange={e => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                          className="pl-11 pr-10 bg-slate-50 border-slate-200 text-slate-900 focus:bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPass(!showCurrentPass)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showCurrentPass ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">New Password</label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                          <Input
                            placeholder="••••••••"
                            type={showNewPass ? 'text' : 'password'}
                            value={passwordData.newPassword}
                            onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                            className="pl-11 pr-10 bg-slate-50 border-slate-200 text-slate-900 focus:bg-white"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPass(!showNewPass)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          >
                            {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Confirm Password</label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                          <Input
                            placeholder="••••••••"
                            type={showConfirmPass ? 'text' : 'password'}
                            value={passwordData.confirmPassword}
                            onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                            className="pl-11 pr-10 bg-slate-50 border-slate-200 text-slate-900 focus:bg-white"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPass(!showConfirmPass)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          >
                            {showConfirmPass ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-100 flex justify-end">
                    <Button
                      type="submit"
                      isLoading={isSavingPassword}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 shadow-sm rounded-xl"
                    >
                      Update Password
                    </Button>
                  </div>
                </form>
              </GlassCard>
            </div>
          )}
        </div>
      </DashboardLayout>

      {/* Email Verification OTP Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-200 rounded-[2rem] max-w-md w-full p-8 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowOtpModal(false)}
              className="absolute right-6 top-6 p-2 rounded-xl text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all"
            >
              <X size={20} />
            </button>

            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2 shadow-sm">
                <Mail size={32} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Verify Email Address</h3>
              <p className="text-slate-500 font-medium text-sm">
                We have sent a 6-digit OTP code to verify your new email address: <br />
                <span className="font-bold text-slate-900">{profileData.email}</span>
              </p>
            </div>

            <form onSubmit={handleVerifyOtpAndSave} className="mt-8 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Verification Code</label>
                <Input
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  value={otpValue}
                  onChange={e => setOtpValue(e.target.value.replace(/\D/g, ''))}
                  className="bg-slate-50 border-slate-200 text-slate-900 focus:bg-white text-center text-xl tracking-[0.5em] font-mono h-14"
                />
              </div>

              <div className="flex flex-col gap-3">
                <Button
                  type="submit"
                  isLoading={isVerifyingEmail}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-12 rounded-xl shadow-md shadow-emerald-600/10"
                >
                  Verify & Save Changes
                </Button>
                
                <div className="flex items-center justify-between text-xs font-bold text-slate-400 px-1 pt-2">
                  <span>Didn't receive the code?</span>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendTimer > 0}
                    className={`transition-colors uppercase tracking-wider ${
                      resendTimer > 0 
                        ? 'text-slate-300 cursor-not-allowed' 
                        : 'text-emerald-600 hover:text-emerald-700'
                    }`}
                  >
                    {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
