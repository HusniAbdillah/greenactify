import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)", 
  "/sign-up(.*)"
]);

const isAuthenticatedRoute = createRouteMatcher([
  "/(authenticated)(.*)"
]);

export default clerkMiddleware(async (auth, req) => {
  if (isAuthenticatedRoute(req)) {
    return;
  }

  if (req.nextUrl.pathname === '/sign-in' || req.nextUrl.pathname === '/sign-up') {
    const { userId } = await auth();
    if (userId) {
      return Response.redirect(new URL('/beranda', req.url));
    }
  }

  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};