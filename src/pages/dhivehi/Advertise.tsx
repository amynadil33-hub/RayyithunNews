import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { toast } from "sonner";
import DhivehiHeader from "../../components/dhivehi/DhivehiHeader.tsx";
import DhivehiFooter from "../../components/dhivehi/DhivehiFooter.tsx";
import { submitAdvertiserInquiry } from "../../services/contact.ts";

export default function DhivehiAdvertise() {
  const [form, setForm] = useState({ name: "", company: "", email: "", phone: "", message: "", preferred_placement: "" });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await submitAdvertiserInquiry(form);
      setSent(true);
      toast.success("ށުކުރިއްޔާ! ތިޔަ ހުށަހެޅުން ލިބިއްޖެ.");
    } catch {
      toast.error("ހުށަހެޅުން ފޮނުވުމުގައި މައްހަލައެއް ދިމާވެއްޖެ.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass = "w-full border border-[#E5E7E2] rounded-sm px-3 py-2.5 text-sm bg-[#F8F8F8] focus:outline-none focus:border-[#103820]";
  const labelClass = "block text-xs font-medium text-[#142820] mb-1 text-right font-thaana";

  return (
    <div className="min-h-screen bg-[#F8F8F8]" dir="rtl" lang="dv">
      <Helmet><title>އިގުލާން — ރައްޔިތުން</title></Helmet>
      <DhivehiHeader />

      <main className="max-w-4xl mx-auto px-4 py-14">
        <div className="bg-[#103820] text-white rounded-sm p-8 mb-10 text-center">
          <h1 className="font-thaana thaana-headline text-3xl font-bold mb-3">ރައްޔިތުންގައި އިގުލާން ކުރައްވާ</h1>
          <p className="text-[#95D5B2] font-thaana thaana-body max-w-xl mx-auto">ތިޔަ ވިޔަފާރި ރައްޔިތުންގެ ކިޔުންތެރިންނާ ގުޅުއްވާ.</p>
        </div>

        <div className="bg-white border border-[#E5E7E2] rounded-sm p-6 md:p-8">
          <h2 className="font-thaana thaana-headline text-xl font-bold text-[#142820] mb-6 text-right">އިގުލާންދިނުމުގެ ހުށަހެޅުން</h2>
          {sent ? (
            <div className="text-center py-10">
              <h3 className="font-thaana thaana-headline text-lg font-semibold text-[#142820] mb-2">ހުށަހެޅުން ލިބިއްޖެ</h3>
              <p className="text-sm text-[#6B756E] font-thaana">އަޅުގަނޑުމެން އަވަހަށް ގުޅާނެ.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="advertiser-name" className={labelClass}>ނަން *</label>
                  <input id="advertiser-name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={`${inputClass} text-right font-thaana`} />
                </div>
                <div>
                  <label htmlFor="advertiser-company" className={labelClass}>ކުންފުނީ / ވިޔަފާރީގެ ނަން</label>
                  <input id="advertiser-company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className={`${inputClass} text-right font-thaana`} />
                </div>
                <div>
                  <label htmlFor="advertiser-email" className={labelClass}>އީ-މެއިލް *</label>
                  <input id="advertiser-email" required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="example@gmail.com" className={`${inputClass} text-left`} dir="ltr" />
                </div>
                <div>
                  <label htmlFor="advertiser-phone" className={labelClass}>ފޯން</label>
                  <input id="advertiser-phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={`${inputClass} text-left`} dir="ltr" />
                </div>
              </div>
              <div>
                <label htmlFor="advertiser-message" className={labelClass}>އިގުލާނާ ބެހޭ ތަފްށީލް</label>
                <textarea id="advertiser-message" rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className={`${inputClass} resize-none text-right font-thaana thaana-body`} />
              </div>
              <button type="submit" disabled={loading} className="w-full bg-[#103820] text-white py-2.5 rounded-sm text-sm font-semibold hover:bg-[#183028] transition-colors disabled:opacity-60 font-thaana">
                {loading ? "ފޮނުވަނީ..." : "ހުށަހަޅާ"}
              </button>
            </form>
          )}
        </div>
      </main>

      <DhivehiFooter />
    </div>
  );
}
