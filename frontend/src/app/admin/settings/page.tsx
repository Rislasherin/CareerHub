"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Settings, ShieldAlert, Mail, Users, Building2, GraduationCap, Save, Loader2 } from "lucide-react";
import { superAdminService } from "@/services/super-admin/super-admin.service";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

export default function PlatformSettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState({
    maintenanceMode: false,
    maintenanceMessage: "",
    collegeRegistration: true,
    companyRegistration: true,
    studentRegistration: true,
    requireApproval: true,
    contactEmail: "support@careerhub.com",
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const data = await superAdminService.getPlatformSettings();
      if (data) {
        setSettings(data);
      }
    } catch (error) {
      toast.error("Failed to load platform settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await superAdminService.updatePlatformSettings(settings);
      toast.success("Platform settings updated successfully!");
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  // Custom Toggle Component for a premium look
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

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0a0a0a]">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[#0a0a0a] p-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto space-y-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white flex items-center gap-3">
              <Settings className="text-blue-500" size={36} />
              Platform Settings
            </h1>
            <p className="text-gray-400 mt-2">Manage global configurations and access controls</p>
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>

        {/* Danger Zone: Maintenance */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
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
            checked={settings.maintenanceMode}
            onChange={(val: boolean) => setSettings({...settings, maintenanceMode: val})}
          />

          {settings.maintenanceMode && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
              <label className="block text-sm font-medium text-red-400 mb-2">Maintenance Message</label>
              <textarea
                value={settings.maintenanceMessage}
                onChange={(e) => setSettings({...settings, maintenanceMessage: e.target.value})}
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
          transition={{ delay: 0.2 }}
          className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4 backdrop-blur-xl"
        >
          <div className="flex items-center gap-3 text-white mb-6">
            <Users size={28} className="text-blue-500" />
            <h2 className="text-2xl font-bold">Registration Rules</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Toggle label="College Signups" description="Allow new colleges to register" icon={Building2} checked={settings.collegeRegistration} onChange={(val: boolean) => setSettings({...settings, collegeRegistration: val})} />
            <Toggle label="Company Signups" description="Allow new companies to register" icon={Users} checked={settings.companyRegistration} onChange={(val: boolean) => setSettings({...settings, companyRegistration: val})} />
            <Toggle label="Student Signups" description="Allow new students to register" icon={GraduationCap} checked={settings.studentRegistration} onChange={(val: boolean) => setSettings({...settings, studentRegistration: val})} />
            <Toggle label="Require Approval" description="Manual verification required after signup" icon={ShieldAlert} checked={settings.requireApproval} onChange={(val: boolean) => setSettings({...settings, requireApproval: val})} />
          </div>
        </motion.div>

        {/* General Settings */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
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
              value={settings.contactEmail}
              onChange={(e) => setSettings({...settings, contactEmail: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </motion.div>

      </motion.div>
    </div>
    </DashboardLayout>
  );
}
