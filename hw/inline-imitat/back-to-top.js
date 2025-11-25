(function () {
  const btn = document.getElementById("backToTop");
  if (!btn) return;

  // 顯示按鈕的捲動閾值（可改）
  const SHOW_AT = 100;

  // 監聽捲動：達閾值就顯示，頂端就隱藏
  function onScroll() {
    if (window.scrollY > SHOW_AT) {
      // 顯示（移除 hidden 並顯示元素）
      btn.style.display = "inline-flex";
      // 讓過渡發生
      requestAnimationFrame(() => btn.classList.remove("hidden"));
    } else {
      // 隱藏（先加 hidden 淡出，等動畫後再真正 display:none）
      if (!btn.classList.contains("hidden")) {
        btn.classList.add("hidden");
        // 200ms 後將 display:none，讓過渡效果結束
        setTimeout(() => {
          // 只有在還要隱藏時才改 display（避免 race）
          if (btn.classList.contains("hidden")) btn.style.display = "none";
        }, 200);
      }
    }
  }

  // 點擊時平滑回到頂端，然後在到頂後隱藏按鈕
  function onClick(e) {
    e.preventDefault();

    // 立刻將 pointer-events 暫時關閉，避免重複點擊
    btn.style.pointerEvents = "none";

    // 開始平滑滾動到頂
    window.scrollTo({ top: 0, behavior: "smooth" });

    // 監聽滾動事件，檢查何時到頂
    const onScrollCheckTop = () => {
      // 有些瀏覽器 smooth scroll 會逐漸變成 0
      if (window.scrollY <= 0) {
        // 到頂了：隱藏按鈕
        btn.classList.add("hidden");
        setTimeout(() => {
          btn.style.display = "none";
          btn.style.pointerEvents = ""; // 恢復
        }, 200);
        // 移除此監聽
        window.removeEventListener("scroll", onScrollCheckTop);
      }
    };

    // 若頁面已在頂端（edge case），直接隱藏
    if (window.scrollY <= 0) {
      btn.classList.add("hidden");
      setTimeout(() => (btn.style.display = "none"), 200);
      btn.style.pointerEvents = "";
    } else {
      window.addEventListener("scroll", onScrollCheckTop);
      // 保險：若 smooth scroll 無法觸發 scroll event（極少情況），設置超時回退
      setTimeout(() => {
        if (window.scrollY <= 0) {
          onScrollCheckTop();
        } else {
          // 若超時仍未到頂，就重新允許 pointer events 以防按鈕永遠失效
          btn.style.pointerEvents = "";
        }
      }, 2500); // 2.5s 超時可調
    }
  }

  // 初始狀態：把 hidden class 加上（但 display:none 由 HTML 內聯控制）
  btn.classList.add("hidden");

  // 綁事件
  window.addEventListener("scroll", onScroll, { passive: true });
  btn.addEventListener("click", onClick);

  // 若載入時頁面已捲動（例如從內部連結來），立即執行一次 onScroll 判斷
  onScroll();
})();
