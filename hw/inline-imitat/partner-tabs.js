// partner-tabs.js — Alpine-friendly 版本（更健壯、會在 alpine:init 時註冊）
/* eslint-disable */
console.log("partner-tabs.js loaded (new robust version)");

document.addEventListener("alpine:init", () => {
  console.log("alpine:init event fired — registering partnerTabs");

  Alpine.data("partnerTabs", () => ({
    activeTab: "restaurant",
    tabOrder: [
      "restaurant",
      "hotel",
      "mall",
      "michelin",
      "well-known",
      "overseas",
    ],

    _getTabButtons() {
      try {
        const root =
          this.$el ||
          document.querySelector('[x-data="partnerTabs()"]') ||
          document;
        const nav =
          (root && root.querySelector && root.querySelector(".partner-nav")) ||
          document.querySelector(".partner-nav");
        return nav ? Array.from(nav.querySelectorAll('[role="tab"]')) : [];
      } catch (e) {
        console.warn("partnerTabs _getTabButtons error:", e);
        return [];
      }
    },

    focusNext(event) {
      const buttons = this._getTabButtons();
      if (!buttons.length) return;
      const idx = buttons.indexOf(event.target);
      const next = (idx + 1) % buttons.length;
      if (buttons[next]) {
        buttons[next].focus();
        this.activeTab = buttons[next].dataset.key;
      }
    },

    focusPrev(event) {
      const buttons = this._getTabButtons();
      if (!buttons.length) return;
      const idx = buttons.indexOf(event.target);
      const prev = (idx - 1 + buttons.length) % buttons.length;
      if (buttons[prev]) {
        buttons[prev].focus();
        this.activeTab = buttons[prev].dataset.key;
      }
    },

    _handleKeyShortcuts(event) {
      const el = event.target;
      if (!el || el.getAttribute("role") !== "tab") return;
      const buttons = this._getTabButtons();
      if (!buttons.length) return;

      if (event.key === "Home") {
        event.preventDefault();
        buttons[0].focus();
        this.activeTab = buttons[0].dataset.key;
      }
      if (event.key === "End") {
        event.preventDefault();
        buttons[buttons.length - 1].focus();
        this.activeTab = buttons[buttons.length - 1].dataset.key;
      }
    },

    init() {
      try {
        console.log(
          "partnerTabs init start — activeTab (before):",
          this.activeTab
        );

        if (!this.activeTab) this.activeTab = "restaurant";
        if (!this.tabOrder.includes(this.activeTab)) {
          const btns = this._getTabButtons();
          this.activeTab = btns[0]?.dataset.key || this.tabOrder[0];
        }

        const rootEl =
          this.$el || document.querySelector('[x-data="partnerTabs()"]');
        if (rootEl && rootEl.addEventListener) {
          rootEl.addEventListener("keydown", (e) =>
            this._handleKeyShortcuts(e)
          );
        } else {
          console.warn(
            "partnerTabs init: 找不到 root 元素，無法綁定鍵盤事件。"
          );
        }

        const buttons = this._getTabButtons();
        console.log("partnerTabs found tab buttons count:", buttons.length);

        buttons.forEach((btn, idx) => {
          if (!btn.dataset.key) {
            btn.dataset.key = (btn.textContent || "tab-" + idx)
              .trim()
              .toLowerCase()
              .replace(/\s+/g, "-");
          }
        });

        const defaultBtn = buttons.find(
          (b) => b.dataset.key === this.activeTab
        );
        if (defaultBtn) defaultBtn.classList.add("active");

        console.log(
          "partnerTabs init 完成 — activeTab:",
          this.activeTab,
          "foundButtons:",
          buttons.length
        );
      } catch (err) {
        console.error("partnerTabs init error:", err);
      }
    },
  }));

  console.log("partnerTabs registered via Alpine.data");
});
