import { Helmet } from "react-helmet-async";
import { PlayCircleIcon } from "lucide-react";
import { format } from "date-fns";
import DhivehiHeader from "../../components/dhivehi/DhivehiHeader.tsx";
import DhivehiFooter from "../../components/dhivehi/DhivehiFooter.tsx";
import NewsletterSection from "../../components/shared/NewsletterSection.tsx";
import { usePodcasts } from "../../hooks/use-portal-data.ts";
import { Skeleton } from "../../components/ui/skeleton.tsx";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "../../components/ui/empty.tsx";

export default function DhivehiPodcast() {
  const { data: podcasts, isLoading, isError } = usePodcasts("dhivehi", 20);

  return (
    <div className="min-h-screen bg-[#F8F8F8]" dir="rtl" lang="dv">
      <Helmet>
        <title>ޕޮޑްކާސްޓް — ރައްޔިތުން</title>
        <meta name="description" content="ރައްޔިތުންގެ ދިވެހި ޕޮޑްކާސްޓް އެޕިސޯޑްތައް." />
        <html lang="dv" dir="rtl" />
      </Helmet>
      <DhivehiHeader />

      <main className="max-w-5xl mx-auto px-4 py-12">
        <div className="border-b-2 border-[#103820] pb-3 mb-8 text-right">
          <h1 className="font-thaana thaana-headline text-3xl font-bold text-[#142820]">ޕޮޑްކާސްޓް</h1>
          <p className="font-thaana text-[#6B756E] mt-1 text-sm">ރާއްޖެ، މުޖުތަމައު، ޘަޤާފަތާއި ވިޔަފާރީގެ މައުޟޫތަކާ ބެހޭ ވާހަކަތައް.</p>
        </div>

        {isLoading ? (
          <div className="space-y-5">
            {Array.from({ length: 3 }).map((_, index) => <Skeleton key={index} className="h-28 w-full" />)}
          </div>
        ) : isError ? (
          <div className="bg-red-50 border border-red-200 p-5 text-sm text-red-700 font-thaana text-center">
            ޕޮޑްކާސްޓް ލޯޑްކުރެވިއްޖެ ނޫން. ފަހުން އަލުން ބައްލަވާ.
          </div>
        ) : podcasts && podcasts.length > 0 ? (
          <div className="space-y-4">
            {podcasts.map((podcast, index) => (
              <article key={podcast.id} className="bg-white border border-[#E5E7E2] rounded-sm p-5 flex flex-col sm:flex-row-reverse gap-5 hover:shadow-sm transition-shadow">
                {podcast.cover_image_url ? (
                  <img src={podcast.cover_image_url} alt={podcast.title} className="w-full sm:w-24 h-40 sm:h-24 object-cover rounded-sm flex-shrink-0" loading="lazy" />
                ) : (
                  <div className="w-full sm:w-24 h-40 sm:h-24 bg-[#D8E8D8] rounded-sm flex-shrink-0 flex items-center justify-center">
                    <span className="font-serif text-[#103820] text-2xl font-bold">{index + 1}</span>
                  </div>
                )}
                <div className="flex-1 min-w-0 text-right">
                  <p className="font-thaana text-xs text-[#6B756E] mb-1">އެޕިސޯޑް {podcasts.length - index}</p>
                  <h2 className="font-thaana thaana-headline font-semibold text-[#142820] text-lg leading-snug mb-1">{podcast.title}</h2>
                  {podcast.description && <p className="font-thaana text-sm text-[#6B756E] leading-relaxed line-clamp-2 mb-3">{podcast.description}</p>}
                  <div className="flex flex-wrap items-center justify-end gap-4 text-xs text-[#6B756E] font-thaana">
                    {podcast.host && <span>{podcast.host}</span>}
                    {podcast.duration && <span className="flex items-center gap-1"><PlayCircleIcon size={12} />{podcast.duration}</span>}
                    {podcast.published_at && <span>{format(new Date(podcast.published_at), "d MMM yyyy")}</span>}
                  </div>
                </div>
                {podcast.audio_url ? (
                  <a href={podcast.audio_url} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 w-10 h-10 rounded-full bg-[#103820] flex items-center justify-center hover:bg-[#183028] transition-colors" aria-label={`އަޑުއަހާ ${podcast.title}`}>
                    <PlayCircleIcon size={20} className="text-white" />
                  </a>
                ) : null}
              </article>
            ))}
          </div>
        ) : (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon"><PlayCircleIcon /></EmptyMedia>
              <EmptyTitle><span className="font-thaana">ދިވެހި އެޕިސޯޑެއް ނެތް</span></EmptyTitle>
              <EmptyDescription><span className="font-thaana">ދިވެހި ޕޯޓަލް ހޮވައި ޕަބްލިޝްކުރާ އެޕިސޯޑްތައް މިތަނުން ފެންނާނެ.</span></EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </main>

      <NewsletterSection portalId="00000000-0000-0000-0000-000000000001" isDhivehi />
      <DhivehiFooter />
    </div>
  );
}
