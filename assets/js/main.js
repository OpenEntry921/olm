(() => {
  const menu = document.querySelector("#primary-nav");
  const open = document.querySelector("#menu-open");
  const close = document.querySelector("#menu-close");
  let lastFocus;
  const setMenu = (isOpen) => {
    if (!menu || !open) return;
    menu.classList.toggle("open", isOpen);
    open.setAttribute("aria-expanded", String(isOpen));
    document.body.classList.toggle("menu-open", isOpen);
    if (isOpen) { lastFocus = document.activeElement; close?.focus(); }
    else lastFocus?.focus();
  };
  open?.addEventListener("click", () => setMenu(true));
  close?.addEventListener("click", () => setMenu(false));
  menu?.querySelectorAll("a").forEach(a => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && menu?.classList.contains("open")) setMenu(false);
    if (e.key === "Tab" && menu?.classList.contains("open")) {
      const focusable = [...menu.querySelectorAll("button,a")];
      const first = focusable[0], last = focusable.at(-1);
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  const scrollCue = document.querySelector(".hero-scroll-cue");
  const nextSection = document.querySelector("#home-introduction");
  if (scrollCue && nextSection) {
    let dismissed = false;
    let touchY = 0;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const removeDismissListeners = () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("keydown", onScrollKey);
    };
    const dismiss = () => {
      if (dismissed) return;
      dismissed = true;
      scrollCue.classList.add("is-hidden");
      scrollCue.setAttribute("tabindex", "-1");
      removeDismissListeners();
      window.setTimeout(() => { scrollCue.hidden = true; }, reducedMotion.matches ? 0 : 280);
    };
    function onScroll() { if (window.scrollY >= 64) dismiss(); }
    function onWheel(event) { if (event.deltaY > 0) dismiss(); }
    function onTouchStart(event) { touchY = event.touches[0]?.clientY ?? 0; }
    function onTouchMove(event) { if ((event.touches[0]?.clientY ?? touchY) < touchY) dismiss(); }
    function onScrollKey(event) {
      const interactive = event.target instanceof Element && event.target.closest("button, a, input, select, textarea");
      if (["ArrowDown", "PageDown", "End", " "].includes(event.key) && !interactive) dismiss();
    }
    scrollCue.addEventListener("click", () => {
      dismiss();
      const headerHeight = document.querySelector(".header")?.getBoundingClientRect().height ?? 0;
      const top = nextSection.getBoundingClientRect().top + window.scrollY - headerHeight;
      window.scrollTo({ top, behavior: reducedMotion.matches ? "auto" : "smooth" });
      nextSection.focus({ preventScroll: true });
    });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("keydown", onScrollKey);
    onScroll();
  }
  const form = document.querySelector("#contact-form");
  form?.addEventListener("submit", async e => {
    e.preventDefault();
    const status = document.querySelector("#form-status");
    const endpoint = window.OREUM_DATA?.formEndpoint;
    if (!form.reportValidity()) return;
    if (!endpoint) {
      status.textContent = "문의 내용이 확인되었습니다. 현재 온라인 전송 설정을 준비 중입니다. 아래 이메일을 이용해 주세요.";
      status.focus(); return;
    }
    status.textContent = "전송 중입니다…";
    try {
      const response = await fetch(endpoint, { method: "POST", body: new FormData(form) });
      if (!response.ok) throw new Error("Request failed");
      status.textContent = "문의가 접수되었습니다."; form.reset();
    } catch { status.textContent = "전송하지 못했습니다. 잠시 후 다시 시도하거나 이메일을 이용해 주세요."; }
    status.focus();
  });
})();
