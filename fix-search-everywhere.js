const fs = require('fs');
const path = require('path');

const baseDir = __dirname;

// 1. Update build-keyword-pages.js
let bkp = fs.readFileSync(path.join(baseDir, 'build-keyword-pages.js'), 'utf8');

// Replace search form in build-keyword-pages.js
const oldSearchKeyword = `<form class="d-flex position-relative flex-grow-1" role="search" id="searchForm" action="/" method="GET">
                        <div class="input-group">
                            <input type="search" name="q" class="form-control header-search text-third rounded-3 bg-secondary border border-subtle" placeholder="Search \${kw} &amp; coupons..." aria-label="Search" id="searchInput" autocomplete="off">
                            <span class="search-loader position-absolute end-0 top-50 translate-middle-y pe-sm-3 pe-2">
                                <i class="bi bi-search"></i>
                            </span>
                        </div>
                    </form>`;

const newSearchKeyword = `<form class="d-flex position-relative flex-grow-1" role="search" id="searchForm" action="/" method="GET">
                        <div class="input-group">
                            <input type="search" name="q" class="form-control header-search text-third rounded-3 bg-secondary border border-subtle" placeholder="👉 Search \${kw} &amp; coupons..." aria-label="Search" id="searchInput" autocomplete="off">
                            <span class="search-loader position-absolute end-0 top-50 translate-middle-y pe-sm-3 pe-2">
                                <i class="bi bi-search"></i>
                                <div class="spinner-border spinner-border-sm accent d-none" role="status">
                                    <span class="visually-hidden">Loading...</span>
                                </div>
                            </span>
                        </div>
                        <div class="search-dropdown" id="searchDropdown"></div>
                    </form>`;

bkp = bkp.replace(oldSearchKeyword, newSearchKeyword);

// Add scripts to build-keyword-pages.js before </body>
const oldFootScriptsKeyword = `    <script src="https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>`;

const newFootScriptsKeyword = `    <script src="https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
    <script>
    window.searchTranslations = {
        noResultsTitle: "No Results Found",
        noResultsDesc: "Try adjusting your search terms"
    };
    </script>
    <script src="/assets/front/js/main.js"></script>`;

if (!bkp.includes('<script src="/assets/front/js/main.js"></script>')) {
    bkp = bkp.replace(oldFootScriptsKeyword, newFootScriptsKeyword);
}

fs.writeFileSync(path.join(baseDir, 'build-keyword-pages.js'), bkp, 'utf8');
console.log('Updated build-keyword-pages.js');

// 2. Update build-brand-pages.js
let bbp = fs.readFileSync(path.join(baseDir, 'build-brand-pages.js'), 'utf8');

// Replace single brand page search bar
const oldSingleBrandSearch = `<div class="search-form-wrapper flex-grow-1 mx-2" style="max-width: 500px;">
                        <form action="/" method="GET" class="position-relative">
                            <input type="search" name="q" class="form-control header-search text-third rounded-3 bg-secondary border border-subtle" placeholder="👉 Search games &amp; coupons..." aria-label="Search" autocomplete="off">
                        </form>
                    </div>`;

const newSingleBrandSearch = `<div class="search-form-wrapper flex-grow-1 mx-2" style="max-width: 500px;">
                        <form class="d-flex position-relative flex-grow-1" role="search" id="searchForm" action="/" method="GET">
                            <div class="input-group">
                                <input type="search" name="q" class="form-control header-search text-third rounded-3 bg-secondary border border-subtle" placeholder="👉 Search games &amp; coupons..." aria-label="Search" id="searchInput" autocomplete="off">
                                <span class="search-loader position-absolute end-0 top-50 translate-middle-y pe-sm-3 pe-2">
                                    <i class="bi bi-search"></i>
                                    <div class="spinner-border spinner-border-sm accent d-none" role="status">
                                        <span class="visually-hidden">Loading...</span>
                                    </div>
                                </span>
                            </div>
                            <div class="search-dropdown" id="searchDropdown"></div>
                        </form>
                    </div>`;

// Replace all occurrences of oldSingleBrandSearch in build-brand-pages.js
bbp = bbp.split(oldSingleBrandSearch).join(newSingleBrandSearch);

// Add scripts to brand pages in build-brand-pages.js
const oldSingleBrandFoot = `    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>`;
const newSingleBrandFoot = `    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
    <script>
    window.searchTranslations = {
        noResultsTitle: "No Results Found",
        noResultsDesc: "Try adjusting your search terms"
    };
    </script>
    <script src="/assets/front/js/main.js"></script>`;

if (!bbp.includes('<script src="/assets/front/js/main.js"></script>')) {
    bbp = bbp.split(oldSingleBrandFoot).join(newSingleBrandFoot);
}

// In brands/index.html template, ensure coupons-data.js and alpine are loaded
const oldBrandsDirHead = `<link rel="stylesheet" href="/assets/front/css/style.css">
</head>`;
const newBrandsDirHead = `<link rel="stylesheet" href="/assets/front/css/style.css">
    <script src="/assets/front/js/coupons-data.js"></script>
    <script defer src="https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js"></script>
</head>`;
bbp = bbp.replace(oldBrandsDirHead, newBrandsDirHead);

fs.writeFileSync(path.join(baseDir, 'build-brand-pages.js'), bbp, 'utf8');
console.log('Updated build-brand-pages.js');
