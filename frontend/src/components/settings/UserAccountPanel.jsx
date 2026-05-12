import React, { useState, useEffect } from 'react';
import { User, Lock, Bell } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import api from '../../lib/api';
import { getApiErrorMessage } from '../../lib/http';

function normalizeUser(raw) {
  if (!raw) return null;
  const id = raw.id != null ? String(raw.id) : raw._id != null ? String(raw._id) : '';
  return { ...raw, id };
}

/** Profile, password, default notification toggles (persisted via org settings + auth). */
export default function UserAccountPanel({ user, onProfileUpdate, notificationDefaults, onPatchNotifications }) {
  const [profileLoading, setProfileLoading] = useState(true);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [profileMessage, setProfileMessage] = useState('');
  const [profileError, setProfileError] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwMessage, setPwMessage] = useState('');
  const [pwError, setPwError] = useState('');
  const [savingPw, setSavingPw] = useState(false);

  useEffect(() => {
    let c = false;
    (async () => {
      setProfileLoading(true);
      try {
        const { data } = await api.get('/auth/profile');
        const u = data.user;
        if (c || !u) return;
        setFirstName(u.firstName || '');
        setLastName(u.lastName || '');
        setPhone(u.phone || '');
        setEmail(u.email || '');
      } catch {
        if (!c && user) {
          setFirstName(user.firstName || '');
          setLastName(user.lastName || '');
          setPhone(user.phone || '');
          setEmail(user.email || '');
        }
      } finally {
        if (!c) setProfileLoading(false);
      }
    })();
    return () => {
      c = true;
    };
  }, [user]);

  const saveProfile = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileMessage('');
    setSavingProfile(true);
    try {
      const { data } = await api.put('/auth/profile', { firstName, lastName, phone });
      const u = data.user;
      if (u && onProfileUpdate) onProfileUpdate(normalizeUser(u));
      setProfileMessage('Profile updated.');
    } catch (err) {
      setProfileError(getApiErrorMessage(err, 'Could not update profile.'));
    } finally {
      setSavingProfile(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    setPwError('');
    setPwMessage('');
    if (newPassword.length < 6) {
      setPwError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError('Passwords do not match.');
      return;
    }
    setSavingPw(true);
    try {
      await api.put('/auth/change-password', { currentPassword, newPassword });
      setPwMessage('Password updated.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPwError(getApiErrorMessage(err, 'Could not change password.'));
    } finally {
      setSavingPw(false);
    }
  };

  const nd = notificationDefaults || {};

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-cyan-400" />
            <CardTitle className="text-white">Profile</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {profileLoading ? (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500" />
            </div>
          ) : (
            <form onSubmit={saveProfile} className="space-y-4">
              {profileError && (
                <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                  {profileError}
                </div>
              )}
              {profileMessage && (
                <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
                  {profileMessage}
                </div>
              )}
              <div>
                <label className="mb-1 block text-sm text-slate-400">Email</label>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full cursor-not-allowed rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-slate-400"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm text-slate-400">First name</label>
                  <input
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="modern-input w-full px-3 py-2"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-slate-400">Last name</label>
                  <input
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="modern-input w-full px-3 py-2"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate-400">Phone</label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="modern-input w-full px-3 py-2"
                />
              </div>
              <Button type="submit" disabled={savingProfile}>
                {savingProfile ? 'Saving…' : 'Save profile'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-cyan-400" />
            <CardTitle className="text-white">Notification defaults</CardTitle>
          </div>
          <p className="text-xs text-slate-500">Organization-wide defaults (can be restricted by role).</p>
        </CardHeader>
        <CardContent className="space-y-3">
          {['emailDigest', 'lowStockAlerts', 'transactionAlerts'].map((key) => (
            <label key={key} className="flex cursor-pointer items-center justify-between gap-4 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
              <span className="text-sm text-slate-300">
                {key === 'emailDigest' && 'Email digest'}
                {key === 'lowStockAlerts' && 'Low stock alerts'}
                {key === 'transactionAlerts' && 'Transaction alerts'}
              </span>
              <input
                type="checkbox"
                checked={!!nd[key]}
                onChange={(e) =>
                  onPatchNotifications?.({ [key]: e.target.checked })
                }
                className="h-4 w-4 rounded border-slate-600 text-cyan-500"
              />
            </label>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-cyan-400" />
            <CardTitle className="text-white">Security</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={changePassword} className="space-y-4">
            {pwError && (
              <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                {pwError}
              </div>
            )}
            {pwMessage && (
              <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
                {pwMessage}
              </div>
            )}
            <div>
              <label className="mb-1 block text-sm text-slate-400">Current password</label>
              <input
                type="password"
                autoComplete="current-password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="modern-input w-full px-3 py-2"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-400">New password</label>
              <input
                type="password"
                autoComplete="new-password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="modern-input w-full px-3 py-2"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-400">Confirm new password</label>
              <input
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="modern-input w-full px-3 py-2"
              />
            </div>
            <Button type="submit" disabled={savingPw}>
              {savingPw ? 'Updating…' : 'Update password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
