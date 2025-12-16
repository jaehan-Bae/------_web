// js/progress-slider.js
document.addEventListener("DOMContentLoaded", () => {
  console.log("[progress-slider] init");

  const slider = document.querySelector(".progress-slider");
  if (!slider) return;

  const slidesWrapper = slider.querySelector(".progress-slides");
  const slides = slider.querySelectorAll(".progress-slide");
  const nextBtn = slider.querySelector(".slider-next");
  // ✅ dot 범위 좁히기 (다른 dot들 섞이는 문제 방지)
  const dots = slider.querySelectorAll(".slider-dots .dot");

  if (!slidesWrapper) {
    console.warn("[progress-slider] .progress-slides not found");
    return;
  }

  let currentIndex = 0;
  const total = slides.length || 0;

  function updateSlider() {
    console.log("[progress-slider] update", currentIndex);
    slidesWrapper.style.transform = `translateX(-${currentIndex * 100}%)`;

    dots.forEach((dot, idx) => {
      dot.classList.toggle("active", idx === currentIndex);
    });

    document.dispatchEvent(
      new CustomEvent("progress:slideChange", {
        detail: { index: currentIndex, total }
      })
    );
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      console.log("[progress-slider] next click");
      currentIndex = total ? (currentIndex + 1) % total : 0;
      updateSlider();
    });
  } else {
    console.warn("[progress-slider] .slider-next not found");
  }

  dots.forEach((dot, idx) => {
    dot.addEventListener("click", () => {
      console.log("[progress-slider] dot click", idx);
      currentIndex = idx;
      updateSlider();
    });
  });

  updateSlider();
});
