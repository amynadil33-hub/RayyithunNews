import { BrowserRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { DefaultProviders } from "./components/providers/default.tsx";
import { AdminAuthProvider } from "./hooks/use-admin-auth.tsx";
import ScrollToTop from "./components/shared/ScrollToTop.tsx";

// English Portal
import EnglishHome from "./pages/english/Home.tsx";
import EnglishCategory from "./pages/english/Category.tsx";
import EnglishArticle from "./pages/english/Article.tsx";
import EnglishSearch from "./pages/english/Search.tsx";
import EnglishContact from "./pages/english/Contact.tsx";
import EnglishAdvertise from "./pages/english/Advertise.tsx";
import EnglishPodcast from "./pages/english/Podcast.tsx";
import EnglishStaticPage from "./pages/english/StaticPage.tsx";

// Dhivehi Portal
import DhivehiHome from "./pages/dhivehi/Home.tsx";
import DhivehiCategory from "./pages/dhivehi/Category.tsx";
import DhivehiArticle from "./pages/dhivehi/Article.tsx";
import DhivehiContact from "./pages/dhivehi/Contact.tsx";
import DhivehiAdvertise from "./pages/dhivehi/Advertise.tsx";
import DhivehiPodcast from "./pages/dhivehi/Podcast.tsx";

// Admin
import AdminLogin from "./pages/admin/Login.tsx";
import AdminDashboard from "./pages/admin/Dashboard.tsx";
import AdminArticles from "./pages/admin/Articles.tsx";
import AdminArticleEdit from "./pages/admin/ArticleEdit.tsx";
import AdminCategories from "./pages/admin/Categories.tsx";
import AdminMedia from "./pages/admin/Media.tsx";
import AdminAds from "./pages/admin/Advertisements.tsx";
import AdminPodcasts from "./pages/admin/Podcasts.tsx";
import AdminPages from "./pages/admin/Pages.tsx";
import AdminContactMessages from "./pages/admin/ContactMessages.tsx";
import AdminInquiries from "./pages/admin/AdvertiserInquiries.tsx";
import AdminNewsletter from "./pages/admin/Newsletter.tsx";
import AdminUsers from "./pages/admin/Users.tsx";
import AdminSettings from "./pages/admin/Settings.tsx";
import AdminLayout from "./pages/admin/AdminLayout.tsx";

import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 1000 * 60 * 2 },
  },
});

export default function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <AdminAuthProvider>
          <DefaultProviders>
            <BrowserRouter>
              <ScrollToTop />
              <Routes>
                {/* Dhivehi Portal (root) */}
                <Route path="/" element={<DhivehiHome />} />
                <Route path="/article/:slug" element={<DhivehiArticle />} />
                <Route path="/contact" element={<DhivehiContact />} />
                <Route path="/advertise" element={<DhivehiAdvertise />} />
                <Route path="/podcast" element={<DhivehiPodcast />} />
                <Route path="/:category" element={<DhivehiCategory />} />

                {/* English Portal */}
                <Route path="/en" element={<EnglishHome />} />
                <Route path="/en/article/:slug" element={<EnglishArticle />} />
                <Route path="/en/search" element={<EnglishSearch />} />
                <Route path="/en/contact" element={<EnglishContact />} />
                <Route path="/en/advertise" element={<EnglishAdvertise />} />
                <Route path="/en/podcast" element={<EnglishPodcast />} />
                <Route path="/en/page/:slug" element={<EnglishStaticPage />} />
                <Route path="/en/:category" element={<EnglishCategory />} />

                {/* Admin */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin" element={<AdminLayout />}>
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="articles" element={<AdminArticles />} />
                  <Route path="articles/new" element={<AdminArticleEdit />} />
                  <Route path="articles/edit/:id" element={<AdminArticleEdit />} />
                  <Route path="categories" element={<AdminCategories />} />
                  <Route path="media" element={<AdminMedia />} />
                  <Route path="advertisements" element={<AdminAds />} />
                  <Route path="podcasts" element={<AdminPodcasts />} />
                  <Route path="pages" element={<AdminPages />} />
                  <Route path="contact-messages" element={<AdminContactMessages />} />
                  <Route path="advertiser-inquiries" element={<AdminInquiries />} />
                  <Route path="newsletter" element={<AdminNewsletter />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="settings" element={<AdminSettings />} />
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </DefaultProviders>
        </AdminAuthProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}
