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
    const submit = form.querySelector('[type="submit"]');
    submit.disabled = true;
    try {
      const data = new FormData(form);
      const response = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: data.get("type"), name: data.get("name"), email: data.get("email"), phone: data.get("phone"), message: data.get("message") }) });
      let result = {}; try { result = await response.json(); } catch {}
      if (!response.ok) throw new Error(typeof result.message === "string" ? result.message : "");
      status.textContent = "문의가 접수되었습니다. 담당자가 확인 후 연락드리겠습니다."; form.reset();
    } catch (error) { status.textContent = error.message || "전송하지 못했습니다. 잠시 후 다시 시도하거나 이메일을 이용해 주세요."; }
    finally { submit.disabled = false; }
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
  const deepButton = document.querySelector("#ai-deep-button");
  const deepResult = document.querySelector("#ai-deep-result");
  const deepStatus = document.querySelector("#ai-deep-status");
  const deepAnswer = document.querySelector("#ai-deep-answer");
  const submit = form.querySelector("button[type=submit]");
  const labels = { coreAnswer:"핵심 답변", recommendationReason:"추천 이유", usage:"사용 방법", cautions:"주의사항", advertisingAnalysis:"광고 문구 확인", uncertainty:"추가로 확인할 사항", followUpQuestion:"후속 질문" };
  const deepLabels = { coreAnswer:"심층 답변", recommendationReason:"확인된 내용", usage:"추가 확인 방법", cautions:"국내 기준에서 확인할 사항", advertisingAnalysis:"추가 분석", uncertainty:"확인되지 않은 내용", followUpQuestion:"후속 질문" };
  const escapeHtml = value => String(value??"").replace(/[&<>"']/g,character=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[character]);
  const section = (title, value, tone="") => value ? `<section class="ai-answer-section"${tone?` data-tone="${tone}"`:""}><h3>${title}</h3><p>${escapeHtml(value)}</p></section>` : "";
  const render = (data,target,sectionLabels=labels) => {
    const products = Array.isArray(data.recommendedProducts) ? data.recommendedProducts : [];
    const sources = Array.isArray(data.sources) ? data.sources : [];
    const tone = products[0]?.brand?.toLowerCase() === "ludwik" ? "ludwik" : products.length ? "biostar" : "";
    target.innerHTML = `<div class="ai-answer-grid">${section(sectionLabels.coreAnswer,data.coreAnswer,tone)}${products.length?`<section><h3>추천 제품</h3><div class="ai-products">${products.map(p=>`<article class="ai-product"><img src="${escapeHtml(p.image)}" alt="" width="92" height="112"><div><h4>${escapeHtml(p.name)}</h4><p>${escapeHtml(p.purpose)}</p><a href="${escapeHtml(p.url)}">상세 정보 보기</a></div></article>`).join("")}</div></section>`:""}${section(sectionLabels.recommendationReason,data.recommendationReason,tone)}${section(sectionLabels.usage,data.usage)}${section(sectionLabels.cautions,data.cautions)}${section(sectionLabels.advertisingAnalysis,data.advertisingAnalysis)}${sources.length?`<section class="ai-answer-section"><h3>참고할 자료</h3><ul class="ai-source-list">${sources.map(s=>`<li>${escapeHtml(s.title)}${s.checkedAt?` · ${escapeHtml(s.checkedAt)}`:""}</li>`).join("")}</ul></section>`:""}${section(sectionLabels.uncertainty,data.uncertainty)}${section(sectionLabels.followUpQuestion,data.followUpQuestion)}</div>`;
  };
  let originalQuestion="", originalAnswer="", deepPending=false;
  const errorMessage = error => ({LOCAL_RATE_LIMITED:"질문이 잠시 많이 접수되고 있습니다. 잠시 후 다시 시도해 주세요.",API_KEY_MISSING:"AI 연결 설정을 확인하고 있습니다.",AUTHENTICATION_FAILED:"AI 서비스 인증 설정을 확인해 주세요.",OPENAI_RATE_LIMITED:"AI 서비스의 요청 한도를 확인해 주세요.",NETWORK_ERROR:"AI 서비스 연결 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",PROVIDER_ERROR:"AI 서비스 연결 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요."})[error.code]||error.message||"답변을 생성하지 못했습니다. 잠시 후 다시 시도해 주세요.";
  input.addEventListener("input",()=>{ count.textContent=`${input.value.length.toLocaleString("ko-KR")} / 1,200`; });
  document.querySelectorAll("[data-ai-question]").forEach(button=>button.addEventListener("click",()=>{ input.value=button.dataset.aiQuestion; input.dispatchEvent(new Event("input")); input.focus(); }));
  form.addEventListener("submit",async event=>{
    event.preventDefault(); if(!form.reportValidity()) return;
    result.hidden=false; deepResult.hidden=true; deepButton.hidden=true; answer.innerHTML=""; deepAnswer.innerHTML=""; status.classList.remove("ai-error"); status.dataset.loading="true"; status.textContent="승인된 자료에서 관련 정보를 확인하고 있습니다…"; submit.disabled=true;
    try {
      originalQuestion=input.value;
      const response=await fetch("/api/ai-clean-care",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({question:originalQuestion,history:[],mode:"standard",language:"ko"}),signal:AbortSignal.timeout(20000)});
      const data=await response.json().catch(()=>({}));
      if(!response.ok) throw Object.assign(new Error("request"),{status:response.status,code:data.code,message:data.message});
      render(data,answer); originalAnswer=JSON.stringify(data); deepButton.hidden=false; status.textContent="답변이 준비되었습니다.";
    } catch(error) {
      status.textContent=errorMessage(error); status.classList.add("ai-error");
    } finally { delete status.dataset.loading; submit.disabled=false; result.focus(); }
  });
  deepButton.addEventListener("click",async()=>{
    if(deepPending||!originalQuestion||!originalAnswer)return;
    deepPending=true; deepButton.disabled=true; deepResult.hidden=false; deepStatus.classList.remove("ai-error"); deepStatus.dataset.loading="true"; deepStatus.textContent="조금 더 자세히 살펴보고 있습니다…";
    try{
      const history=[{role:"user",content:originalQuestion},{role:"assistant",content:originalAnswer}];
      const response=await fetch("/api/ai-clean-care",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({originalQuestion,originalAnswer,history,mode:"deep",language:"ko"}),signal:AbortSignal.timeout(30000)});
      const data=await response.json().catch(()=>({}));
      if(!response.ok)throw Object.assign(new Error("request"),{status:response.status,code:data.code,message:data.message});
      render(data,deepAnswer,deepLabels); deepStatus.textContent="추가 분석이 준비되었습니다.";
    }catch(error){deepStatus.textContent=errorMessage(error);deepStatus.classList.add("ai-error");}
    finally{deepPending=false;deepButton.disabled=false;delete deepStatus.dataset.loading;deepResult.focus();}
  });
})();
