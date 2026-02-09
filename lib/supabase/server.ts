import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

export async function createServerSupabaseClient() {
    const { getToken } = await auth();

    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        {
            global: {
                // Get the default Clerk session token (Native Integration)
                fetch: async (url, options = {}) => {
                    // With Native Integration, the default token has the claims we need.
                    // No 'template' arg required.
                    const clerkToken = await getToken();

                    const headers = new Headers(options?.headers);
                    if (clerkToken) {
                        headers.set('Authorization', `Bearer ${clerkToken}`);
                    }

                    return fetch(url, {
                        ...options,
                        headers,
                    });
                },
            },
        },
    );
}
