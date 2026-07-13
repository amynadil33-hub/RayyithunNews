import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { getArticleCountByStatus } from "../../services/articles.ts";
import { getAllAds } from "../../services/advertisements.ts";
import { getContactMessages } from "../../services/contact.ts";
import { getAdvertiserInquiries, getNewsletterSubscribers } from "../../services/contact.ts";
import { useAdminAuth } from "../../hooks/use-admin-auth.tsx";
import { Skeleton } from "../../components/ui/skeleton.tsx";
import { NewspaperIcon, MonitorIcon, MailIcon, MegaphoneIcon, SendIcon, PlusIcon } from "lucide-react";

export default function AdminDashboard() {
  const { profile } = useAdminAuth();

  const { data: articleCounts } = useQuery({
    queryKey: ["admin-article-counts"],
    queryFn: getArticleCountByStatus,
  });
  const { data: ads } = useQuery({ queryKey: ["admin-ads"], queryFn: getAllAds });
  const { data: messages } = useQuery({ queryKey: ["admin-messages"], queryFn: getContactMessages });
  const { data: inquiries } = useQuery({ queryKey: ["admin-inquiries"], queryFn: getAdvertiserInquiries });
  const { data: subscribers } = useQuery({ queryKey: ["admin-newsletter"], queryFn: getNewsletterSubscribers });

  const activeAds = ads?.filter((a) => a.is_active).length ?? 0;
  const unreadMessages = messages?.filter((m) => m.status === "unread").length ?? 0;
  const newInquiries = inquiries?.filter((i) => i.status === "new").length ?? 0;
  const activeSubscribers = subscribers?.filter((s) => s.is_active).length ?? 0;

  const CARDS = [
    { label: "Total Articles", value: articleCounts?.total ?? 0, sub: `${articleCounts?.published ?? 0} published`, icon: NewspaperIcon, href: "/admin/articles", color: "bg-[#103820]" },
    { label: "Draft Articles", value: articleCounts?.draft ?? 0, sub: "awaiting review", icon: NewspaperIcon, href: "/admin/articles", color: "bg-[#2D6A4F]" },
    { label: "Active Ads", value: activeAds, sub: `${ads?.length ?? 0} total`, icon: MonitorIcon, href: "/admin/advertisements", color: "bg-[#52B788]" },
    { label: "Unread Messages", value: unreadMessages, sub: `${messages?.length ?? 0} total`, icon: MailIcon, href: "/admin/contact-messages", color: "bg-[#95D5B2]" },
    { label: "Ad Inquiries", value: newInquiries, sub: "new inquiries", icon: MegaphoneIcon, href: "/admin/advertiser-inquiries", color: "bg-[#103820]" },
    { label: "Subscribers", value: activeSubscribers, sub: "newsletter", icon: SendIcon, href: "/admin/newsletter", color: "bg-[#2D6A4F]" },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#142820] font-serif">Dashboard</h1>
          <p className="text-sm text-[#6B756E] mt-0.5">
            Welcome back, {profile?.full_name ?? "Admin"}
          </p>
        </div>
        <Link
          to="/admin/articles/new"
          className="flex items-center gap-2 bg-[#103820] text-white px-4 py-2 rounded-sm text-sm font-medium hover:bg-[#183028] transition-colors"
        >
          <PlusIcon size={15} />
          New Article
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {CARDS.map((card) => (
          <Link key={card.label} to={card.href}
            className="bg-white border border-[#E5E7E2] rounded-sm p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-9 h-9 rounded-sm ${card.color} flex items-center justify-center`}>
                <card.icon size={16} className="text-white" />
              </div>
            </div>
            {articleCounts === undefined && card.label.includes("Article") ? (
              <Skeleton className="h-8 w-16 mb-1" />
            ) : (
              <p className="text-3xl font-bold text-[#142820] font-serif">{card.value}</p>
            )}
            <p className="text-sm font-medium text-[#142820] mt-0.5">{card.label}</p>
            <p className="text-xs text-[#6B756E]">{card.sub}</p>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="bg-white border border-[#E5E7E2] rounded-sm p-5">
        <h2 className="font-semibold text-[#142820] mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "New Article", href: "/admin/articles/new", icon: NewspaperIcon },
            { label: "Upload Media", href: "/admin/media", icon: MonitorIcon },
            { label: "Add Ad", href: "/admin/advertisements", icon: MegaphoneIcon },
            { label: "Add Podcast", href: "/admin/podcasts", icon: MailIcon },
          ].map(({ label, href, icon: Icon }) => (
            <Link key={label} to={href}
              className="flex items-center gap-2 border border-[#E5E7E2] rounded-sm px-3 py-2.5 text-sm text-[#142820] hover:bg-[#F8F8F8] hover:border-[#103820] transition-colors">
              <Icon size={14} className="text-[#103820]" />
              {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
