(function initTwSideSlider() {
  // 資料
  const twSliderData = [
    {
      img: "https://image.cdn-eztravel.com.tw/BzXUXpsy0jH8CLXmLwsPE4k4TuCWXYx92XF_Mt6y0Dg/rs:fit:1000:600:1/g:ce/q:95/aHR0cHM6Ly90cmlwLmNkbi1lenRyYXZlbC5jb20udHcvaW1nL0dSVC9zYW5yaW8xLmpwZw.jpg",
      link: "https://www.eztravel.com.tw/activity/formosa/express/touristtrain/",
    },
    {
      img: "https://image.cdn-eztravel.com.tw/VC9zVtJSWc60PIzcM7FH1IrUhmL_xFxa4fl_9Up70Ys/rs:fit:1000:600:1/g:ce/q:95/aHR0cHM6Ly90cmlwLmNkbi1lenRyYXZlbC5jb20udHcvaW1nL0dSVC9ob21lNzE2LmpwZw.jpg",
      link: "https://trip.eztravel.com.tw/activity/sustainable/rail-tour/",
    },
    {
      img: "https://image.cdn-eztravel.com.tw/IdyykDlZQ0PBKvCaJU3lJ9ww-uCvJcBrjsb736gvz9U/rs:fit:1000:600:1/g:ce/q:95/aHR0cHM6Ly90cmlwLmNkbi1lenRyYXZlbC5jb20udHcvaW1nL0dSVC9ob21lNDkxLmpwZw.jpg",
      link: "https://trip.eztravel.com.tw/activity/west-taiwan/",
    },
    {
      img: "https://image.cdn-eztravel.com.tw/HhaSOPjIZaIktAsx1G7bUKnlaGD8Hxu7K_HoApV3jxI/rs:fit:1000:600:1/g:ce/q:95/aHR0cHM6Ly90cmlwLmNkbi1lenRyYXZlbC5jb20udHcvaW1nL0dSVC9ob21lNzIzLmpwZw.jpg",
      link: "https://trip.eztravel.com.tw/activity/ezwithldc/",
    },
    {
      img: "https://image.cdn-eztravel.com.tw/UzkbP3mFt6C2irdpxzxFfwVPqbYnBI2IzGebx8f9e9M/rs:fit:1000:600:1/g:ce/q:95/aHR0cHM6Ly90cmlwLmNkbi1lenRyYXZlbC5jb20udHcvaW1nL0dSVC9ob21lNjI0LmpwZw.jpg",
      link: "https://trip.eztravel.com.tw/activity/subsidy/",
    },
    {
      img: "https://image.cdn-eztravel.com.tw/jJydufjLfJnbboTGVMBW6bWWZi_66YPRWG2BJLzAgHM/rs:fit:1000:600:1/g:ce/q:95/aHR0cHM6Ly90cmlwLmNkbi1lenRyYXZlbC5jb20udHcvaW1nL0dSVC9IU1IwMDgxNy5qcGc.jpg",
      link: "https://www.eztravel.com.tw/activity/thsr/vacation/",
    },
    {
      img: "https://image.cdn-eztravel.com.tw/3ohWV02rHN_bBh3qCRw94nWSdAAov6aS4J_LmentbTM/rs:fit:1000:600:1/g:ce/q:95/aHR0cHM6Ly90cmlwLmNkbi1lenRyYXZlbC5jb20udHcvaW1nL0dSVC9ob21lMTUwLmpwZw.jpg",
      link: "https://trip.eztravel.com.tw/activity/self-driving/",
    },
    {
      img: "https://image.cdn-eztravel.com.tw/RjNNTRZ9epYipdfAwYJzAS3D0HzSrm6HV1xoFUI5mfs/rs:fit:1000:600:1/g:ce/q:95/aHR0cHM6Ly9ldmVudC5jZG4tZXp0cmF2ZWwuY29tLnR3L2hwaW1nL2JhbmsvZXN1bmJhbmstdHJhdmVsZXJjYXJkL2VzdW50cmF2ZWxjYXJkXzEyMjEucG5n.png",
      link: "https://www.eztravel.com.tw/events/esunbank/travelercard/",
    },
  ];

  let currentIndex = 0;

  document.addEventListener("DOMContentLoaded", () => {
    const track = document.getElementById("tw-track");
    const btnPrev = document.getElementById("tw-prev");
    const btnNext = document.getElementById("tw-next");
    const paginationEl = document.getElementById("tw-pagination");

    if (!track) return;

    // 1. 先渲染 HTML
    renderImages();
    createBullets();

    // 渲染完成後，稍微延遲一下再設定位置，確保 CSS 已經吃到寬度
    setTimeout(() => {
      updatePosition();
    }, 50);

    function renderImages() {
      track.innerHTML = "";
      twSliderData.forEach((item) => {
        // 建立 <a> 當作 Slide 容器
        const a = document.createElement("a");
        a.href = item.link;
        a.className = "slider-img-item"; // 這對應到 CSS 的 width: 100%

        const img = document.createElement("img");
        img.src = item.img;
        // 樣式已經在 CSS .slider-img-item img 設定好了，這裡不用寫 style

        a.appendChild(img);
        track.appendChild(a);
      });
    }

    // 2. 移動位置 (百分比法)
    function updatePosition() {
      // 因為每個 item 都是 flex-shrink: 0 且 width: 100%
      // 所以移動 100% 就是剛好移動一張圖的距離
      const percentage = -(currentIndex * 100);
      track.style.transform = `translate3d(${percentage}%, 0, 0)`;

      // 更新圓點
      const bullets = paginationEl.querySelectorAll(".slider-dot");
      bullets.forEach((b, i) => {
        if (i === currentIndex) b.classList.add("active");
        else b.classList.remove("active");
      });
    }

    function createBullets() {
      paginationEl.innerHTML = "";
      twSliderData.forEach((_, index) => {
        const span = document.createElement("span");
        span.className = "slider-dot";
        span.addEventListener("click", () => {
          currentIndex = index;
          updatePosition();
        });
        paginationEl.appendChild(span);
      });
    }

    btnNext.addEventListener("click", () => {
      currentIndex++;
      if (currentIndex >= twSliderData.length) currentIndex = 0;
      updatePosition();
    });

    btnPrev.addEventListener("click", () => {
      currentIndex--;
      if (currentIndex < 0) currentIndex = twSliderData.length - 1;
      updatePosition();
    });

    setInterval(() => {
      currentIndex++;
      if (currentIndex >= twSliderData.length) currentIndex = 0;
      updatePosition();
    }, 3000);
  });
})();
