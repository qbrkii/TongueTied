import React, { useState } from 'react';
import { 
  X, Mail, Lock, User as UserIcon, LogOut, CheckCircle2, 
  AlertCircle, Cloud, Sparkles, Plus, Users, ShieldCheck 
} from 'lucide-react';
import { 
  auth, 
  signInWithPopup, 
  GoogleAuthProvider,
  fbSignOut 
} from '../lib/firebase';
import { AppAccount } from '../types';
import { getKnownAccounts } from '../utils/storage';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAccount: AppAccount | null;
  onSelectAccount: (account: AppAccount) => void;
  onSignOutAccount: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentAccount,
  onSelectAccount,
  onSignOutAccount,
}) => {
  const [tab, setTab] = useState<'create' | 'switch'>('create');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const knownAccounts = getKnownAccounts();

  // Create or sign into a person's dedicated profile
  const handleCreateOrSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName && !trimmedEmail) {
      setError('Please provide a name or email address.');
      return;
    }

    const effectiveName = trimmedName || (trimmedEmail ? trimmedEmail.split('@')[0] : 'Member');
    const effectiveEmail = trimmedEmail || `${effectiveName.toLowerCase().replace(/[^a-z0-9]/g, '')}@tonguetied.local`;
    
    // Check if an account already exists with this email or name
    const existing = knownAccounts.find(
      a => (trimmedEmail && a.email.toLowerCase() === trimmedEmail.toLowerCase()) ||
           (!trimmedEmail && a.displayName.toLowerCase() === effectiveName.toLowerCase())
    );

    if (existing) {
      // Sign into existing account
      onSelectAccount(existing);
      onClose();
      return;
    }

    // Create unique ID for this person
    const newUid = 'usr_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 7);
    const newAccount: AppAccount = {
      uid: newUid,
      email: effectiveEmail,
      displayName: effectiveName,
      createdAt: Date.now(),
    };

    onSelectAccount(newAccount);
    onClose();
  };

  // Google Sign-in flow (configured by Firebase project)
  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      const account: AppAccount = {
        uid: user.uid,
        email: user.email || 'google-user@tonguetied.app',
        displayName: user.displayName || user.email?.split('@')[0] || 'Explorer',
        createdAt: Date.now(),
      };
      onSelectAccount(account);
      onClose();
    } catch (err: any) {
      console.warn('Google sign in warning:', err);
      // If popup was closed or network error, show helpful message
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Google sign-in popup was closed.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setError('Google sign-in is completing. You can create an account with your name below instantly.');
      } else {
        setError(err.message || 'Could not sign in with Google. You can create a profile below.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGuestAccount = () => {
    const guestUid = 'guest_' + Math.random().toString(36).substring(2, 9);
    const guestAccount: AppAccount = {
      uid: guestUid,
      email: `guest-${guestUid.slice(-4)}@tonguetied.app`,
      displayName: `Guest (${guestUid.slice(-4)})`,
      isGuest: true,
      createdAt: Date.now(),
    };
    onSelectAccount(guestAccount);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
      <div 
        className="w-full max-w-sm bg-white rounded-t-3xl sm:rounded-3xl shadow-xl border border-slate-200 text-slate-800 relative flex flex-col overflow-hidden max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900 leading-tight">
                {currentAccount ? 'Account & Profiles' : 'Create an Account'}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-7 h-7 rounded-full hover:bg-slate-200/60 text-slate-400 hover:text-slate-700 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {/* Active Account Status */}
          {currentAccount && (
            <div className="bg-sky-50/70 border border-sky-100 rounded-2xl p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-sky-500 text-white flex items-center justify-center font-bold text-sm shadow-2xs flex-shrink-0">
                  {currentAccount.displayName ? currentAccount.displayName[0].toUpperCase() : 'U'}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-slate-900 truncate">
                    {currentAccount.displayName}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate font-mono">
                    {currentAccount.email}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  onSignOutAccount();
                  try { fbSignOut(auth); } catch {}
                }}
                className="px-2 py-1 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 text-[11px] font-medium transition cursor-pointer flex items-center gap-1 flex-shrink-0"
              >
                <LogOut className="w-3 h-3" />
                <span>Switch</span>
              </button>
            </div>
          )}

          {/* Quick Google Sign In */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full h-10 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-medium text-xs shadow-2xs flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Continue with Google</span>
            </button>
            <div className="relative flex items-center justify-center my-2">
              <div className="border-t border-slate-200 w-full" />
              <span className="bg-white px-2 text-[10px] uppercase tracking-wider text-slate-400 font-medium absolute">
                or personal profile
              </span>
            </div>
          </div>

          {/* Form to create/set a profile for each person */}
          <form onSubmit={handleCreateOrSignIn} className="space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Your Name / Nickname
              </label>
              <div className="relative">
                <UserIcon className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Maya, Jordan, Alex"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8.5 pr-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                Email Address (Optional)
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="maya@example.com (optional)"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8.5 pr-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:bg-white"
                />
              </div>
            </div>

            {error && (
              <div className="p-2 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-start gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full h-10 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-medium text-xs shadow-xs flex items-center justify-center gap-1.5 transition active:scale-[0.99] cursor-pointer mt-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{currentAccount ? 'Create / Switch Profile' : 'Start With This Profile'}</span>
            </button>
          </form>

          {/* Known accounts list for switching */}
          {knownAccounts.length > 0 && (
            <div className="pt-2 border-t border-slate-100">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-2">
                Existing Accounts on this Device
              </span>
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {knownAccounts.map((acc) => {
                  const isActive = currentAccount?.uid === acc.uid;
                  return (
                    <button
                      key={acc.uid}
                      type="button"
                      onClick={() => {
                        onSelectAccount(acc);
                        onClose();
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition cursor-pointer border ${
                        isActive 
                          ? 'bg-sky-50/70 border-sky-200 text-sky-900 font-medium' 
                          : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-6 h-6 rounded-md bg-white border border-slate-200 flex items-center justify-center text-[11px] font-bold text-slate-700">
                          {acc.displayName ? acc.displayName[0].toUpperCase() : 'U'}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs truncate">{acc.displayName}</div>
                        </div>
                      </div>
                      {isActive && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quick guest button */}
          <div className="text-center pt-1">
            <button
              type="button"
              onClick={handleGuestAccount}
              className="text-[11px] text-slate-500 hover:text-slate-800 transition cursor-pointer underline underline-offset-2"
            >
              Or continue as temporary guest
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
