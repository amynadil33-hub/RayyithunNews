import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const allowedRoles = new Set(["super_admin", "admin", "editor", "author"]);

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const authorization = request.headers.get("Authorization");

    if (!supabaseUrl || !anonKey || !serviceRoleKey || !authorization) {
      return json({ error: "Unauthorized" }, 401);
    }

    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authorization } },
      auth: { persistSession: false },
    });
    const token = authorization.replace(/^Bearer\s+/i, "");
    const { data: authData, error: authError } =
      await callerClient.auth.getUser(token);
    if (authError || !authData.user) {
      return json({ error: "Unauthorized" }, 401);
    }

    const { data: callerProfile } = await callerClient
      .from("profiles")
      .select("role, is_active")
      .eq("id", authData.user.id)
      .single();
    if (callerProfile?.role !== "super_admin" || !callerProfile.is_active) {
      return json({ error: "Only a superadmin can create users." }, 403);
    }

    const body = await request.json();
    const fullName = String(body.fullName ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");
    const role = String(body.role ?? "author");

    if (fullName.length < 2) return json({ error: "Enter the user's full name." }, 400);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return json({ error: "Enter a valid email address." }, 400);
    }
    if (password.length < 8) {
      return json({ error: "The temporary password must be at least 8 characters." }, 400);
    }
    if (!allowedRoles.has(role)) return json({ error: "Invalid role." }, 400);

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data: created, error: createError } =
      await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: fullName },
      });
    if (createError || !created.user) {
      return json({ error: createError?.message ?? "Unable to create user." }, 400);
    }

    const { data: profile, error: profileError } = await adminClient
      .from("profiles")
      .update({ full_name: fullName, role, is_active: true })
      .eq("id", created.user.id)
      .select("id, full_name, email, role, avatar_url, is_active, created_at, updated_at")
      .single();
    if (profileError) {
      await adminClient.auth.admin.deleteUser(created.user.id);
      return json({ error: profileError.message }, 400);
    }

    return json({ user: profile }, 201);
  } catch (error) {
    return json(
      { error: error instanceof Error ? error.message : "Unexpected server error." },
      500,
    );
  }
});

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
