import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { toast } from "sonner";
import EnglishHeader from "../../components/english/EnglishHeader.tsx";
import EnglishFooter from "../../components/english/EnglishFooter.tsx";
import { submitContactMessage } from "../../services/contact.ts";
import { MapPinIcon, MailIcon, PhoneIcon } from "lucide-react";

export default function EnglishContact() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await submitContactMessage(form);
      setSent(true);
      toast.success("Your message has been sent. We'll get back to you shortly.");
    } catch {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      <Helmet>
        <title>Contact — RAYYITHUN</title>
        <meta name="description" content="Get in touch with the RAYYITHUN editorial team." />
      </Helmet>
      <EnglishHeader />

      <div className="max-w-5xl mx-auto px-4 py-14">
        <div className="border-b-2 border-[#103820] pb-3 mb-10">
          <h1 className="font-serif text-3xl font-bold text-[#142820]">Contact Us</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          {/* Contact info */}
          <div className="md:col-span-2 space-y-6">
            <div>
              <h2 className="font-serif text-lg font-semibold text-[#142820] mb-4">Get in Touch</h2>
              <p className="text-sm text-[#6B756E] leading-relaxed">
                Have a news tip, correction, or feedback? We'd love to hear from you. Our editorial team typically responds within 24 hours.
              </p>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MailIcon size={16} className="text-[#103820] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-[#6B756E]">Email</p>
                  <a href="mailto:news@rayyithun.mv" className="text-sm text-[#142820] hover:text-[#103820]">
                    news@rayyithun.mv
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <PhoneIcon size={16} className="text-[#103820] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-[#6B756E]">Phone</p>
                  <p className="text-sm text-[#142820]">+960 300 1234</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPinIcon size={16} className="text-[#103820] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-[#6B756E]">Office</p>
                  <p className="text-sm text-[#142820]">Male', Republic of Maldives</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="md:col-span-3 bg-white border border-[#E5E7E2] rounded-sm p-6">
            {sent ? (
              <div className="text-center py-10">
                <div className="w-12 h-12 bg-[#D8E8D8] rounded-full flex items-center justify-center mx-auto mb-4">
                  <MailIcon size={20} className="text-[#103820]" />
                </div>
                <h3 className="font-serif text-lg font-semibold text-[#142820] mb-2">Message Sent</h3>
                <p className="text-sm text-[#6B756E]">Thank you. We'll get back to you shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#142820] mb-1">Name *</label>
                    <input
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="John Smith"
                      className="w-full border border-[#E5E7E2] rounded-sm px-3 py-2.5 text-sm bg-[#F8F8F8] focus:outline-none focus:border-[#103820]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#142820] mb-1">Email *</label>
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="example@gmail.com"
                      className="w-full border border-[#E5E7E2] rounded-sm px-3 py-2.5 text-sm bg-[#F8F8F8] focus:outline-none focus:border-[#103820]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#142820] mb-1">Phone</label>
                  <input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+960 ..."
                    className="w-full border border-[#E5E7E2] rounded-sm px-3 py-2.5 text-sm bg-[#F8F8F8] focus:outline-none focus:border-[#103820]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#142820] mb-1">Message *</label>
                  <textarea
                    required
                    rows={5}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Write your message..."
                    className="w-full border border-[#E5E7E2] rounded-sm px-3 py-2.5 text-sm bg-[#F8F8F8] focus:outline-none focus:border-[#103820] resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#103820] text-white py-2.5 rounded-sm text-sm font-semibold hover:bg-[#183028] transition-colors disabled:opacity-60"
                >
                  {loading ? "Sending..." : "Send Message"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      <EnglishFooter />
    </div>
  );
}
