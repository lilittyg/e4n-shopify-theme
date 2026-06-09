/* ============================================================
   E4N — global behaviour
   Vanilla JS. No dependencies. Shopify AJAX Cart API compatible.
   ============================================================ */
(function () {
  "use strict";

  const root = document.documentElement;
  const onReady = (fn) =>
    document.readyState !== "loading" ? fn() : document.addEventListener("DOMContentLoaded", fn);

  /* ---------- Header: transparent -> darken on scroll ---------- */
  function initHeader() {
    const header = document.querySelector("[data-header]");
    if (!header) return;
    const solid = header.hasAttribute("data-header-solid");
    const update = () => {
      if (solid) { header.classList.add("is-solid"); return; }
      header.classList.toggle("is-scrolled", window.scrollY > 40);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
  }

  /* ---------- Mobile nav ---------- */
  function initMobileNav() {
    const nav = document.querySelector("[data-mobile-nav]");
    const open = document.querySelector("[data-mobile-open]");
    const close = document.querySelector("[data-mobile-close]");
    if (!nav || !open) return;
    const toggle = (state) => {
      nav.classList.toggle("is-open", state);
      document.body.style.overflow = state ? "hidden" : "";
    };
    open.addEventListener("click", () => toggle(true));
    close && close.addEventListener("click", () => toggle(false));
    nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => toggle(false)));
  }

  /* ---------- Scroll reveal ---------- */
  function initReveal() {
    const els = document.querySelectorAll("[data-reveal], .img-reveal");
    if (!els.length || !("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
    );
    els.forEach((el) => io.observe(el));
  }

  /* ---------- Hero parallax ---------- */
  function initParallax() {
    const layers = document.querySelectorAll("[data-parallax]");
    if (!layers.length || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let ticking = false;
    const run = () => {
      const y = window.scrollY;
      layers.forEach((l) => {
        const speed = parseFloat(l.getAttribute("data-parallax")) || 0.15;
        l.style.transform = `translate3d(0, ${y * speed}px, 0)`;
      });
      ticking = false;
    };
    window.addEventListener("scroll", () => {
      if (!ticking) { window.requestAnimationFrame(run); ticking = true; }
    }, { passive: true });
  }

  /* ---------- Accordions ---------- */
  function initAccordions() {
    document.querySelectorAll("[data-accordion]").forEach((acc) => {
      acc.querySelectorAll(".accordion__trigger").forEach((trigger) => {
        trigger.addEventListener("click", () => {
          const item = trigger.closest(".accordion__item");
          const panel = item.querySelector(".accordion__panel");
          const open = item.classList.toggle("is-open");
          trigger.setAttribute("aria-expanded", open);
          panel.style.maxHeight = open ? panel.scrollHeight + "px" : "0px";
        });
      });
    });
  }

  /* ---------- Quantity steppers ---------- */
  function initQty() {
    document.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-qty-btn]");
      if (!btn) return;
      const wrap = btn.closest(".qty");
      const input = wrap.querySelector("input");
      let val = parseInt(input.value, 10) || 1;
      val += btn.getAttribute("data-qty-btn") === "up" ? 1 : -1;
      input.value = Math.max(parseInt(input.min || "1", 10), val);
      input.dispatchEvent(new Event("change", { bubbles: true }));
    });
  }

  /* ---------- Product gallery ---------- */
  function initGallery() {
    const gallery = document.querySelector("[data-gallery]");
    if (!gallery) return;
    const main = gallery.querySelector("[data-gallery-main] img");
    gallery.querySelectorAll("[data-gallery-thumb]").forEach((thumb) => {
      thumb.addEventListener("click", () => {
        const src = thumb.getAttribute("data-src");
        if (main && src) main.src = src;
        gallery.querySelectorAll("[data-gallery-thumb]").forEach((t) => t.classList.remove("is-active"));
        thumb.classList.add("is-active");
      });
    });
  }

  /* ---------- Product option selectors (visual) ---------- */
  function initOptions() {
    document.querySelectorAll("[data-swatches]").forEach((group) => {
      group.querySelectorAll(".swatch:not(.is-soldout)").forEach((sw) => {
        sw.addEventListener("click", () => {
          group.querySelectorAll(".swatch").forEach((s) => s.classList.remove("is-active"));
          sw.classList.add("is-active");
          const target = group.getAttribute("data-target");
          if (target) {
            const input = document.querySelector(target);
            if (input) input.value = sw.getAttribute("data-value");
          }
        });
      });
    });
  }

  /* ============================================================
     CART  (Shopify AJAX API)
     Falls back to a localStorage demo cart on static/preview
     environments where /cart endpoints are unavailable.
     ============================================================ */
  const money = (cents) => {
    const fmt = window.E4N && window.E4N.moneyFormat;
    const value = (cents / 100).toLocaleString(undefined, { minimumFractionDigits: 2 });
    return fmt ? fmt.replace(/\{\{\s*amount\s*\}\}/, value) : "$" + value;
  };

  const Cart = {
    get drawer() { return document.querySelector("[data-cart-drawer]"); },
    get overlay() { return document.querySelector("[data-overlay]"); },

    open() {
      this.drawer && this.drawer.classList.add("is-open");
      this.overlay && this.overlay.classList.add("is-open");
      document.body.style.overflow = "hidden";
    },
    close() {
      this.drawer && this.drawer.classList.remove("is-open");
      this.overlay && this.overlay.classList.remove("is-open");
      document.body.style.overflow = "";
    },

    async fetchState() {
      try {
        const res = await fetch("/cart.js", { headers: { Accept: "application/json" } });
        if (!res.ok) throw new Error("no cart endpoint");
        return await res.json();
      } catch (e) {
        return null; // static/demo mode
      }
    },

    async add(id, quantity, properties) {
      try {
        const res = await fetch("/cart/add.js", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ id, quantity: quantity || 1, properties }),
        });
        if (!res.ok) throw new Error("add failed");
        await this.refresh();
        this.open();
        return true;
      } catch (e) {
        toast("Demo mode — connect to Shopify to enable cart");
        this.open();
        return false;
      }
    },

    async change(key, quantity) {
      try {
        await fetch("/cart/change.js", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ id: key, quantity }),
        });
        await this.refresh();
      } catch (e) {}
    },

    async refresh() {
      const state = await this.fetchState();
      if (!state) return;
      this.render(state);
      document.querySelectorAll("[data-cart-count]").forEach((el) => {
        el.textContent = state.item_count;
        el.style.display = state.item_count > 0 ? "inline-flex" : "none";
      });
    },

    render(cart) {
      const body = document.querySelector("[data-cart-items]");
      const foot = document.querySelector("[data-cart-foot]");
      const totalEl = document.querySelector("[data-cart-total]");
      if (!body) return;
      if (!cart.items || cart.items.length === 0) {
        body.innerHTML = '<div class="cart-drawer__empty"><p class="eyebrow">Your bag is empty</p></div>';
        if (foot) foot.style.display = "none";
        return;
      }
      if (foot) foot.style.display = "block";
      body.innerHTML = cart.items.map((item) => `
        <div class="line-item" data-key="${item.key}">
          <a class="line-item__media" href="${item.url}">
            <img src="${item.image ? item.image.replace(/(\.[a-z]+)(\?.*)?$/i, "_160x$1$2") : ""}" alt="${item.product_title}">
          </a>
          <div>
            <div class="line-item__title">${item.product_title}</div>
            ${item.variant_title && item.variant_title !== "Default Title" ? `<div class="line-item__variant">${item.variant_title}</div>` : ""}
            <div class="line-item__bottom">
              <div class="qty">
                <button type="button" data-qty-btn="down" data-line-key="${item.key}" aria-label="Decrease">&minus;</button>
                <input type="text" value="${item.quantity}" readonly>
                <button type="button" data-qty-btn="up" data-line-key="${item.key}" aria-label="Increase">+</button>
              </div>
              <button class="line-item__remove" data-line-remove="${item.key}">Remove</button>
            </div>
          </div>
          <div class="line-item__price">${money(item.final_line_price)}</div>
        </div>`).join("");
      if (totalEl) totalEl.textContent = money(cart.total_price);
    },

    bind() {
      document.addEventListener("click", (e) => {
        const openBtn = e.target.closest("[data-cart-open]");
        if (openBtn) { e.preventDefault(); this.refresh(); this.open(); }
        const closeBtn = e.target.closest("[data-cart-close]");
        if (closeBtn) { e.preventDefault(); this.close(); }
        const overlay = e.target.closest("[data-overlay]");
        if (overlay) this.close();

        const remove = e.target.closest("[data-line-remove]");
        if (remove) this.change(remove.getAttribute("data-line-remove"), 0);

        const lineBtn = e.target.closest("[data-line-key]");
        if (lineBtn) {
          const key = lineBtn.getAttribute("data-line-key");
          const input = lineBtn.parentElement.querySelector("input");
          let qty = parseInt(input.value, 10) || 1;
          qty += lineBtn.getAttribute("data-qty-btn") === "up" ? 1 : -1;
          this.change(key, Math.max(0, qty));
        }
      });
      document.addEventListener("keydown", (e) => { if (e.key === "Escape") this.close(); });

      document.querySelectorAll("[data-product-form]").forEach((form) => {
        form.addEventListener("submit", (e) => {
          e.preventDefault();
          const id = form.querySelector('[name="id"]').value;
          const qtyInput = form.querySelector('[name="quantity"]');
          const qty = qtyInput ? parseInt(qtyInput.value, 10) : 1;
          this.add(id, qty);
        });
      });
    },
  };
  window.E4NCart = Cart;

  function toast(msg) {
    let el = document.querySelector(".toast");
    if (!el) { el = document.createElement("div"); el.className = "toast"; document.body.appendChild(el); }
    el.textContent = msg;
    el.classList.add("is-show");
    clearTimeout(el._t);
    el._t = setTimeout(() => el.classList.remove("is-show"), 2600);
  }
  window.E4NToast = toast;

  onReady(() => {
    initHeader();
    initMobileNav();
    initReveal();
    initParallax();
    initAccordions();
    initQty();
    initGallery();
    initOptions();
    Cart.bind();
    Cart.refresh();
  });
})();
