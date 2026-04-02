import { ROUTES } from "@/config/routes";
import { Helmet } from "react-helmet-async";
import { matchPath, useLocation } from "react-router-dom";

type RouteSeoConfig = {
  pattern: string;
  title: string;
  description: string;
  indexable: boolean;
};

const SITE_NAME = "AgriConnect";
const SITE_URL = (import.meta.env.VITE_SITE_URL ?? "https://agriconnect-livid.vercel.app").replace(/\/+$/, "");
const GSC_VERIFICATION = import.meta.env.VITE_GSC_VERIFICATION ?? "";
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;

const routeSeoConfig: RouteSeoConfig[] = [
  {
    pattern: ROUTES.root,
    title: "AgriConnect: AI Farm Marketplace for Fresh Produce",
    description:
      "Buy fresh produce directly from farmers and use AI crop diagnosis on AgriConnect. Fast farm-to-home delivery, transparent pricing, and trusted sellers.",
    indexable: true,
  },
  {
    pattern: ROUTES.getStarted,
    title: "Get Started with AgriConnect for Farmers and Buyers",
    description:
      "Join AgriConnect as a farmer or customer. Start selling farm products, discovering verified produce, and using AI-powered crop support in minutes.",
    indexable: true,
  },
  {
    pattern: ROUTES.auth.farmerLogin,
    title: "Farmer Login | AgriConnect",
    description: "Secure farmer login for AgriConnect. Manage listings, orders, diagnostics, and profile details in one dashboard.",
    indexable: false,
  },
  {
    pattern: ROUTES.auth.farmerSignup,
    title: "Farmer Sign Up | AgriConnect",
    description: "Create a farmer account on AgriConnect to sell produce, reach customers directly, and monitor your farm business performance.",
    indexable: false,
  },
  {
    pattern: ROUTES.auth.customerLogin,
    title: "Customer Login | AgriConnect",
    description: "Secure customer login for AgriConnect. View orders, manage your cart, and buy fresh farm products from verified sellers.",
    indexable: false,
  },
  {
    pattern: ROUTES.auth.customerSignup,
    title: "Customer Sign Up | AgriConnect",
    description: "Create your AgriConnect customer account and start shopping farm-fresh produce with direct farmer connections and easy tracking.",
    indexable: false,
  },
  {
    pattern: ROUTES.farmer.home,
    title: "Farmer Dashboard | AgriConnect",
    description: "Track farm business insights, listing performance, and order activity from your AgriConnect farmer dashboard.",
    indexable: false,
  },
  {
    pattern: ROUTES.farmer.sell,
    title: "Sell Produce Online | AgriConnect Farmer",
    description: "Create and publish produce listings, set prices, and manage stock quickly from AgriConnect farmer selling tools.",
    indexable: false,
  },
  {
    pattern: ROUTES.farmer.market,
    title: "Farmer Marketplace View | AgriConnect",
    description: "Review live market listings and pricing context to optimize your selling strategy on the AgriConnect marketplace.",
    indexable: false,
  },
  {
    pattern: `${ROUTES.farmer.market}/:productId`,
    title: "Farmer Product Details | AgriConnect",
    description: "View detailed product information, quality tags, and related items in your AgriConnect farmer marketplace.",
    indexable: false,
  },
  {
    pattern: ROUTES.farmer.myProducts,
    title: "My Product Listings | AgriConnect Farmer",
    description: "Manage your farm product catalog, stock levels, and listing quality from one AgriConnect product management screen.",
    indexable: false,
  },
  {
    pattern: ROUTES.farmer.chats,
    title: "Farmer Chats | AgriConnect",
    description: "Chat with customers per order and respond quickly from your AgriConnect farmer inbox.",
    indexable: false,
  },
  {
    pattern: ROUTES.farmer.orders,
    title: "Farmer Orders Management | AgriConnect",
    description: "Track incoming customer orders, update statuses, and respond faster using AgriConnect farmer order tools.",
    indexable: false,
  },
  {
    pattern: ROUTES.farmer.diagnosis,
    title: "AI Crop Diagnosis Tool | AgriConnect Farmer",
    description: "Upload crop images and detect plant issues with AgriConnect AI diagnosis to improve farm health decisions.",
    indexable: false,
  },
  {
    pattern: ROUTES.farmer.articles,
    title: "Farmer Guides and Tips | AgriConnect",
    description: "Read practical farming guides and market tips on AgriConnect to improve yield, quality, and profitability.",
    indexable: false,
  },
  {
    pattern: ROUTES.farmer.profile,
    title: "Farmer Profile Settings | AgriConnect",
    description: "Update your farmer profile, address details, and account information securely inside AgriConnect.",
    indexable: false,
  },
  {
    pattern: ROUTES.customer.home,
    title: "Customer Home Dashboard | AgriConnect",
    description: "Explore curated produce, weather insights, and shopping shortcuts from your AgriConnect customer home dashboard.",
    indexable: false,
  },
  {
    pattern: ROUTES.customer.market,
    title: "Buy Fresh Produce Online | AgriConnect Market",
    description: "Browse farm-fresh fruits and vegetables, compare quality badges, and buy directly from trusted farmers.",
    indexable: false,
  },
  {
    pattern: ROUTES.customer.productDetail,
    title: "Product Details and Farmer Ratings | AgriConnect",
    description: "See product photos, pricing, stock, farmer ratings, and related recommendations before purchase on AgriConnect.",
    indexable: false,
  },
  {
    pattern: ROUTES.customer.wishlist,
    title: "My Wishlist | AgriConnect",
    description: "Save favorite produce and track price-drop notifications with your personalized AgriConnect wishlist.",
    indexable: false,
  },
  {
    pattern: ROUTES.customer.profile,
    title: "Customer Profile Settings | AgriConnect",
    description: "Manage account details, delivery address, and shopping preferences in your AgriConnect customer profile.",
    indexable: false,
  },
  {
    pattern: ROUTES.customer.cart,
    title: "Shopping Cart and Checkout | AgriConnect",
    description: "Review selected produce, update quantities, and complete checkout quickly from your AgriConnect cart.",
    indexable: false,
  },
  {
    pattern: ROUTES.customer.orders,
    title: "My Orders Tracking | AgriConnect",
    description: "Track order status, delivery progress, and purchase history with AgriConnect customer order tracking.",
    indexable: false,
  },
];

