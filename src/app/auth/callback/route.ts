import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { performBidirectionalSync } from "@/lib/calendar/sync-service";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const errorParam = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  // 1. Capture OAuth errors from Google/Supabase
  if (errorParam || errorDescription) {
    const errorMsg = errorDescription || errorParam || "OAuth authorization failed.";
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(errorMsg)}`
    );
  }

  // 2. Exchange authorization code for authenticated session
  if (code) {
    const supabase = await createServerSupabaseClient();
    if (supabase) {
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
      if (exchangeError) {
        return NextResponse.redirect(
          `${origin}/login?error=${encodeURIComponent(exchangeError.message)}`
        );
      }

      if (data?.session?.user) {
        const user = data.session.user;
        const meta = user.user_metadata || {};
        const fullName = meta.full_name || meta.name || "";
        const avatarUrl = meta.avatar_url || meta.picture || "";
        const email = user.email || "";

        // Check if user already has a profile in public.profiles
        const { data: profile } = await supabase
          .from("profiles")
          .select("id, onboarding_completed, role")
          .eq("id", user.id)
          .maybeSingle();

        // Create or update profile using correct schema columns (full_name, avatar_url)
        if (!profile) {
          await supabase.from("profiles").upsert(
            {
              id: user.id,
              email: email,
              full_name: fullName || (email ? email.split("@")[0] : "Planner"),
              avatar_url: avatarUrl,
              role: "student",
              onboarding_completed: false,
            },
            { onConflict: "id" }
          );
        }

        // 3. Vault Google OAuth tokens securely in calendar_connections table
        if (data.session.provider_token) {
          const expiresAt = new Date(Date.now() + (data.session.expires_in || 3600) * 1000).toISOString();
          const connPayload: any = {
            user_id: user.id,
            provider: "google",
            access_token: data.session.provider_token,
            token_expires_at: expiresAt,
            sync_status: "active",
            last_synced_at: new Date().toISOString(),
            google_email: email,
            google_tasks_sync_enabled: true,
            google_calendar_sync_enabled: true,
          };

          if (data.session.provider_refresh_token) {
            connPayload.refresh_token = data.session.provider_refresh_token;
          }

          await supabase.from("calendar_connections").upsert(connPayload, { onConflict: "user_id" });

          // Run immediate initial bidirectional sync so calendar events and tasks are populated
          try {
            await performBidirectionalSync(user.id, supabase);
          } catch (syncErr) {
            console.warn("[OAuth Callback] Initial bidirectional sync notice:", syncErr);
          }
        }

        const isCalendarConnect = searchParams.get("source") === "calendar_connect";
        const isOnboardingCompleted = profile ? Boolean(profile.onboarding_completed) : false;
        const destination = isCalendarConnect
          ? "/home?calendar_connected=true"
          : isOnboardingCompleted
          ? "/home"
          : "/onboarding";

        const forwardedHost = request.headers.get("x-forwarded-host");
        const redirectBase =
          process.env.NODE_ENV === "development"
            ? origin
            : forwardedHost
            ? `https://${forwardedHost}`
            : origin;

        const response = NextResponse.redirect(`${redirectBase}${destination}`);

        // Set session identification cookie for SSR middleware
        response.cookies.set("kronos_auth_user", user.id, {
          path: "/",
          httpOnly: false,
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 7,
        });

        // Store provider token in cookie as secondary fallback
        if (data.session.provider_token) {
          response.cookies.set("kronos_google_token", data.session.provider_token, {
            path: "/",
            httpOnly: false,
            sameSite: "lax",
            maxAge: 60 * 60,
          });
        }

        return response;
      }
    }
  }

  // Fallback for missing code or unconfigured Supabase client
  return NextResponse.redirect(`${origin}/login?error=auth_exchange_failed`);
}
