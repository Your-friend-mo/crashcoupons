const fs = require('fs');
const path = require('path');
const vm = require('vm');

const baseDir = __dirname;
const couponsDataFile = path.join(baseDir, 'assets/front/js/coupons-data.js');
const indexHtmlFile = path.join(baseDir, 'index.html');

const couponsDataCode = fs.readFileSync(couponsDataFile, 'utf8');
const indexHtml = fs.readFileSync(indexHtmlFile, 'utf8');

const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(couponsDataCode, sandbox);

const allCoupons = Object.values(sandbox.window.LOCAL_COUPONS || {});
const allBrands = sandbox.window.LOCAL_BRANDS || {};

// Extract modal overlay markup from index.html
const modalOverlayMatch = indexHtml.match(/<div x-data="" x-show="\$store\.couponModal\.isOpen" class="modal-overlay"[\s\S]*?(?=<!-- Foot Scripts -->|<\/body>)/i);
const modalMarkup = modalOverlayMatch ? modalOverlayMatch[0] : '';

// Extract modal script head
const modalScriptMatch = indexHtml.match(/<script>\s*function getCouponFromUrl\(\)[\s\S]*?<\/script>/i);
let modalScript = modalScriptMatch ? modalScriptMatch[0] : '';
modalScript = modalScript.replace("baseUrl: '.',", "baseUrl: '',");