const segmentLabelMap: Record<string, string> = {
  farmer: "Farmer",
  customer: "Customer",
  market: "Market",
  orders: "Orders",
  chats: "Chats",
  profile: "Profile",
  cart: "Cart",
  wishlist: "Wishlist",
  diagnosis: "Diagnosis",
  guides: "Guides",
  sell: "Sell",
  login: "Login",
  signup: "Sign Up",
  home: "Home",
  "get-started": "Get Started",
  "my-products": "My Products",
};

const getSeoForPath = (pathname: string): RouteSeoConfig => {
  const matched = routeSeoConfig.find((entry) =>
    Boolean(
      matchPath(
        {
          path: entry.pattern,
          end: true,
        },
        pathname,
      ),
    ),
  );

  if (matched) {
    return matched;
  }

  return {
    pattern: "*",
    title: "Page Not Found | AgriConnect",
    description: "The requested page could not be found on AgriConnect.",
    indexable: false,
  };
};

const buildBreadcrumbSchema = (pathname: string) => {
  const parts = pathname.split("/").filter(Boolean);
  const itemListElement = [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: `${SITE_URL}/`,
    },
  ];

  let cumulativePath = "";

  parts.forEach((segment, index) => {
    cumulativePath += `/${segment}`;
    const label = segmentLabelMap[segment] ?? segment.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

    itemListElement.push({
      "@type": "ListItem",
      position: index + 2,
      name: label,
      item: `${SITE_URL}${cumulativePath}`,
    });
  });

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement,
  };
};

const SeoManager = () => {
  const { pathname } = useLocation();
  const seo = getSeoForPath(pathname);
  const canonicalUrl = `${SITE_URL}${pathname === "/" ? "/" : pathname}`;

  const robots = seo.indexable ? "index,follow,max-image-preview:large" : "noindex,nofollow";

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: DEFAULT_OG_IMAGE,
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/customer/market?search={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  const breadcrumbSchema = buildBreadcrumbSchema(pathname);

  return (
    <Helmet prioritizeSeoTags>
      <html lang="en" />
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />
      <meta name="robots" content={robots} />
      <link rel="canonical" href={canonicalUrl} />

      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={seo.title} />
      <meta property="og:description" content={seo.description} />
      <meta property="og:image" content={DEFAULT_OG_IMAGE} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content="website" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seo.title} />
      <meta name="twitter:description" content={seo.description} />
      <meta name="twitter:image" content={DEFAULT_OG_IMAGE} />

      {GSC_VERIFICATION ? <meta name="google-site-verification" content={GSC_VERIFICATION} /> : null}

      <script type="application/ld+json">{JSON.stringify(organizationSchema)}</script>
      <script type="application/ld+json">{JSON.stringify(websiteSchema)}</script>
      <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
    </Helmet>
  );
};

export default SeoManager;
