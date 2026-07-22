/**
 * pages/users/Users.jsx
 *
 * User Accounts & Role-Based Access panel.
 * Admins can register new accounts, modify roles, and toggle active logins.
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useUsers, useRegisterUser, useUpdateUserRole, useToggleUserStatus } from '../../hooks/useUsers';
import {
    Users as UsersIcon, Plus, Shield, ShieldCheck, UserCheck, X,
    Mail, Phone, Clock, Power, ShieldAlert, KeyRound
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import { ROLES } from '../../config/constants';

const ROLE_OPTIONS = [
    { value: ROLES.ADMIN, label: 'Administrator' },
    { value: ROLES.OPERATIONS, label: 'Operations / Dispatcher' },
    { value: ROLES.DRIVER, label: 'Company Driver' }
];

const Users = () => {
    const { user: currentUser } = useAuth();
    const isAdmin = currentUser && currentUser.role === ROLES.ADMIN;

    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const { data: usersData, isLoading, isError } = useUsers();
    const registerMutation = useRegisterUser();
    const roleMutation = useUpdateUserRole();
    const statusMutation = useToggleUserStatus();

    const { register, handleSubmit, reset } = useForm();

    const handleCreateSubmit = async (formData) => {
        try {
            await registerMutation.mutateAsync(formData);
            setIsCreateOpen(false);
            reset();
        } catch (error) {
            console.error('Registration failed:', error);
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            await roleMutation.mutateAsync({ id: userId, role: newRole });
        } catch (error) {
            console.error('Failed to change role:', error);
        }
    };

    const handleToggleStatus = async (userId) => {
        try {
            await statusMutation.mutateAsync(userId);
        } catch (error) {
            console.error('Failed to toggle status:', error);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <UsersIcon className="w-5 h-5 text-blue-500" />
                        User Account Directory
                    </h1>
                    <p className="text-slate-500 text-xs mt-0.5">
                        Manage dispatcher access, driver log credentials, and organizational roles.
                    </p>
                </div>

                {isAdmin && (
                    <button
                        onClick={() => setIsCreateOpen(true)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-lg transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Register User Account
                    </button>
                )}
            </div>

            {/* User List Table */}
            {isLoading ? (
                <div className="flex items-center justify-center py-20 text-slate-500 text-sm">
                    Loading accounts database...
                </div>
            ) : isError ? (
                <div className="flex items-center justify-center py-20 text-rose-500 text-sm">
                    Failed to fetch user directory.
                </div>
            ) : (
                <div className="overflow-x-auto glass-card">
                    <table className="table-dark min-w-[900px] text-xs">
                        <thead>
                            <tr>
                                <th style={{ paddingLeft: '1.25rem' }}>Name / Info</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Role Designation</th>
                                <th>Last Active</th>
                                <th>Status</th>
                                {isAdmin && <th style={{ paddingRight: '1.25rem' }} className="text-right">Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {usersData?.data?.map((u) => {
                                const isSelf = u._id === currentUser?._id;
                                return (
                                    <tr key={u._id}>
                                        {/* User Info */}
                                        <td style={{ paddingLeft: '1.25rem' }} className="py-4 font-semibold text-white">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${isSelf
                                                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                                        : 'bg-slate-800 text-slate-300'
                                                    }`}>
                                                    {u.name?.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <span className="text-xs">{u.name}</span>
                                                    {isSelf && <span className="ml-1.5 badge badge-info">You</span>}
                                                </div>
                                            </div>
                                        </td>

                                        {/* Email */}
                                        <td>
                                            <div className="flex items-center gap-1.5 text-slate-350">
                                                <Mail className="w-3.5 h-3.5 text-slate-650" />
                                                <span>{u.email}</span>
                                            </div>
                                        </td>

                                        {/* Phone */}
                                        <td>
                                            <div className="flex items-center gap-1.5 text-slate-350">
                                                <Phone className="w-3.5 h-3.5 text-slate-650" />
                                                <span>{u.phone || 'N/A'}</span>
                                            </div>
                                        </td>

                                        {/* Role Select */}
                                        <td>
                                            {isAdmin && !isSelf ? (
                                                <select
                                                    value={u.role}
                                                    onChange={(e) => handleRoleChange(u._id, e.target.value)}
                                                    className="bg-slate-950 border border-slate-850 text-slate-300 px-2 py-1 rounded text-xs focus:outline-none focus:border-blue-500 transition-colors"
                                                >
                                                    {ROLE_OPTIONS.map(opt => (
                                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <div className="flex items-center gap-1.5 font-medium text-slate-300">
                                                    <Shield className="w-3.5 h-3.5 text-blue-400" />
                                                    <span>{ROLE_OPTIONS.find(o => o.value === u.role)?.label || u.role}</span>
                                                </div>
                                            )}
                                        </td>

                                        {/* Last Login */}
                                        <td>
                                            <div className="flex items-center gap-1.5 text-slate-500">
                                                <Clock className="w-3.5 h-3.5" />
                                                <span>
                                                    {u.lastLogin
                                                        ? new Date(u.lastLogin).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
                                                        : 'Never logged in'}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Status badge */}
                                        <td>
                                            <span className={`badge ${u.isActive ? 'badge-success' : 'badge-neutral'}`}>
                                                {u.isActive ? 'Active' : 'Suspended'}
                                            </span>
                                        </td>

                                        {/* Actions */}
                                        {isAdmin && (
                                            <td style={{ paddingRight: '1.25rem' }} className="text-right">
                                                <button
                                                    onClick={() => handleToggleStatus(u._id)}
                                                    disabled={isSelf}
                                                    className={`p-1.5 rounded transition-colors ${u.isActive
                                                            ? 'bg-slate-850 hover:bg-rose-950/40 text-slate-500 hover:text-rose-400'
                                                            : 'bg-slate-850 hover:bg-emerald-950/40 text-slate-550 hover:text-emerald-400'
                                                        } disabled:opacity-20`}
                                                    title={u.isActive ? "Suspend Access" : "Activate Access"}
                                                >
                                                    <Power className="w-3.5 h-3.5" />
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Create Account Modal */}
            {isCreateOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div
                        className="w-full max-w-sm rounded-2xl border p-5"
                        style={{
                            background: 'rgba(13, 20, 36, 0.98)',
                            borderColor: 'rgba(255,255,255,0.08)',
                            boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.5)',
                        }}
                    >
                        <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-4">
                            <h3 className="text-white font-bold text-sm flex items-center gap-1.5">
                                <KeyRound className="w-4 h-4 text-blue-500" />
                                Register User Account
                            </h3>
                            <button onClick={() => setIsCreateOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit(handleCreateSubmit)} className="space-y-4 text-xs">
                            <div>
                                <label className="block text-slate-400 mb-1">Full Name *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Enter employee name"
                                    {...register('name')}
                                    className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-slate-400 mb-1">Email ID *</label>
                                <input
                                    type="email"
                                    required
                                    placeholder="name@logitrack.com"
                                    {...register('email')}
                                    className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-slate-400 mb-1">Password *</label>
                                <input
                                    type="password"
                                    required
                                    placeholder="Enter password"
                                    {...register('password')}
                                    className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-slate-400 mb-1">Phone Number</label>
                                <input
                                    type="text"
                                    placeholder="9876543210"
                                    {...register('phone')}
                                    className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-slate-400 mb-1">Role Designation *</label>
                                <select
                                    required
                                    {...register('role')}
                                    className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                                >
                                    {ROLE_OPTIONS.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-900">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateOpen(false)}
                                    className="px-3.5 py-1.5 rounded bg-slate-900 hover:bg-slate-850 text-slate-355"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={registerMutation.isLoading}
                                    className="px-3.5 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors disabled:opacity-50"
                                >
                                    Register Account
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Users;
