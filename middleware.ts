import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)", 
  "/sign-up(.*)"
]);

const isIgnoredRoute = createRouteMatcher([
  "/no-auth-in-this-route"
]);

export default clerkMiddleware(async (auth, req) => {
  // Skip authentication for ignored routes
  if (isIgnoredRoute(req)) {
    return;
  }

  // Redirect authenticated users away from auth pages
  if (req.nextUrl.pathname === '/sign-in' || req.nextUrl.pathname === '/sign-up') {
    const { userId } = await auth();
    if (userId) {
      return Response.redirect(new URL('/beranda', req.url));
    }
  }

  // Protect non-public routes
  if (!isPublicRoute(req)) {
    await auth.protect();
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