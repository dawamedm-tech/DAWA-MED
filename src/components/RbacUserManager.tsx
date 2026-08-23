import React, { useState } from 'react';
import { AuthUser, UserRole, Permission, Language, AccountStatus } from '../types';
import { DEFAULT_USERS, ROLE_PERMISSIONS } from '../utils/rbac';
import { TRANSLATIONS } from '../data/translations';
import { 
  Shield, 
  Users, 
  Key, 
  Lock, 
  Unlock, 
  UserCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Search, 
  Sliders, 
  RotateCcw,
  Sparkles,
  ShieldAlert,
  UserX,
  FileCheck
} from 'lucide-react';
import { motion } from 'motion/react';

interface RbacUserManagerProps {
  currentUser?: AuthUser;
  onSwitchUser?: (user: AuthUser) => void;
  language: Language;
}

export const RbacUserManager: React.FC<RbacUserManagerProps> = ({
  currentUser,
  onSwitchUser,
  language,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const [usersList, setUsersList] = useState<AuthUser[]>(DEFAULT_USERS);
  const [selectedUser, setSelectedUser] = useState<AuthUser>(currentUser || DEFAULT_USERS[0]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  const filteredUsers = usersList.filter((u) => {
    const matchesSearch = 
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      (u.email && u.email.toLowerCase().includes(search.toLowerCase())) ||
      (u.phone && u.phone.includes(search)) ||
      u.role.toLowerCase().includes(search.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    const newPermissions = ROLE_PERMISSIONS[newRole] || [];
    setUsersList((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole, permissions: newPermissions } : u))
    );
    if (selectedUser.id === userId) {
      setSelectedUser({ ...selectedUser, role: newRole, permissions: newPermissions });
    }
    setFeedbackToast(`User role updated to ${newRole.toUpperCase()}. Permissions refreshed.`);
    setTimeout(() => setFeedbackToast(null), 3500);
  };

  const handleStatusChange = (userId: string, newStatus: AccountStatus) => {
    setUsersList((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status: newStatus } : u))
    );
    if (selectedUser.id === userId) {
      setSelectedUser({ ...selectedUser, status: newStatus });
    }
    setFeedbackToast(`Account status updated to ${newStatus.toUpperCase()}`);
    setTimeout(() => setFeedbackToast(null), 3500);
  };

  const allAvailablePermissions: { category: string; perms: { id: Permission; desc: string }[] }[] = [
    {
      category: 'Medicine Safety & Catalog',
      perms: [
        { id: 'medicines.view', desc: 'Browse approved catalogue' },
        { id: 'medicines.create', desc: 'Submit new medicine for approval' },
        { id: 'medicines.approve', desc: 'Grant regulatory publication approval' },
        { id: 'medicines.reject', desc: 'Reject / Disallow drug submission' },
        { id: 'medicines.suspend', desc: 'Halt / Lock active medicine' }
      ]
    },
    {
      category: 'Pharmacy Network & Licensure',
      perms: [
        { id: 'pharmacies.view', desc: 'View partner pharmacies' },
        { id: 'pharmacies.register', desc: 'Submit pharmacy license' },
        { id: 'pharmacies.approve', desc: 'Validate & authorize pharmacy dispensing' },
        { id: 'pharmacies.suspend', desc: 'Suspend pharmacy license & orders' }
      ]
    },
    {
      category: 'Clinical Prescriptions',
      perms: [
        { id: 'prescriptions.upload', desc: 'Upload patient prescription' },
        { id: 'prescriptions.review', desc: 'Pharmacist line-by-line verification' },
        { id: 'prescriptions.view_audit', desc: 'View encrypted prescription audit trail' }
      ]
    },
    {
      category: 'Support & Escalations',
      perms: [
        { id: 'support.view', desc: 'Read support tickets' },
        { id: 'support.reply', desc: 'Send ticket messages & notes' },
        { id: 'support.manage', desc: 'Assign officers & close tickets' }
      ]
    },
    {
      category: 'Security, Audit & Admin',
      perms: [
        { id: 'audit.view', desc: 'Inspect SHA-256 cryptographic audit logs' },
        { id: 'users.edit', desc: 'Modify roles and account suspension' },
        { id: 'settings.manage', desc: 'Update global platform rules' }
      ]
    }
  ];

  return (
    <div className="space-y-6" id="rbac-user-manager">
      {/* Toast */}
      {feedbackToast && (
        <div className="p-3.5 rounded-2xl bg-[#1B4332] text-white text-xs font-bold flex items-center justify-between shadow-lg border border-[#74C69D]/40">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#74C69D]" />
            <span>{feedbackToast}</span>
          </div>
        </div>
      )}

      {/* Overview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Users List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-[#D8E2DC] shadow-xs flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-neutral-400 absolute start-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search user name, email, phone or role..."
                className="w-full ps-10 pe-4 py-2.5 bg-[#F8FAF9] border border-[#D8E2DC] rounded-xl text-xs font-medium text-neutral-800 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
              />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2.5 bg-[#F8FAF9] border border-[#D8E2DC] rounded-xl text-xs font-bold text-neutral-700 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F] w-full sm:w-auto"
            >
              <option value="all">All Roles</option>
              <option value="super_admin">Super Admin</option>
              <option value="admin">Admin</option>
              <option value="support">Support Agent</option>
              <option value="pharmacy">Pharmacy</option>
              <option value="customer">Customer</option>
              <option value="driver">Driver</option>
            </select>
          </div>

          <div className="space-y-2.5">
            {filteredUsers.map((user) => {
              const isSelected = selectedUser.id === user.id;
              const isSuspended = user.status === 'suspended' || user.status === 'blocked';

              return (
                <div
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected 
                      ? 'bg-[#E8F5E9] border-[#52B788] shadow-sm' 
                      : 'bg-white border-[#D8E2DC] hover:border-[#95D5B2]'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-[#1B4332] text-sm">{user.name}</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          user.role === 'super_admin' ? 'bg-purple-100 text-purple-900 border border-purple-200' :
                          user.role === 'admin' ? 'bg-[#D8F3DC] text-[#1B4332] border border-[#74C69D]' :
                          user.role === 'support' ? 'bg-blue-100 text-blue-900 border border-blue-200' :
                          user.role === 'pharmacy' ? 'bg-amber-100 text-amber-900 border border-amber-200' :
                          'bg-neutral-100 text-neutral-800'
                        }`}>
                          {user.role.replace('_', ' ')}
                        </span>
                        {isSuspended && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-800">
                            {user.status.toUpperCase()}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-neutral-500">
                        {user.email || user.phone} &bull; Permissions: <strong>{user.permissions.length} active</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {onSwitchUser && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSwitchUser(user);
                            setFeedbackToast(`Switched active context to ${user.name} (${user.role.toUpperCase()})`);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
                        >
                          Login / Test Role
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col: Selected User Inspector & Role Editor */}
        <div className="bg-white p-5 rounded-3xl border border-[#D8E2DC] shadow-xs space-y-5 h-fit">
          <div className="border-b border-neutral-100 pb-4">
            <div className="flex items-center gap-2 text-xs font-bold text-[#2D6A4F] uppercase tracking-wider mb-1">
              <Shield className="w-4 h-4" />
              <span>RBAC Policy Inspector</span>
            </div>
            <h3 className="text-base font-black text-[#1B4332]">{selectedUser.name}</h3>
            <p className="text-xs text-neutral-500">{selectedUser.email || selectedUser.phone}</p>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-neutral-700 mb-1">Assigned Role</label>
              <select
                value={selectedUser.role}
                onChange={(e) => handleRoleChange(selectedUser.id, e.target.value as UserRole)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#F8FAF9] border border-[#D8E2DC] font-bold text-neutral-800"
              >
                <option value="customer">Customer</option>
                <option value="pharmacy">Pharmacy Partner</option>
                <option value="driver">Courier Driver</option>
                <option value="support">Clinical Support Agent</option>
                <option value="admin">Operations Admin</option>
                <option value="super_admin">Super Administrator</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-neutral-700 mb-1">Account State</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleStatusChange(selectedUser.id, 'active')}
                  className={`py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                    selectedUser.status === 'active' 
                      ? 'bg-[#E8F5E9] text-[#1B4332] border-[#81C784]' 
                      : 'bg-neutral-50 text-neutral-600 border-neutral-200'
                  }`}
                >
                  Active
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusChange(selectedUser.id, 'suspended')}
                  className={`py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                    selectedUser.status === 'suspended' 
                      ? 'bg-rose-100 text-rose-900 border-rose-300' 
                      : 'bg-neutral-50 text-neutral-600 border-neutral-200'
                  }`}
                >
                  Suspend Access
                </button>
              </div>
            </div>
          </div>

          {/* Permissions Matrix */}
          <div className="border-t border-neutral-100 pt-4 space-y-3">
            <h4 className="text-xs font-black text-neutral-800 uppercase tracking-wider flex items-center justify-between">
              <span>Granted Permissions</span>
              <span className="text-[#2D6A4F]">{selectedUser.permissions.length} Enabled</span>
            </h4>

            <div className="space-y-3 max-h-72 overflow-y-auto pe-1">
              {allAvailablePermissions.map((group) => {
                return (
                  <div key={group.category} className="space-y-1.5">
                    <p className="text-[10px] font-bold text-neutral-400 uppercase">{group.category}</p>
                    <div className="space-y-1">
                      {group.perms.map((p) => {
                        const isGranted = selectedUser.permissions.includes(p.id);
                        return (
                          <div
                            key={p.id}
                            className={`p-2 rounded-xl text-xs flex items-center justify-between border ${
                              isGranted 
                                ? 'bg-[#F0FDF4] border-[#BBF7D0] text-[#166534]' 
                                : 'bg-neutral-50 border-neutral-100 text-neutral-400 opacity-60'
                            }`}
                          >
                            <span className="font-semibold">{p.desc}</span>
                            {isGranted ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#166534] shrink-0" />
                            ) : (
                              <Lock className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
