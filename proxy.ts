import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isProtectedRequest = createRouteMatcher([
    '/admin(.*)',
    '/api/admin(.*)',
    '/chat(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
    // console.log("MIDDLEWARE: Request URL", req.url);

    if (isProtectedRequest(req)) {
        // For Admin routes, check role (enforce in ALL environments)
        if (req.nextUrl.pathname.startsWith('/admin') || req.nextUrl.pathname.startsWith('/api/admin')) {
            // First, ensure user is authenticated at all
            await auth.protect();

            // Development Bypass: If flag is set, skip the specific role check
            if (process.env.NODE_ENV === 'development' && process.env.ADMIN_ACCESS_BYPASS === 'true') {
                return;
            }

            const { sessionClaims } = await auth();
            // Check for admin role in metadata
            const claims = sessionClaims as any;
            const role = claims?.metadata?.role || claims?.public_metadata?.role || claims?.role;

            if (role !== 'admin') {
                // If not admin and not bypassed, redirect or error
                // auth.protect() with a condition would handle this automatically, but since we need custom logic:
                // We can use the simpler protect() syntax which throws if false
                await (auth as any).protect((has: any) => {
                    return has({ role: 'admin' }) || role === 'admin';
                });
            }
        } else {
            // For Chat routes, just require authentication
            await auth.protect();
        }
    }
});

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
};
