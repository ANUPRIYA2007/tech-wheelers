import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProfile = useCallback(async (userId) => {
    try {
      const { data, error: fetchError } = await supabase
        .from('farmers')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (fetchError) {
        console.warn('fetchProfile warning:', fetchError.message);
        setProfile({ id: userId, role: 'farmer' });
        return;
      }
      if (data) {
        setProfile({ ...data, role: data.role || 'farmer' });
      } else {
        setProfile({ id: userId, role: 'farmer' });
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setProfile({ id: userId, role: 'farmer' });
    }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  /**
   * signUp — creates auth user then inserts a row into the farmers table.
   */
  const signUp = async ({
    email,
    password,
    fullName,
    phone,
    village = '',
    district = '',
    state = '',
    pincode = '',
    government_id_verified = false,
    proof_type = '',
  }) => {
    setError(null);
    try {
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName, phone },
        },
      });
      if (signUpError) throw signUpError;

      const userId = authData?.user?.id;
      if (userId) {
        const farmerId = `FRM-${Date.now().toString(36).toUpperCase()}`;
        const { error: insertError } = await supabase
          .from('farmers')
          .insert([{
            user_id: userId,
            farmer_id: farmerId,
            full_name: fullName,
            phone,
            village,
            district,
            state,
            role: 'farmer',
            is_verified: government_id_verified,
          }]);
        if (insertError) {
          console.warn('Farmer row insert warning:', insertError.message);
        }
      }

      return authData;
    } catch (err) {
      const msg = err.message?.includes('Failed to fetch')
        ? 'Cannot reach the server. Please check your internet connection and try again.'
        : err.message || 'Registration failed. Please try again.';
      setError(msg);
      throw new Error(msg);
    }
  };

  const signIn = async ({ email, password }) => {
    setError(null);
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) throw signInError;
      return data;
    } catch (err) {
      const msg = err.message?.includes('Failed to fetch')
        ? 'Cannot reach the server. Please check your internet connection and try again.'
        : err.message || 'Login failed. Please try again.';
      setError(msg);
      throw new Error(msg);
    }
  };

  const signOut = async () => {
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) throw signOutError;
    setUser(null);
    setProfile(null);
  };

  const value = {
    user,
    profile,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    isAuthenticated: !!user,
    role: profile?.role || null,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
