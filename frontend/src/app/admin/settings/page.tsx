'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, ShieldAlert, Mail, Users, Building2, Save, Loader2, KeyRound, UserRound, Eye, EyeOff
} from 'lucide-react';
import { superAdminService } from '@/services/super-admin/super-admin.service';
import { toast } from 'sonner';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { GlassCard } from '@/components/shared/GlassCard';

// Reusable Custom Toggle Component for Platform Settings
const Toggle = ({ label, icon: Icon, description, checked, onChange }: any) => (
  <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md hover:bg-white/10 transition-all duration-300">
    <div className="flex items-center gap-4">
      <div className={`p-3 rounded-xl ${checked ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-500/20 text-gray-400'}`}>
        <Icon size={24} />
      </div>
      <div>
        <h3 className="font-semibold text-white">{label}</h3>
        <p className="text-sm text-gray-400">{description}</p>
      </div>
    </div>
    <button
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none ${checked ? 'bg-blue-500' : 'bg-gray-600'}`}
    >
      <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-300 ${checked ? 'translate-x-8' : 'translate-x-1'}`} />
    </button>
  </div>
);

export default function UnifiedSettingsPage() {
  const [activeTab, setActiveTab] = useState<'account' | 'platform'>('account');
  const [isLoading, setIsLoading] = useState(true);

  // Profile Form State
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: ''
  });
  const [initialProfile, setInitialProfile] = useState<any>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Email Verification OTP State
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [newEmailPending, setNewEmailPending] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  // Security Form State
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Platform Settings State
  const [platformSettings, setPlatformSettings] = useState({
    maintenanceMode: false,
    maintenanceMessage: '',
    collegeRegistration: true,
    companyRegistration: true,
    requireApproval: true,
    contactEmail: '',
  });
  const [isSavingPlatform, setIsSavingPlatform] = useState(false);

  // Fetch all settings and profile information
  const fetchData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch Profile
      const profileRes = await superAdminService.getProfile();
      if (profileRes?.data) {
        setProfile({
          firstName: profileRes.data.firstName || '',
          lastName: profileRes.data.lastName || '',
          email: profileRes.data.email || '',
          role: profileRes.data.role || 'SUPER_ADMIN'
        });
        setInitialProfile(profileRes.data);
      }

      // 2. Fetch Platform Settings
      const settingsData = await superAdminService.getPlatformSettings();
      if (settingsData) {
        setPlatformSettings(settingsData);
      }
    } catch (error) {
      toast.error('Failed to load settings data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Save Profile Handler
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile.firstName || !profile.lastName) {
      toast.error('First and Last names are required');
      return;
    }

    setIsSavingProfile(true);
    try {
      let isEmailChanged = false;
      const targetEmail = profile.email.toLowerCase().trim();

      // Check if profile fields changed
      if (profile.firstName !== initialProfile.firstName || profile.lastName !== initialProfile.lastName) {
        await superAdminService.updateProfile({
          firstName: profile.firstName,
          lastName: profile.lastName
        });
        toast.success('Profile information updated');
      }

      // Check if email field changed
      if (targetEmail !== initialProfile.email.toLowerCase().trim()) {
        isEmailChanged = true;
        await superAdminService.requestEmailChange({ newEmail: targetEmail });
        setNewEmailPending(targetEmail);
        setShowOtpModal(true);
        toast.success('Verification code sent to ' + targetEmail);
      }

      if (!isEmailChanged) {
        // Refresh local details
        const profileRes = await superAdminService.getProfile();
        if (profileRes?.data) {
          setProfile({
            firstName: profileRes.data.firstName || '',
            lastName: profileRes.data.lastName || '',
            email: profileRes.data.email || '',
            role: profileRes.data.role || 'SUPER_ADMIN'
          });
          setInitialProfile(profileRes.data);
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save changes');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Verify OTP Handler
  const handleVerifyOtp = async () => {
    if (!otpCode) {
      toast.error('Please enter the OTP verification code');
      return;
    }
    setIsVerifyingOtp(true);
    try {
      await superAdminService.verifyEmailChange({
        email: newEmailPending,
        otp: otpCode
      });
      toast.success('Email address updated successfully');
      setShowOtpModal(false);
      setOtpCode('');
      
      // Refresh local profile details
      const profileRes = await superAdminService.getProfile();
      if (profileRes?.data) {
        setProfile({
          firstName: profileRes.data.firstName || '',
          lastName: profileRes.data.lastName || '',
          email: profileRes.data.email || '',
          role: profileRes.data.role || 'SUPER_ADMIN'
        });
        setInitialProfile(profileRes.data);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Verification failed. Invalid or expired OTP.');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // Update Password Handler
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error('All password fields are required');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      await superAdminService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      toast.success('Security password updated successfully');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Password update failed');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  // Save Platform Settings Handler
  const handleSavePlatformSettings = async () => {
    setIsSavingPlatform(true);
    try {
      await superAdminService.updatePlatformSettings(platformSettings);
      toast.success('Platform settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setIsSavingPlatform(false);
    }
  };

  // User initials avatar helper
  const getInitials = () => {
    const f = profile.firstName.charAt(0).toUpperCase();
    const l = profile.lastName.charAt(0).toUpperCase();
    return f + l;
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0a0a0a]">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[#0a0a0a] p-8 text-white">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto space-y-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-bold flex items-center gap-3">
                <Settings className="text-blue-500 animate-pulse-subtle" size={36} />
                Settings
              </h1>
              <p className="text-gray-400 mt-2">Manage account preferences and platform controls</p>
            </div>
            
            {activeTab === 'platform' && (
              <button
                onClick={handleSavePlatformSettings}
                disabled={isSavingPlatform}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 disabled:opacity-50"
              >
                {isSavingPlatform ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                {isSavingPlatform ? 'Saving...' : 'Save Settings'}
              </button>
            )}
          </div>

          {/* Navigation Tabs */}
          <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/5 max-w-md">
            <button
              onClick={() => setActiveTab('account')}
              className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${
                activeTab === 'account' 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserRound size={16} /> Personal Account
            </button>
            <button
              onClick={() => setActiveTab('platform')}
              className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${
                activeTab === 'platform' 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Settings size={16} /> Platform Settings
            </button>
          </div>

          {/* Tab Content rendering */}
          {activeTab === 'account' ? (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              
              {/* Profile Information Panel */}
              <GlassCard className="lg:col-span-3 p-8 border-white/5 bg-[#0E101A] rounded-[2rem] space-y-6">
                <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                  <UserRound className="text-blue-500" size={24} />
                  <h2 className="text-xl font-bold">Profile Information</h2>
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-6">
                  <div className="flex flex-col md:flex-row items-center gap-6 mb-6 bg-white/[0.02] p-6 rounded-2xl border border-white/5">
                    <div className="w-24 h-24 rounded-full bg-blue-600/20 border-2 border-blue-500/30 flex items-center justify-center text-3xl font-black text-blue-400">
                      {getInitials()}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">
                        {profile.firstName} {profile.lastName}
                      </h3>
                      <span className="inline-block mt-1 px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest rounded-md">
                        {profile.role.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">First Name</label>
                      <input
                        type="text"
                        value={profile.firstName}
                        onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                        className="w-full bg-[#121520] border border-white/5 rounded-xl p-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">Last Name</label>
                      <input
                        type="text"
                        value={profile.lastName}
                        onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                        className="w-full bg-[#121520] border border-white/5 rounded-xl p-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">Email Address</label>
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      className="w-full bg-[#121520] border border-white/5 rounded-xl p-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
                      required
                    />
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      type="submit"
                      disabled={isSavingProfile}
                      className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm px-6 py-3 rounded-xl transition-all duration-300 disabled:opacity-50"
                    >
                      {isSavingProfile ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </GlassCard>

              {/* Security Panel */}
              <GlassCard className="lg:col-span-2 p-8 border-white/5 bg-[#0E101A] rounded-[2rem] space-y-6">
                <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                  <KeyRound className="text-blue-500" size={24} />
                  <h2 className="text-xl font-bold">Security</h2>
                </div>

                <form onSubmit={handleUpdatePassword} className="space-y-6">
                  <div className="relative">
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">Current Password</label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        className="w-full bg-[#121520] border border-white/5 rounded-xl p-4 pr-12 text-white focus:outline-none focus:border-blue-500 transition-colors"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute inset-y-0 right-4 flex items-center text-gray-500 hover:text-white"
                      >
                        {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="relative">
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">New Password</label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        className="w-full bg-[#121520] border border-white/5 rounded-xl p-4 pr-12 text-white focus:outline-none focus:border-blue-500 transition-colors"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute inset-y-0 right-4 flex items-center text-gray-500 hover:text-white"
                      >
                        {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="relative">
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">Confirm New Password</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        className="w-full bg-[#121520] border border-white/5 rounded-xl p-4 pr-12 text-white focus:outline-none focus:border-blue-500 transition-colors"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-4 flex items-center text-gray-500 hover:text-white"
                      >
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="pt-4 flex">
                    <button
                      type="submit"
                      disabled={isUpdatingPassword}
                      className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm py-3 rounded-xl transition-all duration-300 disabled:opacity-50"
                    >
                      {isUpdatingPassword ? 'Updating...' : 'Update Password'}
                    </button>
                  </div>
                </form>
              </GlassCard>

            </div>
          ) : (
            // Platform Settings Panel (reused exactly from old component)
            <div className="space-y-8">
              {/* Danger Zone: Maintenance */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-500/5 border border-red-500/20 rounded-3xl p-6 space-y-6"
              >
                <div className="flex items-center gap-3 text-red-400">
                  <ShieldAlert size={28} />
                  <h2 className="text-2xl font-bold">System Status</h2>
                </div>
                
                <Toggle 
                  label="Maintenance Mode" 
                  description="Locks out all users except Super Admins. Shows maintenance page."
                  icon={ShieldAlert}
                  checked={platformSettings.maintenanceMode}
                  onChange={(val: boolean) => setPlatformSettings({...platformSettings, maintenanceMode: val})}
                />

                {platformSettings.maintenanceMode && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                    <label className="block text-sm font-medium text-red-400 mb-2">Maintenance Message</label>
                    <textarea
                      value={platformSettings.maintenanceMessage}
                      onChange={(e) => setPlatformSettings({...platformSettings, maintenanceMessage: e.target.value})}
                      className="w-full bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-white focus:outline-none focus:border-red-500 transition-colors"
                      rows={3}
                    />
                  </motion.div>
                )}
              </motion.div>

              {/* Registration Controls */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4 backdrop-blur-xl"
              >
                <div className="flex items-center gap-3 text-white mb-6">
                  <Users size={28} className="text-blue-500" />
                  <h2 className="text-2xl font-bold">Registration Rules</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Toggle label="College Signups" description="Allow new colleges to register" icon={Building2} checked={platformSettings.collegeRegistration} onChange={(val: boolean) => setPlatformSettings({...platformSettings, collegeRegistration: val})} />
                  <Toggle label="Company Signups" description="Allow new companies to register" icon={Users} checked={platformSettings.companyRegistration} onChange={(val: boolean) => setPlatformSettings({...platformSettings, companyRegistration: val})} />
                  <Toggle label="Require Approval" description="Manual verification required after signup" icon={ShieldAlert} checked={platformSettings.requireApproval} onChange={(val: boolean) => setPlatformSettings({...platformSettings, requireApproval: val})} />
                </div>
              </motion.div>

              {/* General Settings */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl"
              >
                <div className="flex items-center gap-3 text-white mb-6">
                  <Mail size={28} className="text-blue-500" />
                  <h2 className="text-2xl font-bold">General Information</h2>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Global Support Email</label>
                  <input
                    type="email"
                    value={platformSettings.contactEmail}
                    onChange={(e) => setPlatformSettings({...platformSettings, contactEmail: e.target.value})}
                    className="w-full bg-[#121520] border border-white/5 rounded-xl p-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </motion.div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Verification OTP Modal */}
      <AnimatePresence>
        {showOtpModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#0E101A] border border-white/10 rounded-[2rem] p-8 max-w-md w-full shadow-2xl space-y-6"
            >
              <div className="text-center space-y-2">
                <div className="mx-auto w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <Mail size={24} />
                </div>
                <h2 className="text-xl font-bold text-white">Verify Your New Email</h2>
                <p className="text-sm text-slate-400">
                  We've sent a 6-digit verification code to <span className="text-blue-400 font-semibold">{newEmailPending}</span>. Please enter it below.
                </p>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2 text-center">Verification Code (OTP)</label>
                <input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="------"
                  className="w-full bg-[#121520] border border-white/10 rounded-xl p-4 text-white text-center font-mono text-2xl tracking-[0.5em] focus:outline-none focus:border-blue-500 transition-colors"
                  required
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setShowOtpModal(false);
                    setOtpCode('');
                    // Revert local email value to original
                    setProfile({ ...profile, email: initialProfile.email });
                  }}
                  className="flex-1 bg-white/5 hover:bg-white/10 border border-white/5 text-slate-300 font-bold text-sm py-3 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleVerifyOtp}
                  disabled={isVerifyingOtp}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm py-3 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isVerifyingOtp ? <Loader2 className="animate-spin" size={16} /> : null}
                  Verify
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
