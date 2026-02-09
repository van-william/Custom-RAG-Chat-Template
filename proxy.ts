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
        // Development Bypass: Allow anyone in local dev IF it's an admin route? 
        // Actually, for CHAT we want to enforce auth even in dev to test RAG.
        // But for ADMIN we might want to bypass?
        // Let's stick to the plan: Enforce auth.

        // For Admin routes, check role (enforce in ALL environments)
        if (req.nextUrl.pathname.startsWith('/admin') || req.nextUrl.pathname.startsWith('/api/admin')) {
            const { sessionClaims } = await auth();
            await (auth as any).protect((has: any) => {
                const claims = sessionClaims as any;
                const role = claims?.metadata?.role || claims?.public_metadata?.role || claims?.role;
                return has({ role: 'admin' }) || role === 'admin';
            });
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
