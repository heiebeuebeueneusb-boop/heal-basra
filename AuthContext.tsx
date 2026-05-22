import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, Profile } from '../lib/supabase';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, fullName: string, role: 'patient' | 'doctor', phone: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function formatAuthError(message: string): string {
  if (message === 'Invalid login credentials') return 'Invalid email or password';
  if (message.includes('already registered')) return 'An account with this email already exists';
  if (message.includes('Password should be')) return 'Password must be at least 6 characters';
  if (message.includes('email')) return 'Please enter a valid email address';
  return 'Something went wrong. Please try again.';
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    setProfile(data);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) await fetchProfile(user.id);
  }, [user, fetchProfile]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        (async () => {
          await fetchProfile(session.user.id);
          setLoading(false);
        })();
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const signIn = async (email: string, password: string): Promise<{ error: string | null }> => {
    if (!email.trim()) return { error: 'Email is required' };
    if (!password) return { error: 'Password is required' };

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    if (error) return { error: formatAuthError(error.message) };
    return { error: null };
  };

  const signUp = async (email: string, password: string, fullName: string, role: 'patient' | 'doctor', phone: string): Promise<{ error: string | null }> => {
    if (!email.trim()) return { error: 'Email is required' };
    if (!password) return { error: 'Password is required' };
    if (password.length < 6) return { error: 'Password must be at least 6 characters' };
    if (!fullName.trim()) return { error: 'Full name is required' };
    if (fullName.trim().length < 2) return { error: 'Name must be at least 2 characters' };

    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
    });
    if (error) return { error: formatAuthError(error.message) };

    if (data.user) {
      const { error: profileError } = await supabase.from('profiles').insert({
        id: data.user.id,
        role,
        full_name: fullName.trim(),
        phone: phone.trim(),
      });

      if (profileError) return { error: 'Account created but profile setup failed. Please contact support.' };

      // Auto-create doctor record for doctor role
      if (role === 'doctor') {
        const { error: doctorError } = await supabase.from('doctors').insert({
          user_id: data.user.id,
          full_name: fullName.trim(),
          specialty: 'General Practitioner',
          department: 'Internal Medicine',
          bio: '',
          location: 'Basra',
          latitude: 30.5085,
          longitude: 47.7835,
          rating: 0,
          review_count: 0,
          experience_years: 0,
          consultation_fee: 25000,
          whatsapp: phone.trim(),
          avatar_url: '',
          is_active: false,
          is_approved: false,
        });

        if (doctorError) {
          // Non-critical: doctor can set up their profile later
          console.error('Doctor record creation failed:', doctorError.message);
        }
      }
    }

    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, signIn, signUp, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
