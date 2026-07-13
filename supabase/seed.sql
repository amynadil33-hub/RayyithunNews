-- ============================================================
-- RAYYITHUN — Seed Data
-- Run AFTER schema.sql and rls.sql
-- ============================================================

-- ============================================================
-- PORTALS
-- ============================================================
INSERT INTO public.portals (id, name, slug, language_code, direction, is_active) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Dhivehi', 'dhivehi', 'dv', 'rtl', true),
  ('00000000-0000-0000-0000-000000000002', 'English', 'english', 'en', 'ltr', true)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- CATEGORIES — English Portal
-- ============================================================
INSERT INTO public.categories (portal_id, name, slug, description, sort_order) VALUES
  ('00000000-0000-0000-0000-000000000002', 'News', 'news', 'Latest news from the Maldives', 1),
  ('00000000-0000-0000-0000-000000000002', 'Education', 'education', 'Education news and updates', 2),
  ('00000000-0000-0000-0000-000000000002', 'Business', 'business', 'Business and economy', 3),
  ('00000000-0000-0000-0000-000000000002', 'Religion', 'religion', 'Islamic affairs and religion', 4),
  ('00000000-0000-0000-0000-000000000002', 'Innovation', 'innovation', 'Technology and innovation', 5),
  ('00000000-0000-0000-0000-000000000002', 'World', 'world', 'International news', 6),
  ('00000000-0000-0000-0000-000000000002', 'Citizen', 'citizen', 'Community and citizen stories', 7),
  ('00000000-0000-0000-0000-000000000002', 'Market', 'market', 'Market and trade updates', 8),
  ('00000000-0000-0000-0000-000000000002', 'Podcast', 'podcast', 'Audio stories and conversations', 9)
ON CONFLICT DO NOTHING;

-- ============================================================
-- CATEGORIES — Dhivehi Portal
-- ============================================================
INSERT INTO public.categories (portal_id, name, slug, description, sort_order) VALUES
  ('00000000-0000-0000-0000-000000000001', 'ހަބަރު', 'dv-news', 'ދިވެހިރާއްޖޭގެ އެންމެ ފަހުގެ ހަބަރު', 1),
  ('00000000-0000-0000-0000-000000000001', 'ތަޢުލީމް', 'dv-education', 'ތަޢުލީމީ ހަބަރާއި މަޢުލޫމާތު', 2),
  ('00000000-0000-0000-0000-000000000001', 'ވިޔަފާރި', 'dv-business', 'ވިޔަފާރި އަދި އިޤްތިސާދު', 3),
  ('00000000-0000-0000-0000-000000000001', 'ތެދުމަގު', 'dv-religion', 'ދީނީ ކަންތައްތައް', 4),
  ('00000000-0000-0000-0000-000000000001', 'އުފެއްދުންތެރިކަން', 'dv-innovation', 'ޓެކްނޮލޮޖީ އަދި ނަވައިދާ', 5),
  ('00000000-0000-0000-0000-000000000001', 'ދުނިޔެ', 'dv-world', 'ބައިނަލްއަޤްވާމީ ހަބަރު', 6),
  ('00000000-0000-0000-0000-000000000001', 'ރައްޔިތުން', 'dv-citizen', 'ރައްޔިތުންގެ ވާހަކަ', 7),
  ('00000000-0000-0000-0000-000000000001', 'ބާޒާރު', 'dv-market', 'ތިޔަ ބާޒާރުގެ ހަލަތު', 8)
ON CONFLICT DO NOTHING;

-- ============================================================
-- ENGLISH ARTICLES (sample — replace images with real CDN URLs)
-- ============================================================
INSERT INTO public.articles (
  portal_id, category_id, title, slug, excerpt, content,
  featured_image_url, status, is_featured, is_trending, is_breaking,
  read_time, published_at
)
SELECT
  '00000000-0000-0000-0000-000000000002',
  c.id,
  a.title, a.slug, a.excerpt, a.content,
  a.img, 'published', a.featured, a.trending, a.breaking,
  a.read_time, NOW() - (a.days_ago || ' days')::INTERVAL