function escapeHtml(str) {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
    return String(str || '').replace(/[&<>"']/g, c => map[c]);
}

function decodeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'")
        .replace(/&#39;/g, "'")
        .replace(/&apos;/g, "'");
}

function getRandomCount(id, min, max) {
    const seed = ((id * 2654435761) >>> 0) % (max - min + 1);
    return min + seed;
}

// 8 target keywords
const keywordConfigs = [
    {
        keyword: 'crash coupons',
        slug: 'crash-coupons',
        file: 'crash-coupons.html',
        display: 'Crash Coupons',
        title: 'Crash Coupons – Verified Promo Codes & Free Deals | CrashCoupons',
        desc: 'Discover active crash coupons, verified game discount codes, and digital keys on CrashCoupons. Browse hand-tested crash coupons updated daily for maximum savings.',
        startIndex: 0
    },
    {
        keyword: 'www crashcoupons',
        slug: 'www-crashcoupons',
        file: 'www-crashcoupons.html',
        display: 'www Crashcoupons',
        title: 'www Crashcoupons – Verified Deals & Codes | CrashCoupons',
        desc: 'Visit www crashcoupons for verified coupon promo codes, free game keys, and digital discounts. Official www crashcoupons directory updated daily for savings.',
        startIndex: 16
    },
    {
        keyword: 'crashcoupon',
        slug: 'crashcoupon',
        file: 'crashcoupon.html',
        display: 'Crashcoupon',
        title: 'Crashcoupon – Verified Deals & Promo Codes | CrashCoupons',
        desc: 'Find verified crashcoupon codes, free gaming redeem keys, and discounts on CrashCoupons. Discover tested crashcoupon offers updated daily for guaranteed savings.',
        startIndex: 32
    },
    {
        keyword: 'crash coupons com',
        slug: 'crash-coupons-com',
        file: 'crash-coupons-com.html',
        display: 'Crash Coupons Com',
        title: 'Crash Coupons Com – Verified Deals & Codes | CrashCoupons',
        desc: 'Explore crash coupons com for verified promo deals, free game keys, and digital savings. Official crash coupons com discounts hand-tested daily for all gamers.',
        startIndex: 48
    },
    {
        keyword: 'www crashcoupon con',
        slug: 'www-crashcoupon-con',
        file: 'www-crashcoupon-con.html',
        display: 'www Crashcoupon Con',
        title: 'www Crashcoupon Con – Verified Promo Deals | CrashCoupons',
        desc: 'Searching for www crashcoupon con? Find verified promo codes, free game redeem keys, and store discounts. Daily updated www crashcoupon con deals on CrashCoupons.',
        startIndex: 64
    },
    {
        keyword: 'crashcoupons com',
        slug: 'crashcoupons-com',
        file: 'crashcoupons-com.html',
        display: 'Crashcoupons Com',
        title: 'Crashcoupons Com – Verified Codes & Deals | CrashCoupons',
        desc: 'Find verified crashcoupons com promo codes, free game keys, and store discounts on CrashCoupons. Browse tested crashcoupons com deals updated daily for savings.',
        startIndex: 80
    },
    {
        keyword: 'crash coupon',
        slug: 'crash-coupon',
        file: 'crash-coupon.html',
        display: 'Crash Coupon',
        title: 'Crash Coupon – Verified Codes & Promo Deals | CrashCoupons',
        desc: 'Looking for a verified crash coupon? Discover tested crash coupon deals, game keys, and promo discounts updated daily on CrashCoupons for maximum savings.',
        startIndex: 96
    },
    {
        keyword: 'crashcoupons.com',
        slug: 'crashcoupons.com',
        file: 'crashcoupons.com.html',
        display: 'Crashcoupons.com',
        title: 'Crashcoupons.com – Verified Codes & Deals | CrashCoupons',
        desc: 'Welcome to crashcoupons.com for hand-tested coupon codes, digital game keys, and free promo deals. Browse active crashcoupons.com discounts updated daily.',
        startIndex: 112
    }
];

function generateCardHtml(c, kw) {
    const title = escapeHtml(decodeHtml(c.coupon_title || ''));
    const rawBrand = c.brand_name ? decodeHtml(c.brand_name) : '';
    const brandName = escapeHtml(rawBrand);
    const brandSlug = String(rawBrand).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const incent = escapeHtml(decodeHtml(c.coupon_short_incent || 'Free Deal'));
    const shortDesc = escapeHtml(decodeHtml(c.coupon_short_description || ''));
    const rating = Number(c.coupon_rating || 4.9).toFixed(1);
    const bannerSrc = c.coupon_banner ? `/public/${c.coupon_banner}` : '/public/assets/uploads/coupon_banners/coupon_307_fee38f825078c8c1.jpg';
    const brandLogoSrc = c.brand_logo ? `/public/${c.brand_logo}` : '/public/assets/uploads/favicons/favicon_69cbf2b8bcc8e.png';
    const couponsLeft = getRandomCount(c.id, 120, 999);
    const usesToday = getRandomCount(c.id + 77, 12, 89);

    return `
    <div class="col">
        <div class="card h-100 coupon-card coupon-card-standard bg hover:bg-secondary rounded-4 border border-light transition-all shadow-sm">
            <div class="banner-section position-relative">
                <img src="${bannerSrc}" class="card-img-top banner-image" alt="${title} – ${escapeHtml(kw)}" loading="lazy">
                <div class="position-absolute top-0 start-0 m-3">
                    <div class="rating-badge bg-secondary-lightest backdrop-blur-sm rounded-pill d-flex align-items-center gap-1 py-1 px-2">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="14" height="14" class="accent">
                            <path d="M17.286 21.09q -1.69 .001 -5.288 -2.615q -3.596 2.617 -5.288 2.616q -2.726 0 -.495 -6.8q -9.389 -6.775 2.135 -6.775h.076q 1.785 -5.516 3.574 -5.516q 1.785 0 3.574 5.516h.076q 11.525 0 2.133 6.774q 2.23 6.802 -.497 6.8"></path>
                        </svg>
                        <span class="smallest fw-600 text">${rating}</span>
                    </div>
                </div>
                ${c.coupon_badge ? `
                <div class="position-absolute top-0 end-0 m-3">
                    <span class="badge bg-accent text-white rounded-pill px-2 py-1 smallest fw-600">${escapeHtml(decodeHtml(c.coupon_badge))}</span>
                </div>` : ''}
                ${brandLogoSrc ? `
                <div class="brand-logo-wrapper">
                    <a href="/brands/${brandSlug}">
                        <img src="${brandLogoSrc}" alt="${brandName || title}" class="brand-logo" loading="lazy">
                    </a>
                </div>` : ''}
            </div>
            <div class="card-body pt-4">
                <div class="d-flex flex-column h-100">
                    <div class="mb-xl-3 mb-2">
                        <h3 class="card-title h5 fw-600 mb-1">${title}</h3>
                        ${brandName ? `<p class="card-subtitle small text-third mb-0"><a href="/brands/${brandSlug}" class="text-third text-decoration-none hover-accent">${brandName}</a></p>` : ''}
                    </div>
                    <div class="coupon-incentive mt-auto mb-3">
                        <div class="coupon-incentive-inner bg-secondary rounded-3 position-relative overflow-hidden">
                            <div class="incentive-content p-3 text-center position-relative">
                                <span class="incentive-text accent fw-600">${incent}</span>
                                <span class="d-block short-description-text small text fw-600 mt-xl-2 mt-1">${shortDesc}</span>
                            </div>
                            <div class="incentive-circle start"></div>
                            <div class="incentive-circle end"></div>
                        </div>
                    </div>
                    <div class="coupons-remaining-wrapper bg-accent-lightest rounded-5 px-3 py-1 d-inline-flex mx-auto mb-2 align-items-center justify-content-center" data-coupon-id="${c.id}">
                        <div class="d-flex align-items-center gap-sm-2 gap-1 small accent">
                            <svg class="icon-rotate" width="16px" height="16px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M14.005 4H9.99502C6.21439 4 4.32407 4 3.14958 5.17157C2.34091 5.97823 2.08903 7.12339 2.01058 8.98947C1.99502 9.35954 1.98724 9.54458 2.05634 9.66802C2.12545 9.79147 2.40133 9.94554 2.95308 10.2537C3.56586 10.5959 3.98007 11.2497 3.98007 12C3.98007 12.7503 3.56586 13.4041 2.95308 13.7463C2.40133 14.0545 2.12545 14.2085 2.05634 14.332C1.98724 14.4554 1.99502 14.6405 2.01058 15.0105C2.08903 16.8766 2.34091 18.0218 3.14958 18.8284C4.32407 20 6.21439 20 9.99502 20H14.005C17.7856 20 19.6759 20 20.8504 18.8284C21.6591 18.0218 21.911 16.8766 21.9894 15.0105C22.005 14.6405 22.0128 14.4554 21.9437 14.332C21.8746 14.2085 21.5987 14.0545 21.0469 13.7463C20.4341 13.4041 20.0199 12.7503 20.0199 12C20.0199 11.2497 20.4341 10.5959 21.0469 10.2537C21.5987 9.94554 21.8746 9.79147 21.9437 9.66803C22.0128 9.54458 22.005 9.35954 21.9894 8.98947C21.911 7.12339 21.6591 5.97823 20.8504 5.17157C19.6759 4 17.7856 4 14.005 4Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                                <path d="M9 15L15 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path>
                                <path d="M14.5 14.5H14.509" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                                <path d="M9.5 9.5H9.509" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                            </svg>
                            <span class="smallest fw-500">
                                <span class="coupons-count">${couponsLeft}</span> coupons left
                            </span>
                        </div>
                    </div>
                    <button type="button" onclick="window.Alpine && window.Alpine.store('couponModal').open(${c.id});" class="btn-reveal border-0 bg-accent text-white rounded-2 py-2 px-2 fw-500 d-flex align-items-center justify-content-center gap-2 w-100">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="6" cy="6" r="3"></circle>
                            <circle cx="6" cy="18" r="3"></circle>
                            <line x1="20" y1="4" x2="8.12" y2="15.88"></line>
                            <line x1="14.47" y1="14.48" x2="20" y2="20"></line>
                            <line x1="8.12" y1="8.12" x2="12" y2="12"></line>
                        </svg>
                        <span>Get Code</span>
                    </button>
                </div>
            </div>
            <div class="card-footer bg-transparent border-top border-light py-2 px-3">
                <div class="d-flex align-items-center justify-content-between smallest text-third">
                    <span class="d-flex align-items-center gap-1">
                        <i class="bi bi-infinity accent"></i>
                        <span>No expiration</span>
                    </span>
                    <span class="d-flex align-items-center gap-1">
                        <i class="bi bi-people accent"></i>
                        <span class="uses-count" data-coupon-id="${c.id}">${usesToday} uses today</span>
                    </span>
                </div>
            </div>
        </div>
    </div>`;
}

keywordConfigs.forEach(cfg => {
    const kw = cfg.keyword;
    const kwDisplay = cfg.display;
    const canonicalUrl = `https://crashcoupons.online/${cfg.slug}`;
    const pageCoupons = allCoupons.slice(cfg.startIndex, cfg.startIndex + 16);
    const cardsHtml = pageCoupons.map(c => generateCardHtml(c, kwDisplay)).join('\n');

    const htmlContent = `<!DOCTYPE html>
<html lang="en" data-bs-theme="light" data-accent-color="a-c-c5">
<head>
    <!-- Google Tag Manager -->
    <script async src="https://www.googletagmanager.com/gtm.js?id=GTM-5KQ439BM"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
    </script>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${cfg.title}</title>
    <meta name="description" content="${cfg.desc}">
    <meta name="keywords" content="${kw}, ${kwDisplay}, crashcoupons, crash coupons, verified coupon codes, discounts, promo codes">
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="${canonicalUrl}">

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="${canonicalUrl}">
    <meta property="og:site_name" content="CrashCoupons">
    <meta property="og:title" content="${cfg.title}">
    <meta property="og:description" content="${cfg.desc}">
    <meta property="og:image" content="https://crashcoupons.online/public/assets/uploads/coupon_banners/coupon_307_fee38f825078c8c1.jpg">

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:url" content="${canonicalUrl}">
    <meta name="twitter:title" content="${cfg.title}">
    <meta name="twitter:description" content="${cfg.desc}">
    <meta name="twitter:image" content="https://crashcoupons.online/public/assets/uploads/coupon_banners/coupon_307_fee38f825078c8c1.jpg">

    <!-- Structured Data -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebSite",
          "@id": "${canonicalUrl}#website",
          "url": "${canonicalUrl}",
          "name": "${kwDisplay}",
          "alternateName": ["${kw}", "${kwDisplay}", "CrashCoupons"],
          "description": "${cfg.desc}",
          "publisher": {
            "@type": "Organization",
            "name": "CrashCoupons",
            "url": "https://crashcoupons.online/"
          }
        },
        {
          "@type": "WebPage",
          "@id": "${canonicalUrl}#webpage",
          "url": "${canonicalUrl}",
          "name": "${cfg.title}",
          "description": "${cfg.desc}",
          "isPartOf": {
            "@id": "${canonicalUrl}#website"
          }
        },
        {
          "@type": "FAQPage",
          "@id": "${canonicalUrl}#faq",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "Where can I find an active ${kw} code?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "You can find every verified ${kw} deal directly on this page. All ${kw} promo codes are tested daily by our editorial staff."
              }
            },
            {
              "@type": "Question",
              "name": "What is ${kw} and how does it help save money?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "${kwDisplay} is a dedicated discount directory specifically indexing verified ${kw} offers, free game keys, and promo coupons."
              }
            },
            {
              "@type": "Question",
              "name": "How do I redeem my ${kw} deal?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Browse the ${kw} catalog below, select your deal, click Get Code to reveal the verified ${kw} promo code, and paste it at checkout."
              }
            },
            {
              "@type": "Question",
              "name": "Are ${kw} codes completely free to use?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, every single ${kw} coupon code listed is 100% free with no registration, fee, or paid subscription required to access."
              }
            },
            {
              "@type": "Question",
              "name": "How often are new ${kw} promotions updated?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Our team tests and refreshes ${kw} codes every 24 hours, removing expired promotions and adding newly released ${kw} deals."
              }
            }
          ]
        },
        {
          "@type": "HowTo",
          "@id": "${canonicalUrl}#howto",
          "name": "How to Unlock and Redeem a Verified ${kwDisplay}",
          "description": "Step-by-step instructions for unlocking and redeeming tested ${kw} promo codes.",
          "step": [
            {
              "@type": "HowToStep",
              "position": 1,
              "name": "Browse ${kwDisplay} Deals",
              "text": "Browse the active ${kw} offers below and select your game or store."
            },
            {
              "@type": "HowToStep",
              "position": 2,
              "name": "Reveal ${kwDisplay} Code",
              "text": "Click Get Code on your chosen ${kw} deal to open the verification window."
            },
            {
              "@type": "HowToStep",
              "position": 3,
              "name": "Redeem ${kwDisplay}",
              "text": "Copy your unlocked ${kw} code and paste it during checkout for instant savings."
            }
          ]
        }
      ]
    }
    </script>

    <meta name="base-url" content="/">
    <link rel="icon" type="image/x-icon" href="/public/assets/uploads/favicons/favicon_69cbf2b8bcc8e.png">
    <script>
        if (localStorage.getItem('user_color_mode')) {
            document.documentElement.setAttribute('data-bs-theme', localStorage.getItem('user_color_mode'));
        }
    </script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="">
    <link href="https://fonts.googleapis.com/css2?family=Lexend:wght@100..900&amp;display=swap" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">
    <link rel="stylesheet" href="/assets/front/css/colors.css">
    <link rel="stylesheet" href="/assets/front/css/utility.css">
    <link rel="stylesheet" href="/assets/front/css/style.css">

    ${modalScript}
    <script src="/assets/front/js/coupons-data.js"></script>
    <script defer="" src="https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js"></script>
</head>
<body>
    <!-- Google Tag Manager (noscript) -->
    <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-5KQ439BM" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>

    <!-- Header (Identical design to homepage) -->
    <header class="header d-flex align-items-center justify-content-center bg border-b border-light">
        <nav class="navbar navbar-expand w-100">
            <div class="container container-2xl">
                <div class="d-flex align-items-center w-100 gap-3">
                    <a class="navbar-brand p-0 flex-shrink-0" href="/">
                        <img src="/public/assets/uploads/logo_darks/logo_dark_69cbf7933898f.png" class="theme-logo" data-light-src="/public/assets/uploads/logo_darks/logo_dark_69cbf7933898f.png" data-dark-src="/public/assets/uploads/logo_lights/logo_light_69cbf7907a240.png" alt="CrashCoupons Logo" height="28">
                    </a>

                    <!-- Functional Search Bar -->
                    <form class="d-flex position-relative flex-grow-1" role="search" id="searchForm" action="/" method="GET">
                        <div class="input-group">
                            <input type="search" name="q" class="form-control header-search text-third rounded-3 bg-secondary border border-subtle" placeholder="Search ${kw} &amp; coupons..." aria-label="Search" id="searchInput" autocomplete="off">
                            <span class="search-loader position-absolute end-0 top-50 translate-middle-y pe-sm-3 pe-2">
                                <i class="bi bi-search"></i>
                            </span>
                        </div>
                    </form>

                    <!-- Links & Theme Switcher -->
                    <a href="/brands" class="btn btn-sm btn-outline-secondary rounded-pill px-3 me-2 d-none d-sm-inline-flex text-decoration-none">All Games</a>
                    <button class="btn btn-theme-switch btn-link nav-link p-1" id="themeToggle" type="button" aria-label="Toggle theme">
                        <i class="bi bi-sun-fill theme-icon-light" style="font-size: 1.2rem; color: var(--accent);"></i>
                        <i class="bi bi-moon-stars-fill theme-icon-dark" style="font-size: 1.2rem; color: var(--accent);"></i>
                    </button>
                </div>
            </div>
        </nav>
    </header>

    <div class="main-wrapper">
        <main class="main-content px-xl-5 px-3 py-sm-5 py-4 container-2xl">
            <!-- All Coupons Section with H1 -->
            <section class="all-coupons-section">
                <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-sm-4 mb-3">
                    <h1 class="h3 mb-0 fw-600">${kwDisplay}</h1>
                    <span class="badge bg-secondary-lightest text px-3 py-2 rounded-pill small">
                        16 Hand-Tested ${kwDisplay} Offers
                    </span>
                </div>
                <h2 class="visually-hidden">${kwDisplay} Verified Promo Codes &amp; Deals Directory</h2>
                
                <div class="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-xl-4 g-3">
                    ${cardsHtml}
                </div>
            </section>

            <!-- Knowledge & FAQ Section with 30+ keyword occurrences -->
            <section class="mt-5 pt-4 border-top border-light" id="faq">
                <div class="row g-4">
                    <div class="col-lg-8">
                        <h2 class="h4 fw-600 mb-3 text">Frequently Asked Questions About ${kwDisplay}</h2>
                        <p class="text-third mb-4">
                            Welcome to the verified directory for <strong>${kw}</strong> deals, promo codes, and gaming savings. Every <strong>${kw}</strong> is hand-tested daily by our team so you can save with working <strong>${kw}</strong> discounts instantly.
                        </p>

                        <div class="mb-4">
                            <h3 class="h6 fw-semibold text mb-1">What is ${kw} and how does it work?</h3>
                            <p class="text-third small mb-3">
                                <strong>${kwDisplay}</strong> is an open discount aggregator specifically indexing daily-tested <strong>${kw}</strong> offers. Every <strong>${kw}</strong> is tested against official storefronts and launchers before publication.
                            </p>

                            <h3 class="h6 fw-semibold text mb-1">Where is the best place to find an active ${kw}?</h3>
                            <p class="text-third small mb-3">
                                You can find every working <strong>${kw}</strong> right here on our dedicated <strong>${kw}</strong> page. We audit every <strong>${kw}</strong> code daily to ensure high redemption rates.
                            </p>

                            <h3 class="h6 fw-semibold text mb-1">How do I redeem my ${kw} promo code?</h3>
                            <p class="text-third small mb-2">To redeem your <strong>${kw}</strong> deal, follow these 3 quick steps:</p>
                            <ol class="text-third small ps-3 mb-3">
                                <li>Select your desired game or store from our active <strong>${kw}</strong> catalog.</li>
                                <li>Click Get Code on the <strong>${kw}</strong> offer card to open the unlock window.</li>
                                <li>Copy your verified <strong>${kw}</strong> code and apply it during checkout.</li>
                            </ol>

                            <h3 class="h6 fw-semibold text mb-1">Are all ${kw} codes free to access?</h3>
                            <p class="text-third small mb-3">
                                Yes, every <strong>${kw}</strong> listed on this page is 100% free with no registration or credit card needed to claim your <strong>${kw}</strong> promotion.
                            </p>

                            <h3 class="h6 fw-semibold text mb-1">How often are new ${kw} promotions updated?</h3>
                            <p class="text-third small mb-0">
                                Our editorial team updates <strong>${kw}</strong> offers daily, deprecating expired codes and adding fresh <strong>${kw}</strong> keys every 24 hours.
                            </p>
                        </div>

                        <blockquote class="border-start border-3 border-accent ps-3 my-4 text-third small fst-italic">
                            “Our verification process ensures that every ${kw} listed on CrashCoupons maintains over 95% working accuracy, giving users the most reliable ${kw} discounts available.” 
                            <cite class="d-block mt-1 fw-semibold text not-italic">— ${kwDisplay} Editorial &amp; Verification Team</cite>
                        </blockquote>
                    </div>

                    <div class="col-lg-4">
                        <h2 class="h5 fw-600 mb-3 text">${kwDisplay} Verification &amp; Feature Comparison</h2>
                        <div class="table-responsive">
                            <table class="table table-sm table-bordered border-subtle small text-third mb-0">
                                <thead class="table-secondary">
                                    <tr>
                                        <th>Feature</th>
                                        <th>${kwDisplay}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>Verification</td>
                                        <td class="text-accent fw-500">100% Tested ${kwDisplay}</td>
                                    </tr>
                                    <tr>
                                        <td>Sign-up Required</td>
                                        <td class="text-accent fw-500">None (Free ${kwDisplay})</td>
                                    </tr>
                                    <tr>
                                        <td>Update Cadence</td>
                                        <td class="text-accent fw-500">Daily ${kwDisplay} Audits</td>
                                    </tr>
                                    <tr>
                                        <td>Direct Copy</td>
                                        <td class="text-accent fw-500">Instant ${kwDisplay} Unlock</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div class="mt-3 p-3 bg-secondary rounded-3 text-third smallest border border-light">
                            <div><i class="bi bi-shield-check text-accent me-1"></i> Editorial Standards: <a href="/about" class="text-accent text-decoration-none">Read Policy</a></div>
                            <div class="mt-1"><i class="bi bi-clock-history me-1"></i> <time datetime="2026-11-23">Updated: November 23, 2026</time></div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Visually Hidden SEO Content for ${kw} -->
            <div class="visually-hidden" aria-hidden="false">
                <h3>${kwDisplay} Verified Directory</h3>
                <p>Welcome to the official source for ${kw} coupons and discount codes. Our editors check ${kw} every day to ensure verified ${kw} codes work seamlessly.</p>
                <ul>
                    <li>${kwDisplay} daily promotions</li>
                    <li>Instant ${kw} code reveal with no survey</li>
                    <li>Tested ${kw} gaming discounts and product vouchers</li>
                    <li>Verified ${kw} offers with 100% redemption rate</li>
                    <li>Exclusive ${kw} community savings and store deals</li>
                </ul>
                <p>Save money with our verified ${kw} catalog and enjoy active ${kw} discounts.</p>
            </div>
        </main>
    </div>

    <!-- Footer -->
    <footer class="footer bg border-t border-light mt-5">
        <div class="footer-wrapper">
            <div class="container">
                <div class="footer-top row g-xl-5 g-4 py-5">
                    <!-- Column 1: Logo and About -->
                    <div class="col-lg-4">
                        <div class="footer-l-content d-flex flex-column align-items-stretch">
                            <div class="footer-branding flex-grow-1">
                                <img src="/public/assets/uploads/logo_darks/logo_dark_69cbf7933898f.png" class="footer-logo d-table mb-xm-4 mb-3 theme-logo" data-light-src="/public/assets/uploads/logo_darks/logo_dark_69cbf7933898f.png" data-dark-src="/public/assets/uploads/logo_lights/logo_light_69cbf7907a240.png" alt="CrashCoupons Logo" height="32">
                                <div class="footer-about mb-4">
                                    <h2 class="visually-hidden">About ${kwDisplay} Verified Codes</h2>
                                    <p class="text-third mb-2">
                                        Dedicated to helping gamers and shoppers save more with verified <strong>${kw}</strong> deals, tested <strong>${kw}</strong> promotions, and exclusive digital discounts.
                                    </p>
                                    <p class="text-third small mb-0"><i class="bi bi-patch-check-fill text-accent me-1"></i> Curated by the ${kwDisplay} Team • <time datetime="2026-11-23">November 2026</time></p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Column 2: Popular Brands -->
                    <div class="col-lg-4">
                        <h2 class="h5 footer-title mb-4 fw-semibold">${kwDisplay} Categories</h2>
                        <div class="popular-brands-grid">
                            <a href="/brands/cookie-run-kingdom" class="brand-card mb-2 bg-secondary rounded-3 p-3 d-flex align-items-center gap-3 text-decoration-none">
                                <div class="brand-info">
                                    <div class="brand-name text fw-500">Cookie Run Kingdom</div>
                                    <small class="text-third">Active ${kw} deals</small>
                                </div>
                            </a>
                            <a href="/brands/ea-sports-fc-27" class="brand-card mb-2 bg-secondary rounded-3 p-3 d-flex align-items-center gap-3 text-decoration-none">
                                <div class="brand-info">
                                    <div class="brand-name text fw-500">EA Sports FC 27</div>
                                    <small class="text-third">Active ${kw} deals</small>
                                </div>
                            </a>
                            <a href="/brands/forza-horizon-5" class="brand-card mb-2 bg-secondary rounded-3 p-3 d-flex align-items-center gap-3 text-decoration-none">
                                <div class="brand-info">
                                    <div class="brand-name text fw-500">Forza Horizon 5</div>
                                    <small class="text-third">Active ${kw} deals</small>
                                </div>
                            </a>
                        </div>
                    </div>

                    <!-- Column 3: Trust Features -->
                    <div class="col-lg-4">
                        <h2 class="h5 footer-title mb-4 fw-semibold">Why Choose ${kwDisplay}?</h2>
                        <div class="trust-features d-flex flex-column gap-3">
                            <div class="trust-feature d-flex align-items-center gap-3">
                                <div>
                                    <h3 class="h6 mb-1 fw-semibold">How do daily ${kw} updates work?</h3>
                                    <p class="text-third small mb-0">Our team verifies and updates every ${kw} daily for maximum savings.</p>
                                </div>
                            </div>
                            <div class="trust-feature d-flex align-items-center gap-3">
                                <div>
                                    <h3 class="h6 mb-1 fw-semibold">Are ${kw} codes verified?</h3>
                                    <p class="text-third small mb-0">100% hand-tested ${kw} deals for guaranteed savings.</p>
                                </div>
                            </div>
                            <div class="trust-feature d-flex align-items-center gap-3">
                                <div>
                                    <h3 class="h6 mb-1 fw-semibold">Is ${kw} completely free?</h3>
                                    <p class="text-third small mb-0">No registration or payment required - claim your ${kw} instantly.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Copyright -->
                <div class="copyright-wrapper text-center border-top py-3">
                    <p class="mb-2 text-third small">
                        © 2026 CrashCoupons.com. All rights reserved. • Curated by the ${kwDisplay} Editorial Team
                    </p>
                    <div class="footer-links d-flex justify-content-center flex-wrap gap-3 small">
                        <a href="/" class="text-third text-decoration-none">Home</a>
                        <span class="text-third">•</span>
                        <a href="/brands" class="text-third text-decoration-none">All Games</a>
                        <span class="text-third">•</span>
                        <a href="/about" class="text-third text-decoration-none">About Us</a>
                        <span class="text-third">•</span>
                        <a href="/privacy" class="text-third text-decoration-none">Privacy Policy</a>
                        <span class="text-third">•</span>
                        <a href="/terms" class="text-third text-decoration-none">Terms of Service</a>
                        <span class="text-third">•</span>
                        <a href="/contact" class="text-third text-decoration-none">Contact Us</a>
                    </div>
                </div>
            </div>
        </div>
    </footer>

    ${modalMarkup}

    <script src="https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                const currentTheme = document.documentElement.getAttribute('data-bs-theme');
                const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
                document.documentElement.setAttribute('data-bs-theme', newTheme);
                localStorage.setItem('user_color_mode', newTheme);
            });
        }
    </script>
</body>
</html>`;

    const outPath = path.join(baseDir, cfg.file);
    fs.writeFileSync(outPath, htmlContent, 'utf8');

    // Count occurrences of kw in the file
    const escapedKw = kw.replace(/[.*+?^$${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escapedKw, 'gi');
    const matches = (htmlContent.match(regex) || []).length;
    console.log(`Created ${cfg.file} for "${kw}" (Found ${matches} occurrences of "${kw}")`);
});

// Update sitemap.xml with all pages
const sitemapPath = path.join(baseDir, 'sitemap.xml');
let sitemap = fs.readFileSync(sitemapPath, 'utf8');

keywordConfigs.forEach(cfg => {
    const urlLoc = `https://crashcoupons.online/${cfg.slug}`;
    if (!sitemap.includes(`<loc>${urlLoc}</loc>`)) {
        const urlEntry = `  <url>\n    <loc>${urlLoc}</loc>\n    <lastmod>2026-11-23</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.9</priority>\n  </url>`;
        sitemap = sitemap.replace('</urlset>', `${urlEntry}\n</urlset>`);
    }
});

fs.writeFileSync(sitemapPath, sitemap, 'utf8');
console.log('Updated sitemap.xml with all keyword pages');
