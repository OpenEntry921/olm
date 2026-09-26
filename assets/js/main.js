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
    const hero = scrollCue.closest(".hero");
    const dismissalKey = "olm-home-scroll-cue-dismissed";
    let dismissed = sessionStorage.getItem(dismissalKey) === "true";
    let touchY = 0;
    let scrollFrame = 0;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const heroObserver = hero && "IntersectionObserver" in window
      ? new IntersectionObserver(([entry]) => {
          hero.classList.toggle("is-offscreen", !entry.isIntersecting);
        }, { threshold: 0 })
      : null;
    const removeDismissListeners = () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("keydown", onScrollKey);
      if (scrollFrame) cancelAnimationFrame(scrollFrame);
    };
    const dismiss = () => {
      if (dismissed) return;
      dismissed = true;
      sessionStorage.setItem(dismissalKey, "true");
      scrollCue.classList.add("is-hidden");
      scrollCue.setAttribute("tabindex", "-1");
      removeDismissListeners();
      window.setTimeout(() => { scrollCue.hidden = true; }, reducedMotion.matches ? 0 : 280);
    };
    function onScroll() {
      if (scrollFrame) return;
      scrollFrame = requestAnimationFrame(() => {
        scrollFrame = 0;
        if (window.scrollY >= 64) dismiss();
      });
    }
    function onWheel(event) { if (event.deltaY > 0) dismiss(); }
    function onTouchStart(event) { touchY = event.touches[0]?.clientY ?? 0; }
    function onTouchMove(event) { if ((event.touches[0]?.clientY ?? touchY) < touchY) dismiss(); }
    function onScrollKey(event) {
      const interactive = event.target instanceof Element && event.target.closest("button, a, input, select, textarea");
      if (["ArrowDown", "PageDown", "End", " "].includes(event.key) && !interactive) dismiss();
    }
    const activateScrollCue = () => {
      dismiss();
      const headerHeight = document.querySelector(".header")?.getBoundingClientRect().height ?? 0;
      const top = nextSection.getBoundingClientRect().top + window.scrollY - headerHeight;
      window.scrollTo({ top, behavior: reducedMotion.matches ? "auto" : "smooth" });
      nextSection.focus({ preventScroll: true });
    };
    scrollCue.addEventListener("click", activateScrollCue);
    heroObserver?.observe(hero);
    if (dismissed) {
      scrollCue.hidden = true;
      scrollCue.setAttribute("tabindex", "-1");
    } else if (window.scrollY >= 64) {
      dismiss();
    }
    if (!dismissed) {
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("wheel", onWheel, { passive: true });
      window.addEventListener("touchstart", onTouchStart, { passive: true });
      window.addEventListener("touchmove", onTouchMove, { passive: true });
      window.addEventListener("keydown", onScrollKey);
    }
    window.addEventListener("pagehide", () => {
      removeDismissListeners();
      heroObserver?.disconnect();
      scrollCue.removeEventListener("click", activateScrollCue);
    }, { once: true });
  }
  const revealItems = document.querySelectorAll(".reveal");
  if (revealItems.length) {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion || !("IntersectionObserver" in window)) revealItems.forEach(item => item.classList.add("is-visible"));
    else {
      const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add("is-visible"); observer.unobserve(entry.target); } });
      }, { threshold: 0.12 });
      revealItems.forEach(item => revealObserver.observe(item));
    }
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

(() => {
  const form = document.querySelector("#ai-care-form");
  if (!form) return;
  const input = document.querySelector("#ai-question");
  const count = document.querySelector("#ai-char-count");
  const result = document.querySelector("#ai-result");
  const status = document.querySelector("#ai-status");
  const answer = document.querySelector("#ai-answer");
  const submit = form.querySelector("button[type=submit]");
  const labels = { coreAnswer:"핵심 답변", recommendationReason:"추천 이유", usage:"사용 방법", cautions:"주의사항", advertisingAnalysis:"광고 문구 확인", uncertainty:"추가로 확인할 사항", followUpQuestion:"후속 질문" };
  const safeText = value => typeof value === "string" ? value : "";
  const section = (title, value, tone="") => value ? `<section class="ai-answer-section"${tone?` data-tone="${tone}"`:""}><h3>${title}</h3><p>${safeText(value)}</p></section>` : "";
  const render = data => {
    const products = Array.isArray(data.recommendedProducts) ? data.recommendedProducts : [];
    const sources = Array.isArray(data.sources) ? data.sources : [];
    const tone = products[0]?.brand?.toLowerCase() === "ludwik" ? "ludwik" : products.length ? "biostar" : "";
    answer.innerHTML = `<div class="ai-answer-grid">${section(labels.coreAnswer,data.coreAnswer,tone)}${products.length?`<section><h3>추천 제품</h3><div class="ai-products">${products.map(p=>`<article class="ai-product"><img src="${p.image}" alt="" width="92" height="112"><div><h4>${p.name}</h4><p>${p.purpose}</p><a href="${p.url}">상세 정보 보기</a></div></article>`).join("")}</div></section>`:""}${section(labels.recommendationReason,data.recommendationReason,tone)}${section(labels.usage,data.usage)}${section(labels.cautions,data.cautions)}${section(labels.advertisingAnalysis,data.advertisingAnalysis)}${sources.length?`<section class="ai-answer-section"><h3>확인 근거</h3><ul class="ai-source-list">${sources.map(s=>`<li>${safeText(s.title)}${s.checkedAt?` · ${safeText(s.checkedAt)}`:""}</li>`).join("")}</ul></section>`:""}${section(labels.uncertainty,data.uncertainty)}${section(labels.followUpQuestion,data.followUpQuestion)}</div>`;
  };
  input.addEventListener("input",()=>{ count.textContent=`${input.value.length.toLocaleString("ko-KR")} / 1,200`; });
  document.querySelectorAll("[data-ai-question]").forEach(button=>button.addEventListener("click",()=>{ input.value=button.dataset.aiQuestion; input.dispatchEvent(new Event("input")); input.focus(); }));
  form.addEventListener("submit",async event=>{
    event.preventDefault(); if(!form.reportValidity()) return;
    result.hidden=false; answer.innerHTML=""; status.dataset.loading="true"; status.textContent="승인된 자료에서 관련 정보를 확인하고 있습니다…"; submit.disabled=true;
    try {
      const response=await fetch("/api/ai-clean-care",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({question:input.value,history:[],language:"ko"}),signal:AbortSignal.timeout(20000)});
      const data=await response.json().catch(()=>({}));
      if(!response.ok) throw Object.assign(new Error("request"),{status:response.status,message:data.message});
      render(data); status.textContent="답변이 준비되었습니다.";
    } catch(error) {
      const messages={429:"질문이 잠시 많이 접수되고 있습니다. 잠시 후 다시 시도해 주세요.",503:"AI 클린케어 연결을 준비하고 있습니다. 제품별 기본 정보는 각 브랜드 상세페이지에서 확인해 주세요."};
      status.textContent=messages[error.status]||error.message||"답변을 생성하지 못했습니다. 잠시 후 다시 시도해 주세요."; status.classList.add("ai-error");
    } finally { delete status.dataset.loading; submit.disabled=false; result.focus(); }
  });
})();