FROM (VALUES
  ('Parliament Approves Climate Adaptation Budget for 2026',
   'parliament-approves-climate-adaptation-budget-2026',
   'The People''s Majlis has approved a record MVR 2.3 billion budget for climate adaptation projects, focusing on coastal protection and renewable energy across inhabited islands.',
   '<p>The People''s Majlis convened in a historic session on Tuesday and approved a record MVR 2.3 billion budget for climate adaptation projects across the Maldives. The landmark budget focuses on coastal protection, renewable energy deployment, and sustainable water management across all inhabited islands.</p><p>Minister of Environment Dr. Ibrahim Rasheed praised the decision, calling it a critical step in securing the long-term future of island communities. The budget allocates funds for seawall construction on 28 vulnerable islands, solar energy installations, and desalination plants.</p><p>Opposition members supported the bill with minor amendments, signaling rare bipartisan cooperation on environmental policy. Implementation is expected to begin in the third quarter of 2026.</p>',
   'https://images.unsplash.com/photo-1573167507387-6b4b98cb7c13?w=800&auto=format',
   true, true, true, 4, 1, 'news'),
  ('Tourist Arrivals Hit Record High in Second Quarter of 2026',
   'tourist-arrivals-record-high-q2-2026',
   'The Maldives welcomed over 500,000 tourists in Q2 2026, surpassing all previous records and signaling a strong recovery for the tourism sector.',
   '<p>The Maldives Tourism Ministry announced that tourist arrivals reached an all-time quarterly high of 512,400 visitors between April and June 2026, a 14% increase compared to the same period last year.</p><p>Europe remained the top source market, with the United Kingdom, Germany, and Italy leading arrivals. The Asia-Pacific region showed the fastest growth, with visitors from India and China increasing by 28%.</p><p>Tourism Minister Ahmed Waheed noted that the government''s targeted marketing campaigns and new direct flight routes contributed significantly to the record figures. The sector now contributes approximately 28% of GDP.</p>',
   'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&auto=format',
   true, true, false, 3, 2, 'news'),
  ('New Scholarship Program Opens for Island Students',
   'new-scholarship-program-island-students-2026',
   'The Ministry of Education has launched a new scholarship program providing 200 full scholarships for students from outer islands to pursue higher education.',
   '<p>The Ministry of Education on Wednesday launched the Island Futures Scholarship Program, offering 200 fully-funded scholarships for students from outer atolls to pursue degree programs at Maldives National University and partner institutions abroad.</p><p>The program targets students from families earning below MVR 15,000 per month and covers tuition, accommodation, and a monthly stipend. Applications open on July 15 and close on August 31.</p><p>Education Minister Aminath Shakila encouraged all eligible students to apply, emphasising that education is the foundation of national development.</p>',
   'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&auto=format',
   false, true, false, 3, 3, 'education'),
  ('Local Entrepreneurs Explore Digital Payment Solutions',
   'local-entrepreneurs-digital-payment-solutions',
   'A new initiative by the Maldives Business Hub is helping small businesses adopt digital payment technologies to improve financial inclusion.',
   '<p>The Maldives Business Hub launched a 12-week Digital Payments Accelerator programme this week, bringing together 35 small business owners from across the atolls to learn about and implement digital payment systems.</p><p>The programme, supported by the Central Bank of Maldives (MMA), covers mobile payment integration, digital bookkeeping, and e-commerce readiness. Participants will receive hands-on training and mentorship from financial technology experts.</p><p>MMA Governor Ali Hashim noted that digital payment adoption among small businesses has grown by 40% over the past two years, with the new programme expected to accelerate that trend further.</p>',
   'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&auto=format',
   false, false, false, 4, 4, 'business'),
  ('Maldives Schools Introduce Innovation Labs',
   'maldives-schools-innovation-labs',
   'Fifteen schools across the Maldives will receive state-of-the-art innovation labs equipped with robotics and coding tools under a new government programme.',
   '<p>The Ministry of Education announced Thursday that fifteen schools across six atolls will receive fully-equipped Innovation Labs as part of the National STEM Strategy 2026–2030. Each lab will include robotics kits, 3D printers, coding workstations, and digital fabrication tools.</p><p>The programme, funded jointly by the government and a regional development partner, aims to foster critical thinking and technological problem-solving skills among students aged 10 to 18.</p><p>Schools selected for the first phase include institutions in Addu City, Fuvahmulah, Laamu Atoll, and the Greater Male'' Region. Remaining schools will be added in two subsequent phases through 2028.</p>',
   'https://images.unsplash.com/photo-1562774053-701939374585?w=800&auto=format',
   false, false, false, 3, 5, 'education'),
  ('Community Volunteers Lead Island Cleanup Program',
   'community-volunteers-island-cleanup-program',
   'Over 1,200 volunteers participated in the National Coastal Cleanup Week, collecting more than 8 tonnes of waste from beaches across the Maldives.',
   '<p>National Coastal Cleanup Week concluded on Sunday with an impressive turnout of more than 1,200 volunteers across 42 islands. In total, participants collected 8.3 tonnes of plastic waste, fishing gear, and debris from coastlines.</p><p>The event was coordinated by the Environmental Protection Agency (EPA) in partnership with local island councils, dive schools, and youth clubs. Volunteers sorted waste on-site for recycling and proper disposal.</p><p>EPA Director General Mariyam Shareef expressed gratitude to all participants and called for stronger regulations on single-use plastics in the upcoming legislative session.</p>',
   'https://images.unsplash.com/photo-1526951521990-620dc14c214b?w=800&auto=format',
   false, false, false, 3, 6, 'citizen'),
  ('Maldives Business Confidence Improves in First Half',
   'maldives-business-confidence-improves-h1-2026',
   'The latest Business Confidence Index report shows a significant improvement in SME and corporate optimism for the second half of 2026.',
   '<p>The Maldives Chamber of Commerce and Industry (MCCI) released its mid-year Business Confidence Index report, showing a 12-point increase to 68 out of 100 — the highest reading since the index was established in 2021.</p><p>The improvement is attributed to stable fuel prices, tourism sector growth, and improved government payment timelines to contractors. SME confidence showed the largest gain, rising 15 points to 64.</p><p>MCCI President Ibrahim Faisal said the results suggest cautious optimism, while noting that rising import costs and infrastructure bottlenecks remain key concerns for businesses outside Male''.</p>',
   'https://images.unsplash.com/photo-1444653614773-995cb1ef9efa?w=800&auto=format',
   false, true, false, 4, 7, 'business'),
  ('Coral Restoration Project Shows Promising Results in Baa Atoll',
   'coral-restoration-baa-atoll-results',
   'Scientists report that coral transplant nurseries in Baa Atoll have achieved a 78% survival rate, offering hope for reef recovery across the archipelago.',
   '<p>Marine biologists from the Maldives Marine Research Institute (MMRI) reported this week that coral restoration efforts in Baa Atoll UNESCO Biosphere Reserve have achieved a 78% survival rate across 14 transplant nurseries established since 2024.</p><p>The project, which uses coral fragment gardening techniques, has restored approximately 2,400 square meters of degraded reef. Researchers noted that branching coral species such as Acropora and Pocillopora have shown the highest recovery rates.</p><p>MMRI Director Dr. Ahmed Naeem called the results encouraging, noting that continued investment in reef restoration is critical as ocean temperatures continue to rise.</p>',
   'https://images.unsplash.com/photo-1546026423-cc4642628d2b?w=800&auto=format',
   false, true, false, 5, 8, 'news'),
  ('Market Watch: Local Businesses Prepare for Peak Season',
   'market-watch-local-businesses-peak-season-2026',
   'Small business owners across Male'' and resort islands are ramping up stock and services ahead of the expected surge in tourist spending this quarter.',
   '<p>As the tourism peak season approaches, small business owners across the Maldives are preparing for a busy period. Retailers in Male'' report increasing stock levels by up to 30%, while boat charter operators and water sports businesses on resort islands are hiring additional seasonal staff.</p><p>At the Central Market in Male'', vendors say demand for fresh produce, dried fish, and local crafts is already picking up. Many have invested in digital payment terminals and social media marketing for the first time.</p><p>The Business Centre of the Maldives projects that consumer spending in the local market will increase by 18% during the peak season, driven by both tourism and strong domestic demand.</p>',
   'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&auto=format',
   false, false, false, 4, 9, 'market')
) AS a(title, slug, excerpt, content, img, featured, trending, breaking, read_time, days_ago, cat_slug)
JOIN public.categories c ON c.slug = a.cat_slug AND c.portal_id = '00000000-0000-0000-0000-000000000002'
ON CONFLICT DO NOTHING;

