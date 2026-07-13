import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { toast } from "sonner";
import DhivehiHeader from "../../components/dhivehi/DhivehiHeader.tsx";
import DhivehiFooter from "../../components/dhivehi/DhivehiFooter.tsx";
import { submitContactMessage } from "../../services/contact.ts";

export default function DhivehiContact() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await submitContactMessage(form);
      setSent(true);
      toast.success("ޝުކުރިއްޔާ! ތިޔަ ލިޔުުން ލިބިއްޖެ.");
    } catch {
      toast.error("ތ ތ ތ. ތ ތ.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F8F8]" dir="rtl" lang="dv">
      <Helmet>
        <title>ގުޅުއްވުމަށް — ރައްޔިތުން</title>
      </Helmet>
      <DhivehiHeader />

      <div className="max-w-4xl mx-auto px-4 py-14">
        <div className="border-b-2 border-[#103820] pb-3 mb-10 text-right">
          <h1 className="font-thaana thaana-headline text-3xl font-bold text-[#142820]">ގުޅުއްވުމަށް</h1>
        </div>

        <div className="bg-white border border-[#E5E7E2] rounded-sm p-6 md:p-8">
          {sent ? (
            <div className="text-center py-10">
              <h3 className="font-thaana thaana-headline text-lg font-semibold text-[#142820] mb-2">ތ ތ ތ ތ ތ</h3>
              <p className="text-sm text-[#6B756E] font-thaana">ތ ތ ތ.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#142820] mb-1 text-right font-thaana">ނަން *</label>
                  <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="ނ ތ"
                    className="w-full border border-[#E5E7E2] rounded-sm px-3 py-2.5 text-sm bg-[#F8F8F8] focus:outline-none focus:border-[#103820] text-right font-thaana" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#142820] mb-1 text-right font-thaana">އީ-މެއިލް *</label>
                  <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="example@gmail.com"
                    className="w-full border border-[#E5E7E2] rounded-sm px-3 py-2.5 text-sm bg-[#F8F8F8] focus:outline-none focus:border-[#103820] text-left" dir="ltr" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#142820] mb-1 text-right font-thaana">ފޯން</label>
                  <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+960 ..."
                    className="w-full border border-[#E5E7E2] rounded-sm px-3 py-2.5 text-sm bg-[#F8F8F8] focus:outline-none focus:border-[#103820] text-left" dir="ltr" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#142820] mb-1 text-right font-thaana">ލިޔުުން *</label>
                <textarea required rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="ތ ތ ތ..."
                  className="w-full border border-[#E5E7E2] rounded-sm px-3 py-2.5 text-sm bg-[#F8F8F8] focus:outline-none focus:border-[#103820] resize-none text-right font-thaana thaana-body" />
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-[#103820] text-white py-2.5 rounded-sm text-sm font-semibold hover:bg-[#183028] transition-colors disabled:opacity-60 font-thaana">
                {loading ? "..." : "ހިއްސާ ކުރައްވ"}
              </button>
            </form>
          )}
        </div>
      </div>

      <DhivehiFooter />
    </div>
  );
}
