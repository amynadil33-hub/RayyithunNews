import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAdminAuth } from "../../hooks/use-admin-auth.tsx";
import { toast } from "sonner";

export default function AdminLogin() {
  const { user, isLoading, signIn, isAdminAreaAllowed, profile, signOut } = useAdminAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isLoading && user && isAdminAreaAllowed) return <Navigate to="/admin/dashboard" replace />;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn(email, password);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Invalid credentials";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  if (!isLoading && user && profile && !isAdminAreaAllowed) {
    return <div className="min-h-screen flex items-center justify-center bg-[#F8F8F8] p-4"><div className="bg-white border p-8 text-center max-w-md"><h1 className="font-semibold text-red-700 mb-2">Admin access denied</h1><p className="text-sm text-[#6B756E] mb-4">Your profile is inactive or does not have an allowed admin role.</p><button className="text-sm underline" onClick={() => void signOut()}>Sign out</button></div></div>;
  }

  return (
    <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <span className="font-serif text-3xl font-bold text-[#103820]">RAYYITHUN</span>
          <p className="text-[#6B756E] text-sm mt-1">Admin Dashboard</p>
        </div>

        <div className="bg-white border border-[#E5E7E2] rounded-sm p-8 shadow-sm">
          <h1 className="text-lg font-semibold text-[#142820] mb-6">Sign in to your account</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#142820] mb-1.5">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="admin@rayyithun.mv"
                className="w-full border border-[#E5E7E2] rounded-sm px-3 py-2.5 text-sm bg-[#F8F8F8] focus:outline-none focus:border-[#103820] focus:ring-1 focus:ring-[#103820]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#142820] mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full border border-[#E5E7E2] rounded-sm px-3 py-2.5 text-sm bg-[#F8F8F8] focus:outline-none focus:border-[#103820] focus:ring-1 focus:ring-[#103820]"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#103820] text-white py-2.5 rounded-sm text-sm font-semibold hover:bg-[#183028] transition-colors disabled:opacity-60 mt-2"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="text-xs text-[#6B756E] mt-5 text-center">
            Access restricted to authorized staff only.
          </p>
        </div>

        <p className="text-center text-xs text-[#6B756E] mt-4">
          <a href="/en" className="hover:text-[#103820]">← Back to website</a>
        </p>
      </div>
    </div>
  );
}
