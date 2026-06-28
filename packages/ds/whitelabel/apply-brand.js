/* ═══════════════════════════════════════════════════════════════════
 * OX — whitelabel/apply-brand.js
 * Apply a tenant brand config (see brand.schema.json) at runtime. No
 * build step: it sets the --ox-brand-* inputs that tokens/whitelabel.css
 * rewires into every component primitive.
 *
 *   <script src="whitelabel/apply-brand.js"></script>
 *   OXBrand.apply({ slug:"forge", name:"FORGE", accent:"#C2502A",
 *                   accentDeep:"#93371A", accentBright:"#D86A36" });
 *
 * Pass a target element to brand a subtree instead of the whole page:
 *   OXBrand.apply(brandB, document.querySelector("#tenant-panel"));
 * ═══════════════════════════════════════════════════════════════════ */
(function (root) {
  var MAP = {
    name:         "--ox-brand-name",
    mark:         "--ox-brand-mark",
    accent:       "--ox-brand-accent",
    accentDeep:   "--ox-brand-accent-deep",
    accentBright: "--ox-brand-accent-bright",
    ground:       "--ox-brand-ground",
    raised:       "--ox-brand-raised",
    deep:         "--ox-brand-deep",
    ink:          "--ox-brand-ink",
    inkSoft:      "--ox-brand-ink-soft",
    fontDisplay:  "--ox-brand-font-display",
    fontBody:     "--ox-brand-font-body",
    fontMono:     "--ox-brand-font-mono"
  };
  // string-valued inputs are consumed via CSS content: — must be quoted
  var STRINGS = { name: 1, mark: 1 };

  function deriveRamp(hex) {
    // Optional helper: derive deep/bright from a single accent if a
    // tenant supplies only `accent`. Simple sRGB lighten/darken (~12%).
    function clamp(n) { return Math.max(0, Math.min(255, Math.round(n))); }
    var m = /^#?([0-9a-f]{6})$/i.exec(hex || "");
    if (!m) return null;
    var n = parseInt(m[1], 16), r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    function mix(t) { // t<0 darken toward ink, t>0 lighten toward salt
      var f = Math.abs(t), to = t < 0 ? 11 : 246;
      return "#" + [r, g, b].map(function (c) {
        return clamp(c + (to - c) * f).toString(16).padStart(2, "0");
      }).join("");
    }
    return { deep: mix(-0.22), bright: mix(0.16) };
  }

  function apply(brand, target) {
    if (!brand) return;
    var el = target || document.documentElement;
    var b = Object.assign({}, brand);
    if (b.accent && (!b.accentDeep || !b.accentBright)) {
      var ramp = deriveRamp(b.accent);
      if (ramp) {
        if (!b.accentDeep) b.accentDeep = ramp.deep;
        if (!b.accentBright) b.accentBright = ramp.bright;
      }
    }
    for (var k in MAP) {
      if (b[k] == null) continue;
      var v = STRINGS[k] ? JSON.stringify(String(b[k])) : b[k];
      el.style.setProperty(MAP[k], v);
    }
    if (b.slug) el.setAttribute("data-ox-brand", b.slug);
    if (b.mode) el.setAttribute("data-ox-mode", b.mode);
    return el;
  }

  function clear(target) {
    var el = target || document.documentElement;
    for (var k in MAP) el.style.removeProperty(MAP[k]);
    el.removeAttribute("data-ox-brand");
  }

  root.OXBrand = { apply: apply, clear: clear, deriveRamp: deriveRamp, inputs: MAP };
})(typeof window !== "undefined" ? window : this);
