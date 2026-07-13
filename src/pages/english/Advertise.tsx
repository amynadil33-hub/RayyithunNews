import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { toast } from "sonner";
import EnglishHeader from "../../components/english/EnglishHeader.tsx";
import EnglishFooter from "../../components/english/EnglishFooter.tsx";
import { submitAdvertiserInquiry } from "../../services/contact.ts";
import { MonitorIcon, SmartphoneIcon, SidebarIcon, LayoutIcon } from "lucide-react";

const AD_PLACEMENTS = [
  { label: "Homepage Leaderboard", size: "970×90 / 970×250", icon: MonitorIcon, desc: "Premium top placement on the homepage" },
  { label: "Article Sidebar", size: "300×250", icon: SidebarIcon, desc: "High-visibility rectangle beside articles" },
  { label: "Article Inline", size: "728×90", icon: LayoutIcon, desc: "Embedded within article content" },
  { label: "Mobile Banner", size: "320×100", icon: SmartphoneIcon, desc: "Optimised for mobile readers" },
];

export default function EnglishAdvertise() {
  const [form, setForm] = useState({ name: "", company: "", email: "", phone: "", message: "", preferred_placement: "" });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await submitAdvertiserInquiry(form);
      setSent(true);
      toast.success("Thank you for your inquiry. Our team will contact you shortly.");
    } catch {
      toast.error("Failed to submit. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      <Helmet>
        <title>Advertise — RAYYITHUN</title>
        <meta name="description" content="Reach Maldivian readers across digital platforms with RAYYITHUN advertising." />
      </Helmet>
      <EnglishHeader />

      <div className="max-w-5xl mx-auto px-4 py-14">
        {/* Hero */}
        <div className="bg-[#103820] text-white rounded-sm p-8 md:p-12 mb-12 text-center">
          <h1 className="font-serif text-3xl md:text-4xl font-bold mb-3">Advertise with RAYYITHUN</h1>
          <p className="text-[#95D5B2] text-lg max-w-xl mx-auto leading-relaxed">
            Reach thousands of engaged Maldivian readers daily. Premium editorial placements across our Dhivehi and English editions.
          </p>
        </div>

        {/* Ad placements */}
        <div className="mb-12">
          <h2 className="font-serif text-2xl font-bold text-[#142820] mb-6">Available Placements</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {AD_PLACEMENTS.map((p) => (
              <div key={p.label} className="bg-white border border-[#E5E7E2] rounded-sm p-5 text-center">
                <p.icon size={28} className="mx-auto text-[#103820] mb-3" />
                <h3 className="font-semibold text-sm text-[#142820] mb-1">{p.label}</h3>
                <p className="text-xs text-[#103820] font-mono mb-2">{p.size}</p>
                <p className="text-xs text-[#6B756E] leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Inquiry form */}
        <div className="bg-white border border-[#E5E7E2] rounded-sm p-6 md:p-8">
          <h2 className="font-serif text-xl font-bold text-[#142820] mb-6">Advertising Inquiry</h2>

          {sent ? (
            <div className="text-center py-10">
              <div className="w-12 h-12 bg-[#D8E8D8] rounded-full flex items-center justify-center mx-auto mb-4">
                <MonitorIcon size={20} className="text-[#103820]" />
              </div>
              <h3 className="font-serif text-lg font-semibold text-[#142820] mb-2">Inquiry Received</h3>
              <p className="text-sm text-[#6B756E]">Our advertising team will contact you within 24 hours.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#142820] mb-1">Your Name *</label>
                  <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="John Smith"
                    className="w-full border border-[#E5E7E2] rounded-sm px-3 py-2.5 text-sm bg-[#F8F8F8] focus:outline-none focus:border-[#103820]" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#142820] mb-1">Company</label>
                  <input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })}
                    placeholder="Acme Corp"
                    className="w-full border border-[#E5E7E2] rounded-sm px-3 py-2.5 text-sm bg-[#F8F8F8] focus:outline-none focus:border-[#103820]" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#142820] mb-1">Email *</label>
                  <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="example@gmail.com"
                    className="w-full border border-[#E5E7E2] rounded-sm px-3 py-2.5 text-sm bg-[#F8F8F8] focus:outline-none focus:border-[#103820]" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#142820] mb-1">Phone</label>
                  <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+960 ..."
                    className="w-full border border-[#E5E7E2] rounded-sm px-3 py-2.5 text-sm bg-[#F8F8F8] focus:outline-none focus:border-[#103820]" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#142820] mb-1">Preferred Placement</label>
                <select value={form.preferred_placement} onChange={(e) => setForm({ ...form, preferred_placement: e.target.value })}
                  className="w-full border border-[#E5E7E2] rounded-sm px-3 py-2.5 text-sm bg-[#F8F8F8] focus:outline-none focus:border-[#103820]">
                  <option value="">Select a placement...</option>
                  {AD_PLACEMENTS.map((p) => (
                    <option key={p.label} value={p.label}>{p.label} — {p.size}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#142820] mb-1">Additional Information</label>
                <textarea rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Tell us about your campaign, budget, and timeline..."
                  className="w-full border border-[#E5E7E2] rounded-sm px-3 py-2.5 text-sm bg-[#F8F8F8] focus:outline-none focus:border-[#103820] resize-none" />
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-[#103820] text-white py-2.5 rounded-sm text-sm font-semibold hover:bg-[#183028] transition-colors disabled:opacity-60">
                {loading ? "Submitting..." : "Submit Inquiry"}
              </button>
            </form>
          )}
        </div>
      </div>

      <EnglishFooter />
    </div>
  );
}
