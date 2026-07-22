/**
 * pages/settings/Settings.jsx
 *
 * LogiTrack Application Profile Settings panel.
 * Allows logged-in operators to manage profile contacts, passwords, and dashboard configurations.
 */

import { useForm } from 'react-hook-form';
import useAuth from '../../hooks/useAuth';
import { useUpdateProfile } from '../../hooks/useUsers';
import { Settings as SettingsIcon, User, Shield, Mail, Phone, Save, Sparkles } from 'lucide-react';

const Settings = () => {
    const { user, login } = useAuth();
    const updateMutation = useUpdateProfile();

    const { register, handleSubmit } = useForm({
        defaultValues: {
            name: user?.name || '',
            email: user?.email || '',
            phone: user?.phone || '',
        }
    });

    const handleFormSubmit = async (formData) => {
        try {
            const res = await updateMutation.mutateAsync(formData);
            if (res.success && res.data) {
                // Relog / refresh JWT state local state
                login(res.data);
                alert('Profile updated successfully!');
            }
        } catch (error) {
            console.error('Update profile settings failed:', error);
            alert('Failed to update profile settings.');
        }
    };

    return (
        <div className="space-y-6 max-w-2xl">
            {/* Header */}
            <div>
                <h1 className="text-xl font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <SettingsIcon className="w-5 h-5 text-blue-500" />
                    Account Preferences & Settings
                </h1>
                <p className="text-slate-500 text-xs mt-0.5">
                    Configure dispatcher settings, edit profile contacts, and view system credentials.
                </p>
            </div>

            {/* Profile Editing Form */}
            <div className="bg-slate-900 border border-slate-850 rounded-2xl p-6 space-y-6">
                <div>
                    <h3 className="text-white font-bold text-sm flex items-center gap-2">
                        <User className="w-4.5 h-4.5 text-blue-400" />
                        Edit Dispatch Profile
                    </h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">Maintain active employee directory contact entries.</p>
                </div>

                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 text-xs">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Name */}
                        <div>
                            <label className="block text-slate-400 mb-1">Full Employee Name *</label>
                            <input
                                type="text"
                                required
                                {...register('name')}
                                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-slate-400 mb-1">Corporate Email Address *</label>
                            <input
                                type="email"
                                required
                                {...register('email')}
                                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
                            />
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="block text-slate-400 mb-1">Contact Phone Number</label>
                            <input
                                type="text"
                                {...register('phone')}
                                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
                            />
                        </div>

                        {/* Role Designation (Immutable) */}
                        <div>
                            <label className="block text-slate-500 mb-1">Role Designation (System Protected)</label>
                            <div className="bg-slate-950/40 border border-slate-900/60 rounded px-3 py-2 text-slate-500 flex items-center gap-1.5 font-medium select-none">
                                <Shield className="w-3.5 h-3.5" />
                                <span className="uppercase">{user?.role}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-end pt-3 border-t border-slate-900">
                        <button
                            type="submit"
                            disabled={updateMutation.isLoading}
                            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold shadow-lg transition-colors disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" />
                            Save Profile Settings
                        </button>
                    </div>
                </form>
            </div>

            {/* Account meta details */}
            <div className="bg-slate-950/40 border border-slate-900 p-5 rounded-2xl flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-amber-400 flex-shrink-0" />
                <div className="text-xs">
                    <p className="text-slate-400 font-medium">Logged in session status</p>
                    <p className="text-slate-650 text-[10px] mt-0.5 leading-relaxed">
                        Authorized token credentials expire in 15 minutes. Session refresh handles background rotations cleanly.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Settings;