-- ============================================================
-- DHIVEHI ARTICLES (sample)
-- ============================================================
INSERT INTO public.articles (
  portal_id, category_id, title, slug, excerpt, content,
  featured_image_url, status, is_featured, is_trending, is_breaking,
  read_time, published_at
)
SELECT
  '00000000-0000-0000-0000-000000000001',
  c.id,
  a.title, a.slug, a.excerpt, a.content,
  a.img, 'published', a.featured, a.trending, a.breaking,
  a.read_time, NOW() - (a.days_ago || ' days')::INTERVAL
FROM (VALUES
  ('ދިވެހިރާއްޖޭގެ ތިމާވެށި ހިމާޔަތްކުރުމަށް ތާރީޚީ ބަޖެޓެއް ފާސްވެއްޖެ',
   'dv-parliament-climate-budget-2026',
   'ރައްޔިތުންގެ މަޖިލީހުން ތިމާވެށި ހިމާޔަތްކުރުމަށް 2.3 ބިލިއަން ރުފިޔާގެ ބޮޑު ބަޖެޓެއް ފާސްކޮށްފިއެވެ.',
   '<p>ރައްޔިތުންގެ މަޖިލީހުން ތިމާވެށި ހިމާޔަތްކުރުމަށްޓަކައި 2.3 ބިލިއަން ރުފިޔާގެ ތާރީހީ ބަޖެޓެއް ފާސްކޮށްފިއެވެ. މި ބަޖެޓް ހޭދަ ކުރެވިގެންދާނީ ތޮށިގަނޑު ރަނގަޅުކުުރުމާއި، ހަކަތައިގެ ދާއިރާ ތަރައްޤީ ކުރުމާއި، ފެނާ ނަރުދަމާ ނިޒާމު ހަރުދަނާ ކުރުމަށެވެ.</p>',
   'https://images.unsplash.com/photo-1573167507387-6b4b98cb7c13?w=800&auto=format',
   true, true, true, 4, 1, 'dv-news'),
  ('ޓޫރިޒަމް ދާއިރާ: 2026 ދެވަނަ ކުއާޓަރުގައި ރިކޯޑު ޢަދަދެއްގެ ފަތުރުވެރިން ޒިޔާރަތްކޮށްފި',
   'dv-tourist-arrivals-record-2026',
   'ފާއިތުވި ދެ ވަނަ ކްއާޓަރުުގައި ރިކޯޑު ގޮތެއްގައި 512,000 ފަތުރުވެރިން ދިވެހިރާއްޖެ ވަޑައިގެންފިއެވެ.',
   '<p>ޓޫރިޒަމް މިނިސްޓްރީ ހާމަ ކުުރި ތަފާސް ހިސާބުން ދައްކާ ގޮތުގައި 2026 ވަނަ އަހަރުގެ ދެ ވަނަ ކްއާޓަރުުގައި 512,400 ފަތުރުވެރިން ދިވެހިރާއްޖެ ޒިޔާރަތްކޮށްފިއެވެ. ގިނަ ފަތުރުވެރިން ޔޫރަޕްގެ ހިސާބުތަކުން ދިވެހިރާއްޖެ ވަޑައިގެންފައިވެ.</p>',
   'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&auto=format',
   true, true, false, 3, 2, 'dv-news'),
  ('ރަށްފުުށުުގެ ދަރިވަރުންނަށް ސްކޮލަރޝިޕްގެ ފުުރުސަތު ހުޅުުވާލައިފި',
   'dv-scholarship-island-students-2026',
   'ތަޢުލީމު މިނިސްޓްރީން 200 ފުުލް ސްކޮލަރޝިޕް ދެ ރަށްފުުށުުގެ ދަރިވަރުންނަށް ދިނުުމުގެ ޕްރޮގްރާމެއް ތަޢާރުފުކޮށްފިއެވެ.',
   '<p>ތަޢުލީމު މިނިސްޓްރީން 200 ފުުލް ސްކޮލަރޝިޕް ދިނުުމަށް "ރަށި ފުތުުރީ" ޕްރޮގްރާމް ތަޢާރުފްކޮށްފިއެވެ. ދިރިއުޅުުމުގެ ހާލަތު ދަތި ދަރިވަރުންނަށް ޙާއްސަ ކުރެވިފައިވައ ިިމި ދަ ތި ހިލޭ ތަޢުލީމީ ފުުރުސަތަށް ޝcortisol ކިތައްސް ކިތިއްށައިވަ.</p>',
   'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&auto=format',
   false, false, false, 3, 3, 'dv-education'),
  ('ކުދި ވިޔަފާރިތަކަށް ޑިޖިޓަލް ފައިސާ ދެއްކުުމުގެ ނިޒާމު ތަޢާރަފްކުުރުުމަށް ތަމްރީން',
   'dv-digital-payments-sme',
   'ދިވެހި ވިޔަފާރިވެރިންނަށް ޑިޖިޓަލް ޕޭމަންޓް ނިޒާމެއް ތަޢާރަފްކުުރުުމަށް ޕްރޮގްރާމެއް ބލ ެ .ހ.',
   '<p>ދިވެހި ވިޔަފާރި ހAbout ނ ބ ލ 35 ވިއ ތ ދ ތ ތ ތ ތ ތ ތ ތ ތ. ތ ތ ތ ތ ތ ތ ތ ތ ތ ތ.</p>',
   'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&auto=format',
   false, false, false, 3, 4, 'dv-business')
) AS a(title, slug, excerpt, content, img, featured, trending, breaking, read_time, days_ago, cat_slug)
JOIN public.categories c ON c.slug = a.cat_slug AND c.portal_id = '00000000-0000-0000-0000-000000000001'
ON CONFLICT DO NOTHING;

