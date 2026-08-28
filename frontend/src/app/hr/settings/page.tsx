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
  Users,
  Briefcase,
  Eye,
  EyeOff
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  getHRProfile, 
  updateHRProfile, 
  changeHRPassword, 
  requestHREmailChange, 
  verifyHREmailChange, 
  getCompanyProfile, 
  updateCompanyProfile 
} from '@/services/hr/settings.service';
import { useAppDispatch } from '@/redux/hooks';
import { setHRDetails } from '@/redux/slices/hrSlice';

export default function HRSettingsPage() {
  const [activeTab, setActiveTab] = useState<'company' | 'account'>('company');
  const dispatch = useAppDispatch();

  // Company State
  const [companyData, setCompanyData] = useState({
    name: '',
    industry: '',
    size: '',
    location: '',
    website: '',
    logoUrl: ''
  });
  const [isEditingCompany, setIsEditingCompany] = useState(false);
  const [isSavingCompany, setIsSavingCompany] = useState(false);
  const [isLoadingCompany, setIsLoadingCompany] = useState(true);

  // Account State
  const [accountData, setAccountData] = useState({
    firstName: '',
    lastName: '',
    designation: '',
    email: ''
  });
  const [isEditingAccount, setIsEditingAccount] = useState(false);
  const [isSavingAccount, setIsSavingAccount] = useState(false);
  const [isLoadingAccount, setIsLoadingAccount] = useState(true);

  // Password State
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Email Change State
  const [emailChangeData, setEmailChangeData] = useState({
    newEmail: '',
    otp: ''
  });
  const [isRequestingEmail, setIsRequestingEmail] = useState(false);
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (showOtpInput && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [showOtpInput, resendTimer]);

  const fetchCompanyData = async () => {
    try {
      setIsLoadingCompany(true);
      const res = await getCompanyProfile();
      if (res) {
        setCompanyData({
          name: res.name || '',
          industry: res.industry || '',
          size: res.size || '',
          location: res.location || res.headquarters || '',
          website: res.website || '',
          logoUrl: res.logoUrl || ''
        });
      }
    } catch (error) {
      toast.error('Failed to load company profile');
    } finally {
      setIsLoadingCompany(false);
    }
  };

  const fetchAccountData = async () => {
    try {
      setIsLoadingAccount(true);
      const res = await getHRProfile();
      if (res) {
        setAccountData({
          firstName: res.firstName || '',
          lastName: res.lastName || '',
          designation: res.designation || '',
          email: res.email || ''
        });
      }
    } catch (error) {
      toast.error('Failed to load account profile');
    } finally {
      setIsLoadingAccount(false);
    }
  };

  useEffect(() => {
    fetchCompanyData();
    fetchAccountData();
  }, []);

  const handleCompanySave = async () => {
    if (!companyData.name) {
      toast.error('Company name is required');
      return;
    }
    
    try {
      setIsSavingCompany(true);
      await updateCompanyProfile(companyData);
      toast.success('Company profile updated successfully');
      setIsEditingCompany(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update company profile');
    } finally {
      setIsSavingCompany(false);
    }
  };

  const handleAccountSave = async () => {
    if (!accountData.firstName || !accountData.lastName) {
      toast.error('First and Last name are required');
      return;
    }
    
    try {
      setIsSavingAccount(true);
      const res = await updateHRProfile({
        firstName: accountData.firstName,
        lastName: accountData.lastName,
        designation: accountData.designation
      });
      // Sync Redux
      if (res) {
        dispatch(setHRDetails(res));
      }
      toast.success('Account details updated successfully');
      setIsEditingAccount(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update account details');
    } finally {
      setIsSavingAccount(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      toast.error('Please fill in all password fields');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    try {
      setIsSavingPassword(true);
      await changeHRPassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      toast.success('Password updated successfully');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update password');
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleRequestEmailChange = async () => {
    if (!emailChangeData.newEmail) {
      toast.error('Please enter a new email address');
      return;
    }

    try {
      setIsRequestingEmail(true);
      await requestHREmailChange({ newEmail: emailChangeData.newEmail });
      setShowOtpInput(true);
      setResendTimer(60);
      toast.success('Verification OTP sent to new email');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to request email change');
    } finally {
      setIsRequestingEmail(false);
    }
  };

  const handleVerifyEmailChange = async () => {
    if (!emailChangeData.otp) {
      toast.error('Please enter the OTP');
      return;
    }

    try {
      setIsVerifyingEmail(true);
      await verifyHREmailChange({ email: emailChangeData.newEmail, otp: emailChangeData.otp });
      toast.success('Email updated successfully');
      setAccountData(prev => ({ ...prev, email: emailChangeData.newEmail }));
      setShowOtpInput(false);
      setEmailChangeData({ newEmail: '', otp: '' });
      // Redux sync
      dispatch(setHRDetails({ ...accountData, email: emailChangeData.newEmail } as any));
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to verify email change');
    } finally {
      setIsVerifyingEmail(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50">
      <DashboardLayout>
        <div className="max-w-6xl mx-auto space-y-8 p-4 lg:p-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Settings</h1>
            <p className="text-slate-500 font-medium">Manage company, team, and account preferences.</p>
          </div>

          <div className="grid lg:grid-cols-12 gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-3">
              <GlassCard className="p-3 border-slate-200 bg-white shadow-sm rounded-2xl flex flex-col gap-1 relative overflow-hidden">
                
                <button
                  onClick={() => setActiveTab('company')}
                  className={`flex items-center gap-3 w-full p-3 rounded-xl font-bold transition-all ${
                    activeTab === 'company' 
                      ? 'bg-indigo-50 text-indigo-600' 
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                  }`}
                >
                  <Building2 size={18} className={activeTab === 'company' ? 'text-indigo-600' : 'text-slate-500'} />
                  Company Profile
                </button>

                <button
                  onClick={() => setActiveTab('account')}
                  className={`flex items-center gap-3 w-full p-3 rounded-xl font-bold transition-all ${
                    activeTab === 'account' 
                      ? 'bg-indigo-50 text-indigo-600' 
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                  }`}
                >
                  <UserCircle size={18} className={activeTab === 'account' ? 'text-indigo-600' : 'text-slate-500'} />
                  My Account
                </button>
              </GlassCard>
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-9">
              {activeTab === 'company' && (
                <GlassCard className="p-8 border-slate-200 bg-white shadow-sm rounded-[2rem]">
                  <div className="flex items-center gap-3 mb-8 pb-6 border-b border-slate-100">
                    <div className="flex-1 flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                        <Building2 size={24} />
                      </div>
                      <div>
                        <h2 className="text-xl font-black text-slate-900">Company Information</h2>
                        <p className="text-slate-500 text-sm">Update your company details and public profile.</p>
                      </div>
                    </div>
                    {!isEditingCompany && (
                      <Button 
                        onClick={() => setIsEditingCompany(true)}
                        variant="outline"
                        className="border-slate-200 text-slate-700 shadow-sm"
                      >
                        Edit Profile
                      </Button>
                    )}
                  </div>

                  {isLoadingCompany ? (
                    <div className="animate-pulse space-y-6">
                      <div className="h-10 bg-slate-100 rounded-xl"></div>
                      <div className="h-10 bg-slate-100 rounded-xl"></div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Company Name *</label>
                          <div className="relative">
                            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <Input
                              placeholder="Enter company name"
                              value={companyData.name}
                              onChange={(e) => setCompanyData({...companyData, name: e.target.value})}
                              disabled={!isEditingCompany}
                              className="pl-11 bg-slate-50 border-slate-200 text-slate-900 focus:bg-white disabled:opacity-70"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Industry</label>
                          <div className="relative">
                            <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <Input
                              placeholder="e.g. Technology, Finance"
                              value={companyData.industry}
                              onChange={(e) => setCompanyData({...companyData, industry: e.target.value})}
                              disabled={!isEditingCompany}
                              className="pl-11 bg-slate-50 border-slate-200 text-slate-900 focus:bg-white disabled:opacity-70"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Company Size</label>
                          <div className="relative">
                            <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <Input
                              placeholder="e.g. 50-200"
                              value={companyData.size}
                              onChange={(e) => setCompanyData({...companyData, size: e.target.value})}
                              disabled={!isEditingCompany}
                              className="pl-11 bg-slate-50 border-slate-200 text-slate-900 focus:bg-white disabled:opacity-70"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Headquarters</label>
                          <div className="relative">
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <Input
                              placeholder="City, Country"
                              value={companyData.location}
                              onChange={(e) => setCompanyData({...companyData, location: e.target.value})}
                              disabled={!isEditingCompany}
                              className="pl-11 bg-slate-50 border-slate-200 text-slate-900 focus:bg-white disabled:opacity-70"
                            />
                          </div>
                        </div>

                        <div className="space-y-2 md:col-span-2">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Website URL</label>
                          <div className="relative">
                            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <Input
                              placeholder="https://example.com"
                              value={companyData.website}
                              onChange={(e) => setCompanyData({...companyData, website: e.target.value})}
                              disabled={!isEditingCompany}
                              className="pl-11 bg-slate-50 border-slate-200 text-slate-900 focus:bg-white disabled:opacity-70"
                            />
                          </div>
                        </div>
                      </div>

                      {isEditingCompany && (
                        <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
                          <Button 
                            onClick={() => setIsEditingCompany(false)} 
                            variant="outline"
                            className="border-slate-200 text-slate-700 shadow-sm"
                          >
                            Cancel
                          </Button>
                          <Button 
                            onClick={handleCompanySave} 
                            isLoading={isSavingCompany}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 shadow-sm"
                          >
                            Save Changes
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </GlassCard>
              )}

              {activeTab === 'account' && (
                <div className="space-y-8">
                  {/* Personal Information */}
                  <GlassCard className="p-8 border-slate-200 bg-white shadow-sm rounded-[2rem]">
                    <div className="flex items-center gap-3 mb-8 pb-6 border-b border-slate-100">
                    <div className="flex-1 flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                        <UserCircle size={24} />
                      </div>
                      <div>
                        <h2 className="text-xl font-black text-slate-900">Personal Information</h2>
                        <p className="text-slate-500 text-sm">Update your personal details and role.</p>
                      </div>
                    </div>
                    {!isEditingAccount && (
                      <Button 
                        onClick={() => setIsEditingAccount(true)}
                        variant="outline"
                        className="border-slate-200 text-slate-700 shadow-sm"
                      >
                        Edit Profile
                      </Button>
                    )}
                  </div>

                  {isLoadingAccount ? (
                      <div className="animate-pulse space-y-6">
                        <div className="h-10 bg-slate-100 rounded-xl"></div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">First Name *</label>
                            <Input
                              value={accountData.firstName}
                              onChange={(e) => setAccountData({...accountData, firstName: e.target.value})}
                              disabled={!isEditingAccount}
                              className="bg-slate-50 border-slate-200 text-slate-900 focus:bg-white disabled:opacity-70"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Last Name *</label>
                            <Input
                              value={accountData.lastName}
                              onChange={(e) => setAccountData({...accountData, lastName: e.target.value})}
                              disabled={!isEditingAccount}
                              className="bg-slate-50 border-slate-200 text-slate-900 focus:bg-white disabled:opacity-70"
                            />
                          </div>
                          <div className="space-y-2 md:col-span-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Designation</label>
                            <div className="relative">
                              <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                              <Input
                                placeholder="e.g. HR Manager"
                                value={accountData.designation}
                                onChange={(e) => setAccountData({...accountData, designation: e.target.value})}
                                disabled={!isEditingAccount}
                                className="pl-11 bg-slate-50 border-slate-200 text-slate-900 focus:bg-white disabled:opacity-70"
                              />
                            </div>
                          </div>
                        </div>

                        {isEditingAccount && (
                          <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
                            <Button 
                              onClick={() => setIsEditingAccount(false)} 
                              variant="outline"
                              className="border-slate-200 text-slate-700 shadow-sm"
                            >
                              Cancel
                            </Button>
                            <Button 
                              onClick={handleAccountSave} 
                              isLoading={isSavingAccount}
                              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 shadow-sm"
                            >
                              Save Changes
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </GlassCard>

                  {/* Email Address */}
                  <GlassCard className="p-8 border-slate-200 bg-white shadow-sm rounded-[2rem]">
                    <div className="flex items-center gap-3 mb-8 pb-6 border-b border-slate-100">
                      <div className="w-12 h-12 rounded-xl bg-sky-50 flex items-center justify-center text-sky-600">
                        <Mail size={24} />
                      </div>
                      <div>
                        <h2 className="text-xl font-black text-slate-900">Email Address</h2>
                        <p className="text-slate-500 text-sm">Update your login email address securely.</p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Current Email</label>
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 font-medium">
                          {accountData.email}
                        </div>
                      </div>

                      {!showOtpInput ? (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">New Email</label>
                            <Input
                              placeholder="Enter new email address"
                              value={emailChangeData.newEmail}
                              onChange={(e) => setEmailChangeData({...emailChangeData, newEmail: e.target.value})}
                              className="bg-slate-50 border-slate-200 text-slate-900 focus:bg-white"
                            />
                          </div>
                          <Button 
                            onClick={handleRequestEmailChange}
                            isLoading={isRequestingEmail}
                            variant="outline"
                            className="border-slate-200 text-slate-700 shadow-sm"
                          >
                            Verify New Email
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4 p-4 rounded-xl bg-sky-50 border border-sky-100">
                          <p className="text-sm font-medium text-sky-700">
                            We've sent a 6-digit OTP to <span className="font-bold text-sky-900">{emailChangeData.newEmail}</span>
                          </p>
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-sky-600 uppercase tracking-wider">Enter OTP</label>
                            <Input
                              placeholder="123456"
                              maxLength={6}
                              value={emailChangeData.otp}
                              onChange={(e) => setEmailChangeData({...emailChangeData, otp: e.target.value})}
                              className="bg-white border-sky-200 text-slate-900 placeholder:text-slate-300 max-w-[200px]"
                            />
                          </div>
                          <div className="flex gap-3">
                            <Button 
                              onClick={handleVerifyEmailChange}
                              isLoading={isVerifyingEmail}
                              className="bg-sky-600 hover:bg-sky-700 text-white shadow-sm"
                            >
                              Confirm Change
                            </Button>
                            <Button 
                              onClick={() => setShowOtpInput(false)}
                              variant="outline"
                              className="border-slate-200 text-slate-700 bg-white shadow-sm"
                            >
                              Cancel
                            </Button>
                          </div>
                          
                          <div className="pt-2 flex items-center justify-between text-sm">
                            <span className="text-slate-500">Didn't receive the code?</span>
                            <button
                              onClick={handleRequestEmailChange}
                              disabled={resendTimer > 0 || isRequestingEmail}
                              className={`font-semibold ${resendTimer > 0 ? 'text-slate-400 cursor-not-allowed' : 'text-sky-600 hover:text-sky-700'}`}
                            >
                              {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </GlassCard>

                  {/* Password Change */}
                  <GlassCard className="p-8 border-slate-200 bg-white shadow-sm rounded-[2rem]">
                    <div className="flex items-center gap-3 mb-8 pb-6 border-b border-slate-100">
                      <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
                        <Lock size={24} />
                      </div>
                      <div>
                        <h2 className="text-xl font-black text-slate-900">Security</h2>
                        <p className="text-slate-500 text-sm">Update your password.</p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Current Password</label>
                        <div className="relative">
                          <Input
                            type={showCurrentPassword ? "text" : "password"}
                            placeholder="Enter current password"
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                            className="bg-slate-50 border-slate-200 text-slate-900 focus:bg-white pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                          >
                            {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">New Password</label>
                          <div className="relative">
                            <Input
                              type={showNewPassword ? "text" : "password"}
                              placeholder="Enter new password"
                              value={passwordData.newPassword}
                              onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                              className="bg-slate-50 border-slate-200 text-slate-900 focus:bg-white pr-10"
                            />
                            <button
                              type="button"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                            >
                              {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Confirm New Password</label>
                          <div className="relative">
                            <Input
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder="Confirm new password"
                              value={passwordData.confirmPassword}
                              onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                              className="bg-slate-50 border-slate-200 text-slate-900 focus:bg-white pr-10"
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                            >
                              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="pt-6 border-t border-slate-100 flex justify-end">
                        <Button 
                          onClick={handlePasswordChange}
                          isLoading={isSavingPassword}
                          variant="outline"
                          className="border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 shadow-sm"
                        >
                          Update Password
                        </Button>
                      </div>
                    </div>
                  </GlassCard>
                </div>
              )}
            </div>
          </div>
        </div>
      </DashboardLayout>
    </div>
  );
}
