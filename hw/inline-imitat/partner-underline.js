// partner-underline.js
// 讓 partner-nav 裡面的按鈕切換時，有一個平滑滑動的橘色底線指示器。
// 相容情況：純 CSS 按鈕切換或 Alpine.js (你的 partner-tabs.js) 都可用。
// 使用 MutationObserver + click/focus/resize 來保持同步。

(function () {
  function qs(sel, root = document) {
    return root.querySelector(sel);
  }
  function qsa(sel, root = document) {
    return Array.from((root || document).querySelectorAll(sel));
  }

  document.addEventListener("DOMContentLoaded", () => {
    const nav = qs(".partner-nav");
    if (!nav) return;

    // 建立指示器元素（如已存在就使用）
    let indicator = qs(".partner-nav__indicator", nav);
    if (!indicator) {
      indicator = document.createElement("div");
      indicator.className = "partner-nav__indicator";
      nav.appendChild(indicator);
    }

    const buttonsSelector = '[role="tab"].partner-sort';
    let buttons = qsa(buttonsSelector, nav);

    // 若按鈕還沒渲染（Alpine 的情況），延遲嘗試
    if (!buttons.length) {
      // 200ms 後再抓一次（通常足夠）
      setTimeout(() => {
        buttons = qsa(buttonsSelector, nav);
        updateIndicatorToActive();
      }, 200);
    }

    function updateIndicatorToButton(btn, animate = true) {
      if (!btn) {
        // 隱藏指示器
        indicator.style.width = "0px";
        indicator.style.opacity = "0";
        return;
      }
      const rectNav = nav.getBoundingClientRect();
      const rect = btn.getBoundingClientRect();
      const left = rect.left - rectNav.left + nav.scrollLeft;
      const width = Math.max(8, rect.width); // 最小寬度以免看不見
      if (!animate) {
        indicator.style.transition = "none";
        requestAnimationFrame(() => {
          indicator.style.left = `${left}px`;
          indicator.style.width = `${width}px`;
          indicator.style.opacity = "1";
          // 恢復 transition
          requestAnimationFrame(() => (indicator.style.transition = ""));
        });
      } else {
        indicator.style.left = `${left}px`;
        indicator.style.width = `${width}px`;
        indicator.style.opacity = "1";
      }
    }

    function findActiveButton() {
      buttons = qsa(buttonsSelector, nav); // refresh
      let active = buttons.find((b) => b.classList.contains("active"));
      // 如果找不到 active，就找 aria-selected=true 或是第一個可見按鈕
      if (!active) {
        active =
          buttons.find((b) => b.getAttribute("aria-selected") === "true") ||
          buttons[0];
      }
      return active;
    }

    function updateIndicatorToActive() {
      const active = findActiveButton();
      updateIndicatorToButton(active, true);
    }

    // 初始設定（不動畫）
    updateIndicatorToActive();

    // 當按鈕被 click / focus 時，移動 indicator（立刻反饋）
    nav.addEventListener("click", (e) => {
      const btn = e.target.closest && e.target.closest(".partner-sort");
      if (btn) updateIndicatorToButton(btn, true);
    });
    nav.addEventListener("focusin", (e) => {
      const btn = e.target.closest && e.target.closest(".partner-sort");
      if (btn) updateIndicatorToButton(btn, true);
    });

    // window resize 時需重新計算位置/寬度
    let resizeTimer;
    window.addEventListener(
      "resize",
      () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(updateIndicatorToActive, 80);
      },
      { passive: true }
    );

    // 若 Alpine 或其它程式改 class="active"，用 MutationObserver 偵測變化並更新
    const mo = new MutationObserver((records) => {
      // 有任何 class 變更就跑更新（簡單且夠用）
      let shouldUpdate = false;
      for (const r of records) {
        if (r.type === "attributes" && r.attributeName === "class") {
          shouldUpdate = true;
          break;
        }
      }
      if (shouldUpdate) updateIndicatorToActive();
    });

    // 觀察所有按鈕的 class 變化
    function observeButtons() {
      buttons = qsa(buttonsSelector, nav);
      buttons.forEach((btn) =>
        mo.observe(btn, { attributes: true, attributeFilter: ["class"] })
      );
    }
    observeButtons();

    // 若 node 結構改變（例如 Alpine 重新渲染按鈕），就重新觀察
    const parentMo = new MutationObserver((recs) => {
      let needRefresh = false;
      for (const r of recs) {
        if (r.type === "childList") {
          needRefresh = true;
          break;
        }
      }
      if (needRefresh) {
        // 重新抓按鈕並監聽
        mo.disconnect();
        observeButtons();
        updateIndicatorToActive();
      }
    });
    parentMo.observe(nav, { childList: true, subtree: true });

    // Optional: 若使用鍵盤左右鍵改 active（你的 partner-tabs.js 應會改 active），也重新更新一次
    document.addEventListener("keydown", (e) => {
      if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) {
        // 等個 microtask 給 Alpine 更新 class，再更新指示器
        setTimeout(updateIndicatorToActive, 0);
      }
    });
  });
})();
