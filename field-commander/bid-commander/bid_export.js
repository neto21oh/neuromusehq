function bidDownload(name,text,type="text/plain"){
  const blob=new Blob([text],{type});
  const url=URL.createObjectURL(blob);
  const a=document.createElement("a");
  a.href=url;a.download=name;a.click();URL.revokeObjectURL(url);
}
function bidSummaryText(bid){
  const r=ELARABidScoring.readiness(bid),t=r.totals;
  return [
    "ELARA BID SUMMARY",
    "=================",
    `Project: ${bid.projectName}`,
    `Client: ${bid.client}`,
    `Location: ${bid.location}`,
    `Due Date: ${bid.dueDate}`,
    `Project Type: ${bid.projectType}`,
    "",
    "SCOPE",
    bid.scope||"Not entered",
    "",
    "EXCLUSIONS",
    bid.exclusions||"Not entered",
    "",
    "ASSUMPTIONS",
    bid.assumptions||"Not entered",
    "",
    "PRICING",
    `Direct Cost: $${t.direct.toFixed(2)}`,
    `Overhead: $${t.overhead.toFixed(2)}`,
    `Profit: $${t.profit.toFixed(2)}`,
    `Tax: $${t.tax.toFixed(2)}`,
    `PROPOSED PRICE: $${t.total.toFixed(2)}`,
    "",
    `Submission Readiness: ${r.score}%`,
    "",
    "WARNINGS",
    ...(r.warnings.length?r.warnings.map(w=>`- ${w}`):["- None"])
  ].join("\n");
}
function bidExportSummary(bid){
  bidDownload(`${bid.projectName.replace(/[^a-z0-9]+/gi,"_")}_Bid_Summary.txt`,bidSummaryText(bid));
}
function bidExportJSON(bid){
  bidDownload(`${bid.projectName.replace(/[^a-z0-9]+/gi,"_")}_Bid.json`,JSON.stringify(bid,null,2),"application/json");
}
window.ELARABidExport={summary:bidExportSummary,json:bidExportJSON};
