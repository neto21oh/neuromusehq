const BID_KEY="elara_bid_intelligence_v1";
const ACTIVE_BID_KEY="elara_active_bid_v1";

function bidLoadAll(){
  try{return JSON.parse(localStorage.getItem(BID_KEY))||[]}catch(e){return[]}
}
function bidSaveAll(bids){localStorage.setItem(BID_KEY,JSON.stringify(bids))}
function bidGetActiveId(){return localStorage.getItem(ACTIVE_BID_KEY)||""}
function bidSetActive(id){localStorage.setItem(ACTIVE_BID_KEY,id)}
function bidGetActive(){
  const id=bidGetActiveId();
  return bidLoadAll().find(b=>b.id===id)||null;
}
function bidCreate(input={}){
  const bid={
    id:crypto.randomUUID(),
    created:new Date().toISOString(),
    updated:new Date().toISOString(),
    projectName:input.projectName||"Untitled Bid",
    client:input.client||"",
    location:input.location||"",
    dueDate:input.dueDate||"",
    projectType:input.projectType||"Other",
    contact:input.contact||"",
    invitationSource:input.invitationSource||"",
    scope:input.scope||"",
    exclusions:input.exclusions||"",
    assumptions:input.assumptions||"",
    questions:input.questions||"",
    checklist:{
      invitationReviewed:false,
      scopeReviewed:false,
      siteVisitReviewed:false,
      drawingsReviewed:false,
      specificationsReviewed:false,
      addendaReviewed:false,
      laborPriced:false,
      materialsPriced:false,
      equipmentPriced:false,
      subcontractorsPriced:false,
      insuranceConfirmed:false,
      bondsConfirmed:false,
      referencesReady:false,
      proposalReviewed:false,
      submissionMethodConfirmed:false,
      submitted:false
    },
    pricing:{
      labor:0,materials:0,equipment:0,subcontractors:0,permits:0,other:0,
      overheadPercent:10,profitPercent:10,taxPercent:0
    },
    submission:{
      method:"",
      portal:"",
      email:"",
      instructions:"",
      submittedAt:"",
      confirmationNumber:""
    },
    notes:[]
  };
  const bids=bidLoadAll();
  bids.unshift(bid);
  bidSaveAll(bids);
  bidSetActive(bid.id);
  return bid;
}
function bidUpdate(id,changes){
  const bids=bidLoadAll();
  const index=bids.findIndex(b=>b.id===id);
  if(index<0)return null;
  bids[index]={...bids[index],...changes,updated:new Date().toISOString()};
  bidSaveAll(bids);
  return bids[index];
}
function bidUpdateSection(id,section,changes){
  const bid=bidLoadAll().find(b=>b.id===id);
  if(!bid)return null;
  return bidUpdate(id,{[section]:{...bid[section],...changes}});
}
function bidDelete(id){
  const bids=bidLoadAll().filter(b=>b.id!==id);
  bidSaveAll(bids);
  if(bidGetActiveId()===id)localStorage.removeItem(ACTIVE_BID_KEY);
}
window.ELARABid={loadAll:bidLoadAll,getActive:bidGetActive,setActive:bidSetActive,create:bidCreate,update:bidUpdate,updateSection:bidUpdateSection,delete:bidDelete};
