# E4N — Everything 4 Nothing

A dark luxury streetwear label made in numbered runs. Forged for the hours after midnight.

This repository is a **complete Shopify Online Store 2.0 theme**. The folder structure
(`assets/`, `config/`, `layout/`, `locales/`, `sections/`, `snippets/`, `templates/`) is the
exact layout Shopify expects, so it imports directly through Shopify's **GitHub integration** —
no manual rebuilding required.

---

## What's inside

| Page | Template | Section(s) |
|------|----------|-----------|
| Home | `templates/index.json` | `hero`, `featured-collection`, `brand-statement`, `lookbook`, `newsletter` |
| Shop / Collection | `templates/collection.json` | `main-collection` (filters + sort) |
| Product | `templates/product.json` | `main-product` (gallery, variants, accordions, related) |
| Cart | `templates/cart.json` | `main-cart` (+ global slide-out drawer) |
| About | `templates/page.about.json` | `about` |
| FAQ | `templates/page.faq.json` | `faq` (accordion categories) |
| Contact | `templates/page.contact.json` | `contact` (form) |
| Search | `templates/search.json` | `main-search` |
| Collections list | `templates/list-collections.json` | `main-list-collections` |
| 404 | `templates/404.json` | `main-404` |
| Password | `templates/password.json` | `main-password` |

Header and footer are wired through OS 2.0 **section groups**
(`sections/header-group.json`, `sections/footer-group.json`).

Every section ships with a `{% schema %}`, so titles, images, colors, and copy are all editable
from the Shopify theme editor. Sections with `presets` can be dropped onto any page.

---

## Getting it into Shopify

### Option A — GitHub integration (recommended, matches your request)
1. Push this repo to GitHub (see below).
2. In Shopify admin: **Online Store → Themes → Add theme → Connect from GitHub**.
3. Authorize Shopify, pick this repository and branch (`main`).
4. Shopify imports it as an unpublished theme. Click **Customize** to edit, **Publish** when ready.
   Edits made in GitHub sync to the theme; edits in the editor commit back to GitHub.

### Option B — Shopify CLI (live local preview)
```bash
npm install -g @shopify/cli @shopify/theme
shopify theme dev   # live preview against your store
shopify theme push  # upload
```

### Option C — Manual zip
Zip the **contents** of this folder (not the folder itself) and upload via
**Themes → Add theme → Upload zip**. Exclude `src-images/` and `README.md`.

---

## After import — connect real products

The storefront is fully populated with **placeholder products** using your campaign images, so it
looks complete immediately. To go live with real data:

1. **Products** → create products (e.g. *Midnight Heavyweight Hoodie*, *Skyline Graphic Tee*),
   upload front/back images, set sizes as a **Size** option, and price them.
2. **Collections** → create a collection named **City Night Limited Drop** and add the products.
3. Theme editor → **Home → Featured collection** → select that collection.
   The placeholder cards automatically disappear once a collection with products is connected.
4. **Navigation** (Online Store → Navigation): the theme looks for a menu handle `main-menu`
   with links *Home, Shop, About Us, FAQ, Contact*, and an optional `footer` menu.
5. **Pages** (Online Store → Pages): create pages with handles `about`, `faq`, `contact`
   and assign each the matching template (`page.about`, `page.faq`, `page.contact`).

---

## Fonts

- **Cardo** (editorial serif) and **Inter** (UI) load automatically from Google Fonts.
- **"Owned"** is a commercial display font used only for the full brand name
  *Everything 4 Nothing*. It is **not bundled** (licensing). To enable it, drop
  `owned.woff2` (and optionally `owned.woff`) into `/assets`. Until then it gracefully
  falls back to Cardo via the `@font-face` rule in `assets/base.css`.

## Checkout

Checkout is **hosted by Shopify** and cannot be templated from theme files on standard plans.
Brand it in **Settings → Checkout → Customize** (logo, colors, typography) — set the background to
charcoal `#111111` and the accent to off-white `#F2F2F2` to match. On Shopify Plus you can extend
it further with Checkout Extensibility.

## Demo / preview mode

`assets/global.js` talks to Shopify's AJAX Cart API (`/cart.js`, `/cart/add.js`). On a real store
the slide-out cart and add-to-bag work live. In a static preview (no Shopify backend) it falls back
to a toast message so nothing errors.

## Brand system

- **Palette:** Charcoal `#111111`, Dark Gray `#1B1B1B`, Graphite `#2A2A2A`, Off-White `#F2F2F2`, muted silver.
- Product surfaces use charcoal/graphite gradients (never pure black behind black apparel).
- Film-grain overlay, concrete textures, subtle parallax, fade-in + image-reveal animations,
  all respecting `prefers-reduced-motion`.

---
*Made in numbered runs.*
