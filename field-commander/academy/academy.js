const cards = Array.isArray(window.ELARA_ACADEMY_CARDS) ? window.ELARA_ACADEMY_CARDS : [];
const learnedKey = "elara_academy_learned_v1";
let learned = new Set(JSON.parse(localStorage.getItem(learnedKey) || "[]"));
let activeCategory = "All";
let currentIndex = -1;
let visibleCards = [...cards];

const el = id => document.getElementById(id);
const searchInput = el("searchInput");
const filters = el("categoryFilters");
const grid = el("cardGrid");
const libraryView = el("libraryView");
const lessonView = el("lessonView");

function categories(){
  return ["All", ...new Set(cards.map(c => c.category))];
}

function renderFilters(){
  filters.innerHTML = categories().map(category =>
    `<button class="filter-btn ${category === activeCategory ? "active" : ""}" data-category="${category}">${category}</button>`
  ).join("");
  filters.querySelectorAll("button").forEach(btn => {
    btn.addEventListener("click", () => {
      activeCategory = btn.dataset.category;
      renderFilters();
      renderCards();
    });
  });
}

function renderCards(){
  const q = searchInput.value.trim().toLowerCase();
  visibleCards = cards.filter(card => {
    const categoryMatch = activeCategory === "All" || card.category === activeCategory;
    const haystack = [
      card.term, card.short_definition, card.what_it_is, card.why_it_matters,
      card.real_example, card.common_mistake, card.professional_tip,
      ...(card.related_terms || [])
    ].join(" ").toLowerCase();
    return categoryMatch && (!q || haystack.includes(q));
  });

  el("cardCount").textContent = visibleCards.length;

  if(!visibleCards.length){
    grid.innerHTML = `<div class="empty-state"><h3>No Academy cards found</h3><p>Try another word or category.</p></div>`;
    return;
  }

  grid.innerHTML = visibleCards.map((card, index) => `
    <button class="knowledge-card" data-index="${index}">
      <div class="card-top">
        <span class="pill">${card.category}</span>
        <span class="spark">✦</span>
      </div>
      <h3>${escapeHtml(card.term)}</h3>
      <p>${escapeHtml(card.short_definition)}</p>
      ${learned.has(card.id) ? `<div class="learned">✓ Learned</div>` : ""}
    </button>
  `).join("");

  grid.querySelectorAll(".knowledge-card").forEach(button => {
    button.addEventListener("click", () => openLesson(Number(button.dataset.index)));
  });
}

function openLesson(index){
  if(!visibleCards.length) return;
  currentIndex = Math.max(0, Math.min(index, visibleCards.length - 1));
  const card = visibleCards[currentIndex];

  el("lessonCategory").textContent = `${card.category} · ${card.level}`;
  el("lessonTerm").textContent = card.term;
  el("lessonShort").textContent = card.short_definition;
  el("lessonWhat").textContent = card.what_it_is;
  el("lessonWhy").textContent = card.why_it_matters;
  el("lessonExample").textContent = card.real_example;
  el("lessonMistake").textContent = card.common_mistake;
  el("lessonTip").textContent = card.professional_tip;
  el("relatedTerms").innerHTML = (card.related_terms || []).map(term =>
    `<button class="related-term" data-term="${escapeHtml(term)}">${escapeHtml(term)}</button>`
  ).join("");

  const legal = el("legalNote");
  if(card.legal_note){
    legal.textContent = card.legal_note;
    legal.classList.remove("hidden");
  } else {
    legal.classList.add("hidden");
  }

  el("markLearnedBtn").textContent = learned.has(card.id) ? "✓ Learned" : "✓ Mark as Learned";
  el("previousBtn").disabled = currentIndex <= 0;
  el("nextBtn").disabled = currentIndex >= visibleCards.length - 1;

  libraryView.classList.add("hidden");
  lessonView.classList.remove("hidden");
  el("pageTitle").textContent = card.term;
  window.scrollTo({top:0, behavior:"smooth"});

  lessonView.querySelectorAll(".related-term").forEach(btn => {
    btn.addEventListener("click", () => {
      const term = btn.dataset.term.toLowerCase();
      const idx = cards.findIndex(c => c.term.toLowerCase() === term);
      if(idx >= 0){
        activeCategory = "All";
        searchInput.value = "";
        visibleCards = [...cards];
        renderFilters();
        openLesson(idx);
      } else {
        searchInput.value = btn.dataset.term;
        closeLesson();
        renderCards();
      }
    });
  });
}

function closeLesson(){
  speechSynthesis.cancel();
  lessonView.classList.add("hidden");
  libraryView.classList.remove("hidden");
  el("pageTitle").textContent = "Academy Library";
  currentIndex = -1;
}

function readCurrent(){
  if(currentIndex < 0) return;
  const card = visibleCards[currentIndex];
  speechSynthesis.cancel();
  const text = `${card.term}. ${card.short_definition}. What it is. ${card.what_it_is}. Why it matters. ${card.why_it_matters}. Real example. ${card.real_example}. Common mistake. ${card.common_mistake}. ELARA professional tip. ${card.professional_tip}.`;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.93;
  utterance.pitch = 1;
  const voices = speechSynthesis.getVoices();
  const preferred = voices.find(v => /female|zira|samantha|aria|jenny|serena/i.test(v.name)) ||
                    voices.find(v => /^en/i.test(v.lang));
  if(preferred) utterance.voice = preferred;
  speechSynthesis.speak(utterance);
}

function markLearned(){
  if(currentIndex < 0) return;
  const card = visibleCards[currentIndex];
  if(learned.has(card.id)) learned.delete(card.id);
  else learned.add(card.id);
  localStorage.setItem(learnedKey, JSON.stringify([...learned]));
  el("markLearnedBtn").textContent = learned.has(card.id) ? "✓ Learned" : "✓ Mark as Learned";
}

function randomLesson(){
  const pool = visibleCards.length ? visibleCards : cards;
  if(!pool.length) return;
  visibleCards = pool;
  openLesson(Math.floor(Math.random() * pool.length));
}

function escapeHtml(value=""){
  return String(value)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

searchInput.addEventListener("input", renderCards);
el("backBtn").addEventListener("click", closeLesson);
el("readBtn").addEventListener("click", readCurrent);
el("markLearnedBtn").addEventListener("click", markLearned);
el("previousBtn").addEventListener("click", () => openLesson(currentIndex - 1));
el("nextBtn").addEventListener("click", () => openLesson(currentIndex + 1));
el("randomLessonBtn").addEventListener("click", randomLesson);

speechSynthesis.getVoices();
renderFilters();
renderCards();
