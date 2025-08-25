import { createContext } from 'react';
import { supabase } from '../utils/supabaseClient';

export const SupabaseContext = createContext(supabase);

export const SupabaseProvider = ({ children }) => {
    return (
        <SupabaseContext.Provider value={supabase}>
            {children}
        </SupabaseContext.Provider>
    );
};