-- ============================================================
-- PODCASTS
-- ============================================================
INSERT INTO public.podcasts (portal_id, title, slug, description, host, duration, status, published_at, cover_image_url)
VALUES
  ('00000000-0000-0000-0000-000000000002',
   'The Future of Island Communities',
   'future-island-communities',
   'We speak with urban planners, community leaders, and young entrepreneurs about what the future holds for Maldivian island communities in the era of climate change and digital connectivity.',
   'Ahmed Niyaz',
   '42:15',
   'published',
   NOW() - INTERVAL '5 days',
   'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=400&auto=format'),
  ('00000000-0000-0000-0000-000000000002',
   'Women in the Maldivian Workforce',
   'women-maldivian-workforce',
   'A conversation with three inspiring women leading change in the private sector, education, and public service.',
   'Fathimath Laila',
   '38:40',
   'published',
   NOW() - INTERVAL '12 days',
   'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&auto=format'),
  ('00000000-0000-0000-0000-000000000002',
   'Ocean Economy: Beyond Tourism',
   'ocean-economy-beyond-tourism',
   'Experts discuss how the Maldives can diversify its ocean-based economy through aquaculture, marine biotech, and sustainable fisheries.',
   'Ibrahim Shahid',
   '51:20',
   'published',
   NOW() - INTERVAL '20 days',
   'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&auto=format')
