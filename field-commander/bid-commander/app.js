const content=document.getElementById("content");
const pageTitle=document.getElementById("pageTitle");
const navButtons=[...document.querySelectorAll(".nav")];
const checklistLabels={
  invitationReviewed:"Invitation or request reviewed",
  scopeReviewed:"Scope of work reviewed",
  siteVisitReviewed:"Site visit requirements checked",
  drawingsReviewed:"Drawings reviewed",
  specificationsReviewed:"Specifications reviewed",
  addendaReviewed:"Addenda checked",
  laborPriced:"Labor priced",
  materialsPriced:"Materials priced",
  equipmentPriced:"Equipment priced",
  subcontractorsPriced:"Subcontractor quotes received",
  insuranceConfirmed:"Insurance requirements confirmed",
  bondsConfirmed:"Bond requirements confirmed",
  referencesReady:"References ready",
  proposalReviewed:"Proposal reviewed",
  submissionMethodConfirmed:"Submission method confirmed",
  submitted:"Bid submitted"
};
function esc(v=""){return String(v).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;")}
function money(n){return new Intl.NumberFormat("en-US",{style:"currency",currency:"USD"}).format(Number(n||0))}
function showPage(page){
  navButtons.forEach(b=>b.classList.toggle("active",b.dataset.page===page));
  const titles={dashboard:"Bid Dashboard",newbid:"Start New Bid",checklist:"Bid Checklist",scope:"Scope Review",pricing:"Pricing",submission:"Submission",academy:"Bid Academy"};
  pageTitle.textContent=titles[page]||"Bid Commander";
  const views={dashboard, newbid, checklist, scope, pricing, submission, academy};
  content.innerHTML=views[page]();
}
navButtons.forEach(b=>b.onclick=()=>showPage(b.dataset.page));

function dashboard(){
  const bids=ELARABid.loadAll();
  const active=ELARABid.getActive();
  const ready=bids.filter(b=>ELARABidScoring.readiness(b).score>=80).length;
  return `<div class="grid">
    <div class="card stat"><strong>${bids.length}</strong><span>Total Bids</span></div>
    <div class="card stat"><strong>${ready}</strong><span>80%+ Ready</span></div>
    <div class="card stat"><strong>${active?ELARABidScoring.readiness(active).score:0}%</strong><span>Active Bid Readiness</span></div>
  </div>
  <div class="card">
    <h3>Active Bid</h3>
    ${active?activeBidCard(active):`<div class="empty"><h3>No active bid</h3><p>Start a bid and ELARA will guide you one step at a time.</p><button class="primary" onclick="showPage('newbid')">Start New Bid</button></div>`}
  </div>
  <div class="card">
    <h3>All Bids</h3>
    ${bids.length?bids.map(b=>bidRow(b)).join(""):`<p class="muted">No bids saved yet.</p>`}
  </div>`;
}
function activeBidCard(bid){
  const r=ELARABidScoring.readiness(bid);
  return `<div class="bid-row">
    <div>
      <span class="badge">${esc(bid.projectType)}</span>
      <h3>${esc(bid.projectName)}</h3>
      <p class="muted">${esc(bid.client)} · ${esc(bid.location)} · Due ${esc(bid.dueDate||"Not set")}</p>
      <div class="progress"><span style="width:${r.score}%"></span></div>
      <p class="muted">${r.score}% ready</p>
    </div>
    <div class="actions">
      <button class="secondary" onclick="showPage('checklist')">Continue</button>
      <button class="secondary" onclick="ELARABidExport.summary(ELARABid.getActive())">Export Summary</button>
    </div>
  </div>`;
}
function bidRow(bid){
  const score=ELARABidScoring.readiness(bid).score;
  return `<div class="bid-row">
    <div><b>${esc(bid.projectName)}</b><div class="muted">${esc(bid.client)} · ${score}% ready</div></div>
    <div class="actions">
      <button class="secondary" onclick="selectBid('${bid.id}')">Open</button>
      <button class="danger" onclick="removeBid('${bid.id}')">Delete</button>
    </div>
  </div>`;
}
function selectBid(id){ELARABid.setActive(id);showPage("dashboard")}
function removeBid(id){if(confirm("Delete this bid workspace?")){ELARABid.delete(id);showPage("dashboard")}}

function newbid(){
  return `<div class="card">
    <h3>Tell ELARA about the job</h3>
    <p class="muted">Enter what you know. Missing information can be added later.</p>
    <div class="form-grid">
      <div><label>Project name</label><input id="projectName" placeholder="Example: School Interior Renovation"></div>
      <div><label>Client or company</label><input id="client" placeholder="Who requested the bid?"></div>
      <div><label>Location</label><input id="location" placeholder="City or project address"></div>
      <div><label>Bid due date</label><input id="dueDate" type="date"></div>
      <div><label>Project type</label><select id="projectType"><option>Interior Remodel</option><option>School</option><option>Office</option><option>Apartment</option><option>Hospital</option><option>Painting</option><option>Drywall</option><option>Other</option></select></div>
      <div><label>Contact person</label><input id="contact" placeholder="Estimator, owner, GC..."></div>
      <div class="full"><label>What do they want priced?</label><textarea id="scope" placeholder="Describe the work in your own words."></textarea></div>
    </div>
    <div class="actions"><button class="primary" onclick="createBid()">Create Bid Workspace</button></div>
  </div>`;
}
function createBid(){
  const bid=ELARABid.create({
    projectName:projectName.value.trim(),
    client:client.value.trim(),
    location:location.value.trim(),
    dueDate:dueDate.value,
    projectType:projectType.value,
    contact:contact.value.trim(),
    scope:scope.value.trim()
  });
  showPage("checklist");
}

function requireActive(){
  const bid=ELARABid.getActive();
  if(!bid){
    return `<div class="empty"><h3>No active bid</h3><button class="primary" onclick="showPage('newbid')">Start New Bid</button></div>`;
  }
  return bid;
}
function checklist(){
  const bid=requireActive(); if(typeof bid==="string")return bid;
  return `<div class="card">
    <h3>${esc(bid.projectName)} — Bid Checklist</h3>
    <p class="muted">Check each item as it is confirmed. ELARA uses this to calculate readiness.</p>
    ${Object.entries(checklistLabels).map(([key,label])=>`<label class="check-row"><input type="checkbox" ${bid.checklist[key]?"checked":""} onchange="toggleCheck('${key}',this.checked)"><span>${label}${academySpark(key)}</span></label>`).join("")}
  </div>
  ${readinessPanel(bid)}`;
}
function toggleCheck(key,value){
  const bid=ELARABid.getActive();
  ELARABid.updateSection(bid.id,"checklist",{[key]:value});
  showPage("checklist");
}
function academySpark(key){
  const help={scopeReviewed:"Scope means exactly what work is included.",addendaReviewed:"An addendum changes or clarifies the bid documents.",bondsConfirmed:"Some jobs require bid, payment, or performance bonds.",submissionMethodConfirmed:"Confirm whether the bid is sent by email, portal, or sealed delivery."};
  return help[key]?` <button class="secondary" style="padding:3px 8px" title="${esc(help[key])}">✦</button>`:"";
}
function readinessPanel(bid){
  const r=ELARABidScoring.readiness(bid);
  return `<div class="card">
    <div style="display:flex;gap:25px;align-items:center;flex-wrap:wrap">
      <div class="score-ring" style="--score:${r.score}"><strong>${r.score}%</strong></div>
      <div><h3>Submission Readiness</h3>${r.warnings.slice(0,5).map(w=>`<div class="warning">${esc(w)}</div>`).join("")||`<div class="good">ELARA found no major missing items.</div>`}</div>
    </div>
  </div>`;
}

function scope(){
  const bid=requireActive(); if(typeof bid==="string")return bid;
  return `<div class="card"><h3>Scope Review</h3>
    <div class="form-grid">
      <div class="full"><label>Work included</label><textarea id="scopeText">${esc(bid.scope)}</textarea></div>
      <div class="full"><label>Exclusions — what is not included?</label><textarea id="exclusionsText">${esc(bid.exclusions)}</textarea></div>
      <div class="full"><label>Assumptions</label><textarea id="assumptionsText">${esc(bid.assumptions)}</textarea></div>
      <div class="full"><label>Questions to ask before bidding</label><textarea id="questionsText">${esc(bid.questions)}</textarea></div>
    </div>
    <div class="actions"><button class="primary" onclick="saveScope()">Save Scope Review</button></div>
  </div>
  <div class="card"><h3>ELARA Scope Check</h3>
    ${bid.scope?`<div class="good">Scope information has been entered.</div>`:`<div class="warning">The scope is still blank.</div>`}
    ${bid.exclusions?`<div class="good">Exclusions are documented.</div>`:`<div class="warning">No exclusions are listed. Confirm what is not included.</div>`}
  </div>`;
}
function saveScope(){
  const bid=ELARABid.getActive();
  ELARABid.update(bid.id,{scope:scopeText.value,exclusions:exclusionsText.value,assumptions:assumptionsText.value,questions:questionsText.value});
  ELARABid.updateSection(bid.id,"checklist",{scopeReviewed:true});
  showPage("scope");
}

function pricing(){
  const bid=requireActive(); if(typeof bid==="string")return bid;
  const p=bid.pricing,t=ELARABidScoring.totals(bid);
  const rows=[["labor","Labor"],["materials","Materials"],["equipment","Equipment"],["subcontractors","Subcontractors"],["permits","Permits / Fees"],["other","Other"]];
  return `<div class="card"><h3>Pricing Worksheet</h3>
    <table class="price-table"><thead><tr><th>Cost Category</th><th>Amount</th></tr></thead><tbody>
    ${rows.map(([key,label])=>`<tr><td>${label}</td><td><input id="price_${key}" type="number" min="0" step="0.01" value="${p[key]}"></td></tr>`).join("")}
    </tbody></table>
    <div class="form-grid" style="margin-top:18px">
      <div><label>Overhead %</label><input id="overheadPercent" type="number" value="${p.overheadPercent}"></div>
      <div><label>Profit %</label><input id="profitPercent" type="number" value="${p.profitPercent}"></div>
      <div><label>Tax %</label><input id="taxPercent" type="number" value="${p.taxPercent}"></div>
    </div>
    <div class="actions"><button class="primary" onclick="savePricing()">Calculate and Save</button></div>
  </div>
  <div class="grid">
    <div class="card stat"><strong>${money(t.direct)}</strong><span>Direct Cost</span></div>
    <div class="card stat"><strong>${money(t.overhead)}</strong><span>Overhead</span></div>
    <div class="card stat"><strong>${money(t.profit)}</strong><span>Profit</span></div>
    <div class="card stat"><strong>${money(t.total)}</strong><span>Proposed Price</span></div>
  </div>
  <div class="warning">Pricing must be reviewed and approved by Ernest's employer before submission. ELARA organizes the numbers but does not authorize the final price.</div>`;
}
function savePricing(){
  const bid=ELARABid.getActive();
  const pricing={};
  ["labor","materials","equipment","subcontractors","permits","other"].forEach(k=>pricing[k]=Number(document.getElementById("price_"+k).value||0));
  pricing.overheadPercent=Number(overheadPercent.value||0);
  pricing.profitPercent=Number(profitPercent.value||0);
  pricing.taxPercent=Number(taxPercent.value||0);
  ELARABid.updateSection(bid.id,"pricing",pricing);
  ELARABid.updateSection(bid.id,"checklist",{laborPriced:pricing.labor>0,materialsPriced:pricing.materials>0,equipmentPriced:pricing.equipment>0,subcontractorsPriced:pricing.subcontractors>0});
  showPage("pricing");
}

function submission(){
  const bid=requireActive(); if(typeof bid==="string")return bid;
  const s=bid.submission,r=ELARABidScoring.readiness(bid);
  return `<div class="card"><h3>Submission Instructions</h3>
    <div class="form-grid">
      <div><label>Submission method</label><select id="submissionMethod"><option value="">Select</option>${["Email","Online Portal","Sealed Bid","Hand Delivery","Other"].map(v=>`<option ${s.method===v?"selected":""}>${v}</option>`).join("")}</select></div>
      <div><label>Portal or website</label><input id="portal" value="${esc(s.portal)}"></div>
      <div><label>Email address</label><input id="submissionEmail" value="${esc(s.email)}"></div>
      <div><label>Confirmation number</label><input id="confirmationNumber" value="${esc(s.confirmationNumber)}"></div>
      <div class="full"><label>Submission instructions</label><textarea id="submissionInstructions">${esc(s.instructions)}</textarea></div>
    </div>
    <div class="actions">
      <button class="primary" onclick="saveSubmission()">Save Instructions</button>
      <button class="secondary" onclick="ELARABidExport.summary(ELARABid.getActive())">Download Bid Summary</button>
      <button class="secondary" onclick="ELARABidExport.json(ELARABid.getActive())">Backup Bid</button>
    </div>
  </div>
  ${readinessPanel(bid)}
  <div class="card"><h3>Final Submission</h3>
    <p class="muted">ELARA will not claim a bid was submitted unless Ernest records the confirmation.</p>
    <button class="primary" ${r.score<80?"disabled title='Reach 80% readiness first'":""} onclick="markSubmitted()">Record Bid as Submitted</button>
  </div>`;
}
function saveSubmission(){
  const bid=ELARABid.getActive();
  const submission={...bid.submission,method:submissionMethod.value,portal:portal.value,email:submissionEmail.value,instructions:submissionInstructions.value,confirmationNumber:confirmationNumber.value};
  ELARABid.updateSection(bid.id,"submission",submission);
  ELARABid.updateSection(bid.id,"checklist",{submissionMethodConfirmed:Boolean(submission.method)});
  showPage("submission");
}
function markSubmitted(){
  const bid=ELARABid.getActive();
  const confirmation=prompt("Enter confirmation number or submission note:");
  if(!confirmation)return;
  ELARABid.updateSection(bid.id,"submission",{submittedAt:new Date().toISOString(),confirmationNumber:confirmation});
  ELARABid.updateSection(bid.id,"checklist",{submitted:true});
  showPage("submission");
}

function academy(){
  return `<div class="card"><h3>✦ Bid Academy</h3>
    <p class="muted">Optional explanations for Ernest. Nothing here interrupts the bidding workflow.</p>
    ${[
      ["Scope of Work","The exact work the company is agreeing to price and perform."],
      ["Exclusion","Work specifically not included in the bid price."],
      ["Addendum","A formal change or clarification issued after the original bid documents."],
      ["Alternate","An optional price for adding, removing, or changing part of the work."],
      ["Bid Bond","A guarantee that the bidder will honor the bid if selected, when required."],
      ["Takeoff","Measuring quantities from plans so labor and material can be priced."],
      ["Overhead","Business costs that support the work but are not one direct job item."],
      ["Profit","The amount added above job costs and overhead as the company's return."],
      ["Bid Due Date","The exact deadline by which the bid must be received."],
      ["Submission Confirmation","Proof that the bid was received, such as a portal receipt or email confirmation."]
    ].map(([term,desc])=>`<div class="lesson"><h4>${term}</h4><p class="muted">${desc}</p></div>`).join("")}
  </div>`;
}
showPage("dashboard");
