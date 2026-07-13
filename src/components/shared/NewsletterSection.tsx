import { useState } from "react";
import { useNewsletterSubscribe } from "../../hooks/use-portal-data.ts";
import { toast } from "sonner";

interface NewsletterSectionProps {
  portalId?: string;
  isDhivehi?: boolean;
}

export default function NewsletterSection({ portalId, isDhivehi = false }: NewsletterSectionProps) {
  const [email, setEmail] = useState("");
  const subscribe = useNewsletterSubscribe();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    try {
      await subscribe.mutateAsync({ email: email.trim(), portalId });
      toast.success(isDhivehi ? "ޝުކުރިއްޔާ! ކަލޭ ރެޖިސްޓްރީ ވެއްޖެ." : "Thank you for subscribing!");
      setEmail("");
    } catch {
      toast.error(isDhivehi ? "ނޭނގި ކުށެއް ދިމާވިއެވެ." : "Something went wrong. Please try again.");
    }
  }

  return (
    <section className="bg-[#103820] py-14 px-4">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className={`text-2xl md:text-3xl font-bold text-white mb-2 ${isDhivehi ? "font-thaana thaana-headline" : "font-serif"}`}>
          {isDhivehi ? "ހަބަރު ލިބިލައްވާ" : "Stay Informed"}
        </h2>
        <p className={`text-[#95D5B2] mb-8 text-sm md:text-base ${isDhivehi ? "font-thaana thaana-body" : ""}`}>
          {isDhivehi
            ? "ރައްޔިތުންގެ އެންމެ ފަހުގެ ހަބަރު ތިޔަ ފޯނަށް."
            : "Get the latest stories from RAYYITHUN delivered to your inbox."}
        </p>
        <form onSubmit={handleSubmit} className={`flex flex-col sm:flex-row gap-3 max-w-md mx-auto ${isDhivehi ? "sm:flex-row-reverse" : ""}`}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={isDhivehi ? "ތިޔަ އީ-މެއިލް" : "Your email address"}
            required
            className={`flex-1 px-4 py-2.5 rounded-sm text-sm bg-white text-[#142820] placeholder-[#6B756E] focus:outline-none focus:ring-2 focus:ring-[#52B788] ${isDhivehi ? "text-right font-thaana" : ""}`}
          />
          <button
            type="submit"
            disabled={subscribe.isPending}
            className={`bg-white text-[#103820] font-semibold px-6 py-2.5 rounded-sm text-sm hover:bg-[#D8E8D8] transition-colors disabled:opacity-60 ${isDhivehi ? "font-thaana" : ""}`}
          >
            {subscribe.isPending
              ? (isDhivehi ? "..." : "Subscribing...")
              : (isDhivehi ? "ސަބްސްކްރައިބް" : "Subscribe")}
          </button>
        </form>
      </div>
    </section>
  );
}