ON CONFLICT DO NOTHING;

-- ============================================================
-- STATIC PAGES
-- ============================================================
INSERT INTO public.static_pages (portal_id, title, slug, content, seo_title, seo_description, status) VALUES
  ('00000000-0000-0000-0000-000000000002',
   'About RAYYITHUN',
   'about',
   '<h2>About RAYYITHUN</h2><p>RAYYITHUN is an independent digital news portal dedicated to delivering accurate, fair, and timely journalism for the people of the Maldives and the Maldivian diaspora worldwide.</p><p>Founded with the belief that informed citizens build stronger communities, RAYYITHUN covers politics, economy, education, culture, and the environment with depth and integrity.</p><p>Our team of experienced journalists and editors work tirelessly to bring you stories that matter — from the corridors of Parliament to the shores of the outer islands.</p><h3>Our Mission</h3><p>To be the most trusted source of news and information for Maldivians everywhere, reporting with accuracy, independence, and civic responsibility.</p><h3>Our Values</h3><ul><li>Truth and accuracy above all</li><li>Independence from political and commercial pressure</li><li>Respect for all communities across the archipelago</li><li>Commitment to the public interest</li></ul>',
   'About Us — RAYYITHUN',
   'Learn about RAYYITHUN, the Maldives'' independent digital news portal.',
   'published'),
  ('00000000-0000-0000-0000-000000000002',
   'Privacy Policy',
   'privacy',
   '<h2>Privacy Policy</h2><p>Last updated: July 2026</p><p>RAYYITHUN is committed to protecting your privacy. This policy explains how we collect, use, and safeguard your personal information when you use our website.</p><h3>Information We Collect</h3><p>We may collect your name and email address when you subscribe to our newsletter or submit a contact form. We also collect anonymised usage data through analytics tools to improve our service.</p><h3>How We Use Your Information</h3><p>Your information is used solely to communicate news updates and respond to your enquiries. We do not sell your personal data to third parties.</p><h3>Cookies</h3><p>Our website uses cookies for analytics and user experience purposes. You may disable cookies in your browser settings.</p><h3>Contact</h3><p>For privacy-related enquiries, please contact us at privacy@rayyithun.mv</p>',
   'Privacy Policy — RAYYITHUN',
   'Read the RAYYITHUN privacy policy.',
   'published'),
  ('00000000-0000-0000-0000-000000000002',
   'Terms of Service',
   'terms',
   '<h2>Terms of Service</h2><p>Last updated: July 2026</p><p>By accessing RAYYITHUN, you agree to the following terms and conditions.</p><h3>Content</h3><p>All content on RAYYITHUN is protected by copyright. You may share our articles with proper attribution but may not reproduce them in full without written permission.</p><h3>User Conduct</h3><p>Users must not attempt to disrupt or damage the website, post unlawful content, or misrepresent their identity.</p><h3>Disclaimer</h3><p>RAYYITHUN strives for accuracy but does not warrant that all content is free of error. News content reflects the state of knowledge at the time of publication.</p><h3>Contact</h3><p>For terms-related enquiries, contact legal@rayyithun.mv</p>',
   'Terms of Service — RAYYITHUN',
   'Read the RAYYITHUN terms of service.',
   'published')
ON CONFLICT DO NOTHING;
