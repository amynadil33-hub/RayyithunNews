import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { ImagePlusIcon } from "lucide-react";
import { toast } from "sonner";
import DhivehiHeader from "../../components/dhivehi/DhivehiHeader.tsx";
import DhivehiFooter from "../../components/dhivehi/DhivehiFooter.tsx";
import { submitReaderArticle } from "../../services/contact.ts";

const initialForm = { name: "", address: "", email: "", phone: "", content: "" };

export default function DhivehiSubmitArticle() {
  const [form, setForm] = useState(initialForm);
  const [photo, setPhoto] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (photo && photo.size > 10 * 1024 * 1024) {
      toast.error("ފޮޓޯގެ ސައިޒު 10MB އަށްވުރެ ކުޑަކޮށްލައްވާ.");
      return;
    }

    setLoading(true);
    try {
      await submitReaderArticle({ ...form, photo });
      setSent(true);
      setForm(initialForm);
      setPhoto(null);
      toast.success("ޝުކުރިއްޔާ! އާރޓިކަލް ލިބިއްޖެ.");
    } catch {
      toast.error("އާރޓިކަލް ފޮނުވުމުގައި މައްސަލައެއް ދިމާވެއްޖެ.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass = "w-full border border-[#D8DED9] rounded-sm px-3 py-2.5 text-sm bg-[#F8F8F8] focus:outline-none focus:border-[#103820] font-thaana";
  const labelClass = "block text-sm font-semibold text-[#142820] mb-1.5 text-right font-thaana";

  return (
    <div className="min-h-screen bg-[#F8F8F8]" dir="rtl" lang="dv">
      <Helmet>
        <title>އާރޓިކަލް ހުށަހަޅާ — ރައްޔިތުން</title>
        <meta name="description" content="ރައްޔިތުންގައި ޝާއިޢުކުރުމަށް އާރޓިކަލް ހުށަހަޅާ." />
      </Helmet>
      <DhivehiHeader />

      <main className="max-w-4xl mx-auto px-4 py-10 md:py-14">
        <div className="bg-[#103820] text-white rounded-sm px-6 py-8 md:px-10 mb-8 text-right">
          <h1 className="font-thaana thaana-headline text-2xl md:text-3xl font-bold leading-relaxed">
            'ރައްޔިތުން'ގައި އާރޓިކަލް ޕަބްލިޝް ކުރއްވުމަށް:
          </h1>
        </div>

        <div className="bg-white border border-[#E5E7E2] rounded-sm p-6 md:p-8 shadow-sm">
          {sent ? (
            <div className="text-center py-10">
              <h2 className="font-thaana thaana-headline text-xl font-bold text-[#142820] mb-3">ޝުކުރިއްޔާ!</h2>
              <p className="font-thaana text-[#6B756E]">ތިޔަ ހުށަހެޅި އާރޓިކަލް ރައްޔިތުންގެ އެޑިޓޯރިއަލް ޓީމަށް ލިބިއްޖެ.</p>
              <button type="button" onClick={() => setSent(false)} className="mt-6 border border-[#103820] px-5 py-2 text-sm font-thaana text-[#103820] hover:bg-[#103820] hover:text-white">
                އެހެން އާރޓިކަލެއް ހުށަހަޅާ
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="submission-name" className={labelClass}>ނަން</label>
                  <input id="submission-name" required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className={`${inputClass} text-right`} />
                </div>
                <div>
                  <label htmlFor="submission-address" className={labelClass}>އެޑްރެސް</label>
                  <input id="submission-address" required value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} className={`${inputClass} text-right`} />
                </div>
                <div>
                  <label htmlFor="submission-email" className={labelClass}>އިމެއިލް</label>
                  <input id="submission-email" required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className={`${inputClass} text-left`} dir="ltr" />
                </div>
                <div>
                  <label htmlFor="submission-phone" className={labelClass}>ފޯން</label>
                  <input id="submission-phone" required value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} className={`${inputClass} text-left`} dir="ltr" />
                </div>
              </div>

              <div>
                <label htmlFor="submission-content" className={labelClass}>ލިޔުއްވާ</label>
                <textarea id="submission-content" required rows={12} value={form.content} onChange={(event) => setForm({ ...form, content: event.target.value })} className={`${inputClass} resize-y text-right thaana-body leading-loose`} />
              </div>

              <div>
                <label htmlFor="submission-photo" className={labelClass}>ފޮޓޯ އަޕްލޯޑް</label>
                <label htmlFor="submission-photo" className="flex cursor-pointer items-center justify-center gap-3 border border-dashed border-[#AEB8B1] bg-[#F8F8F8] px-4 py-6 text-sm text-[#526159] transition-colors hover:border-[#103820] hover:text-[#103820] font-thaana">
                  <ImagePlusIcon size={20} />
                  <span>{photo ? photo.name : "ފޮޓޯއެއް ހޮވާ"}</span>
                </label>
                <input id="submission-photo" type="file" accept="image/*" className="sr-only" onChange={(event) => setPhoto(event.target.files?.[0] ?? null)} />
                <p className="mt-1 text-xs text-[#6B756E] font-thaana">10MB އަށްވުރެ ކުޑަ ފޮޓޯއެއް</p>
              </div>

              <button type="submit" disabled={loading} className="w-full bg-[#103820] text-white py-3 rounded-sm text-sm font-bold hover:bg-[#183028] transition-colors disabled:opacity-60 font-thaana">
                {loading ? "ފޮނުވަނީ..." : "އާރޓިކަލް ހުށަހަޅާ"}
              </button>
            </form>
          )}
        </div>
      </main>

      <DhivehiFooter />
    </div>
  );
}
