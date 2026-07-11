function bidPriceTotals(bid){
  const p=bid?.pricing||{};
  const direct=["labor","materials","equipment","subcontractors","permits","other"]
    .reduce((sum,key)=>sum+Number(p[key]||0),0);
  const overhead=direct*(Number(p.overheadPercent||0)/100);
  const subtotal=direct+overhead;
  const profit=subtotal*(Number(p.profitPercent||0)/100);
  const pretax=subtotal+profit;
  const tax=pretax*(Number(p.taxPercent||0)/100);
  return {direct,overhead,profit,tax,total:pretax+tax};
}
function bidReadiness(bid){
  if(!bid)return {score:0,warnings:["No active bid."]};
  const warnings=[];
  let points=0,total=0;
  const field=(value,label,weight=1)=>{
    total+=weight;
    if(String(value||"").trim())points+=weight;
    else warnings.push(`${label} is missing.`);
  };
  field(bid.projectName,"Project name",2);
  field(bid.client,"Client or company");
  field(bid.location,"Project location");
  field(bid.dueDate,"Bid due date",2);
  field(bid.scope,"Scope review",2);
  field(bid.exclusions,"Exclusions");
  field(bid.submission?.method,"Submission method",2);
  const checks=bid.checklist||{};
  Object.keys(checks).forEach(key=>{
    if(key==="submitted")return;
    total+=1;
    if(checks[key])points+=1;
  });
  const totals=bidPriceTotals(bid);
  total+=3;
  if(totals.direct>0)points+=2; else warnings.push("Pricing has not been entered.");
  if(totals.total>0)points+=1;
  const score=Math.round((points/total)*100);
  return {score,warnings,totals};
}
window.ELARABidScoring={readiness:bidReadiness,totals:bidPriceTotals};
