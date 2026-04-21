import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables');
}

// Custom fetch with retry logic to handle ERR_QUIC_PROTOCOL_ERROR and other transient network issues
const fetchWithRetry = async (url: string | URL | Request, options?: RequestInit | undefined, retries = 3): Promise<Response> => {
    try {
        const response = await fetch(url, options);
        return response;
    } catch (err) {
        if (retries > 0) {
            console.warn(`Supabase fetch failed, retrying... (${retries} retries left):`, err);
            // Add a small delay before retrying
            await new Promise(resolve => setTimeout(resolve, 1000));
            return fetchWithRetry(url, options, retries - 1);
        }
        throw err;
    }
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
        fetch: fetchWithRetry,
    },
});
