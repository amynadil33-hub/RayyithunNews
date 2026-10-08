import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient.ts";

function authLinkError() {
  const query = new URLSearchParams(window.location.search);
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));

  return (
    query.get("error_description") ??
    hash.get("error_description") ??
    query.get("error") ??
    hash.get("error")
  );
}

export default function AdminSetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [isChecking, setIsChecking] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [error, setError] = useState<string | null>(authLinkError());

  useEffect(() => {
    let active = true;

    void supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!active) return;
      setHasSession(Boolean(data.session));
      if (sessionError) setError(sessionError.message);
      setIsChecking(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!active) return;
        setHasSession(Boolean(session));
        setIsChecking(false);
      },
    );

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmation) {
      setError("The passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setIsSubmitting(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    navigate("/admin/dashboard", { replace: true });
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F8F8F8] p-4 text-[#142820]">
      <section className="w-full max-w-md rounded-lg border border-[#D8DED9] bg-white p-8 shadow-sm">
        <img
          src="/rayyithun-logo-english-2026.png"
          alt="Rayyithun News Network"
          className="mx-auto h-32 w-28 object-contain"
        />
        <h1 className="mt-4 text-center text-2xl font-bold text-[#103820]">
          Set your password
        </h1>
        <p className="mt-2 text-center text-sm text-[#6B756E]">
          Finish setting up your Rayyithun admin account.
        </p>

        {error && (
          <div className="mt-5 rounded-sm border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        {isChecking ? (
          <p className="mt-6 text-center text-sm text-[#6B756E]">
            Checking your invitation…
          </p>
        ) : hasSession ? (
          <form onSubmit={submit} className="mt-6 space-y-4">
            <label className="block text-xs font-semibold text-[#526159]">
              New password
              <input
                required
                type="password"
                minLength={8}
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-1.5 w-full rounded-sm border border-[#D8DED9] bg-[#F8F8F8] px-3 py-2.5 text-sm outline-none focus:border-[#103820] focus:ring-1 focus:ring-[#103820]"
              />
            </label>
            <label className="block text-xs font-semibold text-[#526159]">
              Confirm password
              <input
                required
                type="password"
                minLength={8}
                autoComplete="new-password"
                value={confirmation}
                onChange={(event) => setConfirmation(event.target.value)}
                className="mt-1.5 w-full rounded-sm border border-[#D8DED9] bg-[#F8F8F8] px-3 py-2.5 text-sm outline-none focus:border-[#103820] focus:ring-1 focus:ring-[#103820]"
              />
            </label>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-sm bg-[#103820] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#183028] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? "Saving…" : "Save password"}
            </button>
          </form>
        ) : (
          <div className="mt-6 text-center text-sm text-[#6B756E]">
            <p>This invitation is invalid or has expired.</p>
            <p className="mt-2">Ask an administrator to send a new invitation.</p>
          </div>
        )}

        <div className="mt-6 text-center">
          <Link
            to="/admin/login"
            className="text-sm font-medium text-[#103820] underline-offset-4 hover:underline"
          >
            Return to admin sign in
          </Link>
        </div>
      </section>
    </main>
  );
}
