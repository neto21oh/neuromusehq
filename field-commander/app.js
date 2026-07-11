const STORAGE_KEY="elara_field_commander_v3_voice";
let voiceRecognition=null;
let pendingVoiceUpdate=null;
const uid=()=>crypto.randomUUID();
const starterData={project:{name:"Example Project — Kapolei Elementary School",isDemo:true,supervisor:"Ernest Guerrero",jobType:"Project Management / Field Supervision",status:"ACTIVE / FIELD READY",location:"Kapolei, Hawaii",client:"",startDate:"",targetDate:""},rooms:[{id:uid(),name:"Living Room",length:18,width:22,height:8,sqft:396,perimeter:80,baseboard:80,paint:640,status:"Complete"},{id:uid(),name:"Kitchen",length:12,width:15,height:8,sqft:180,perimeter:54,baseboard:54,paint:432,status:"Complete"}],damages:[{id:uid(),area:"Living Room",issue:"Hidden water damage under carpet",severity:"High",priority:"Urgent",estimatedCost:1200,recommendation:"Pull carpet, inspect subfloor, and replace damaged material.",photoName:""}],contractors:[{id:uid(),name:"ABC Painting",trade:"Painter",phone:"",email:"",status:"Late",progress:87,changeOrder:2400,notes:"Requested additional funds due to hidden conditions."}],changeOrders:[{id:uid(),contractor:"ABC Painting",amount:2400,reason:"Additional work caused by hidden water damage",status:"Pending Review",date:new Date().toISOString().slice(0,10)}],tasks:[{id:uid(),text:"Measure Classroom 4",complete:false},{id:uid(),text:"Photograph roof damage",complete:false},{id:uid(),text:"Meet flooring contractor",complete:false},{id:uid(),text:"Customer walkthrough",complete:false},{id:uid(),text:"Upload final report",complete:false}],dailyLogs:[],emails:[],reports:[],activities:[{time:"09:02",text:"Living Room measured"},{time:"09:14",text:"Hidden water damage documented"},{time:"09:26",text:"ABC Painting updated to 87%"}]};
let data=loadData();
function loadData(){try{const saved=localStorage.getItem(STORAGE_KEY);return saved?JSON.parse(saved):structuredClone(starterData)}catch(e){console.error(e);return structuredClone(starterData)}}
function saveData(msg=""){localStorage.setItem(STORAGE_KEY,JSON.stringify(data));if(msg)alert(msg)}
function esc(v=""){return String(v).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;")}
function money(v){return Number(v||0).toLocaleString("en-US",{style:"currency",currency:"USD"})}
function addActivity(text){data.activities.unshift({time:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),text});data.activities=data.activities.slice(0,30);saveData()}
function totals(){return data.rooms.reduce((t,r)=>{t.rooms++;t.sqft+=Number(r.sqft||0);t.baseboard+=Number(r.baseboard||0);t.paint+=Number(r.paint||0);return t},{rooms:0,sqft:0,baseboard:0,paint:0})}
function loadPage(page){const pages={dashboard:renderDashboard,projects:renderProject,daily:renderDaily,email:renderEmail,contractors:renderContractors,measurements:renderMeasurements,damage:renderDamage,changeorders:renderChangeOrders,reports:renderReports,backup:renderBackup,help:renderHelp};document.getElementById("content").innerHTML=(pages[page]||pages.dashboard)()}
function renderDashboard(){const t=totals(),open=data.tasks.filter(x=>!x.complete),co=data.changeOrders.filter(x=>x.status!=="Approved"),urgent=data.damages.filter(x=>x.priority==="Urgent");return `<div class="voice-hero card"><div><span class="eyebrow">VOICE-FIRST FIELD COMMAND</span><h2>Tell ELARA what happened.</h2><p class="muted">Press the microphone and speak naturally. ELARA will prepare the matching contractor, damage, change-order, task, and daily-log updates.</p></div><button class="mic-btn" id="voiceMicButton" onclick="toggleVoiceCapture()"><span class="mic-icon">🎙️</span><span id="voiceMicLabel">Start Talking</span></button><label for="voiceTranscript">What happened in the field?</label><textarea id="voiceTranscript" class="voice-input" placeholder="Example: ABC Painting is 87 percent complete. Water damage behind the east wall. Need approval for a 2400 dollar change order."></textarea><div class="example-strip"><b>Try an example:</b><button onclick="useVoiceExample(1)">Contractor + damage</button><button onclick="useVoiceExample(2)">Delay + task</button><button onclick="useVoiceExample(3)">Measurement</button><button onclick="useVoiceExample(4)">Change order</button><button onclick="useVoiceExample(5)">End-of-day update</button></div><div class="row-actions"><button class="action-btn success-btn" onclick="analyzeVoiceUpdate()">ELARA, Organize This</button><button class="action-btn" onclick="clearVoiceUpdate()">Clear</button></div><div id="voiceStatus" class="voice-status" aria-live="polite"></div><div id="voicePreview"></div></div><div class="dashboard-layout"><div><div class="card">${data.project.isDemo?`<div class="demo-banner"><b>Example Project</b><span>This is sample information for learning the app. It is not locked.</span><button class="action-btn success-btn" onclick="startRealProject()">Start Ernest’s Real Project</button></div>`:""}<h2>${esc(data.project.name)}</h2><p><b>Supervisor:</b> ${esc(data.project.supervisor)}</p><p><b>Location:</b> ${esc(data.project.location||"Not entered")}</p><p><b>Status:</b> ${esc(data.project.status)}</p></div><div class="grid"><div class="stat"><h3>Rooms</h3><p>${t.rooms}</p></div><div class="stat"><h3>Sq Ft</h3><p>${t.sqft}</p></div><div class="stat"><h3>Damage</h3><p>${data.damages.length}</p></div><div class="stat"><h3>Contractors</h3><p>${data.contractors.length}</p></div></div><div class="card"><h2>Quick Actions</h2><div class="big-actions"><button class="big-btn" onclick="loadPage('daily')">📝 Start Daily Report</button><button class="big-btn" onclick="loadPage('email')">✉️ Write Professional Email</button><button class="big-btn" onclick="loadPage('contractors')">👷 Contractor Update</button><button class="big-btn" onclick="loadPage('damage')">📸 Damage / Photo</button><button class="big-btn" onclick="loadPage('changeorders')">💵 Change Order</button><button class="big-btn" onclick="loadPage('reports')">📊 Create Report</button></div></div>${urgent.length||co.length?`<div class="card alert"><h2>Field Alerts</h2>${urgent.map(x=>`<p>⚠ Urgent damage: ${esc(x.area)} — ${esc(x.issue)}</p>`).join("")}${co.map(x=>`<p>⚠ Change order pending: ${esc(x.contractor)} — ${money(x.amount)}</p>`).join("")}</div>`:""}<div class="panel"><h2>Recent Activity</h2>${data.activities.slice(0,8).map(x=>`<div class="activity-item"><span class="activity-time">${esc(x.time)}</span>${esc(x.text)}</div>`).join("")||`<p class="muted">No activity yet.</p>`}</div></div><div><div class="panel"><h2>Today's Tasks</h2>${open.map(x=>`<div class="task"><input type="checkbox" onchange="toggleTask('${x.id}')" style="width:auto;margin:0 10px 0 0;">${esc(x.text)}</div>`).join("")||`<p class="muted">All tasks complete.</p>`}<button class="action-btn" onclick="addTask()">+ Add Task</button></div><div class="panel"><h2>ELARA Recommendations</h2>${co.length?`<div class="recommendation">Review pending change orders before approving payment.</div>`:""}${urgent.length?`<div class="recommendation">Document urgent damage with photos and written notes.</div>`:""}<div class="recommendation">Create a daily report before leaving the job site.</div></div></div></div>`}
function renderProject(){const p=data.project;return `<div class="card"><h2>Project Details</h2><div class="form-grid"><div><label>Project Name</label><input id="projectName" value="${esc(p.name)}"></div><div><label>Supervisor</label><input id="projectSupervisor" value="${esc(p.supervisor)}"></div><div><label>Client</label><input id="projectClient" value="${esc(p.client)}"></div><div><label>Location</label><input id="projectLocation" value="${esc(p.location)}"></div><div><label>Job Type</label><input id="projectJobType" value="${esc(p.jobType)}"></div><div><label>Status</label><input id="projectStatus" value="${esc(p.status)}"></div><div><label>Start Date</label><input id="projectStart" type="date" value="${esc(p.startDate)}"></div><div><label>Target Date</label><input id="projectTarget" type="date" value="${esc(p.targetDate)}"></div></div><div class="row-actions"><button class="action-btn success-btn" onclick="saveProject()">Save Project</button><button class="action-btn" onclick="newProject()">Create New Project</button></div></div>`}
function saveProject(){data.project={isDemo:false,name:projectName.value.trim()||"Unnamed Project",supervisor:projectSupervisor.value.trim()||"Ernest Guerrero",client:projectClient.value.trim(),location:projectLocation.value.trim(),jobType:projectJobType.value.trim(),status:projectStatus.value.trim(),startDate:projectStart.value,targetDate:projectTarget.value};addActivity(`Project updated: ${data.project.name}`);saveData("Project saved.");loadPage("dashboard")}
function newProject(){const name=prompt("Enter the new project name:");if(!name||!name.trim())return;data={project:{name:name.trim(),isDemo:false,supervisor:"Ernest Guerrero",jobType:"Project Management / Field Supervision",status:"ACTIVE / FIELD READY",location:"",client:"",startDate:"",targetDate:""},rooms:[],damages:[],contractors:[],changeOrders:[],tasks:[],dailyLogs:[],emails:[],reports:[],activities:[]};addActivity(`New project created: ${name.trim()}`);saveData("New project created.");loadPage("projects")}
function renderDaily(){return `<div class="card"><h2>Daily Report Assistant</h2><p class="muted">Answer the simple questions. ELARA creates the report.</p><div class="form-grid"><div><label>Date</label><input id="dailyDate" type="date" value="${new Date().toISOString().slice(0,10)}"></div><div><label>Weather</label><input id="dailyWeather"></div><div><label>Workers on Site</label><input id="dailyWorkers" type="number" min="0" value="0"></div><div><label>Hours Worked</label><input id="dailyHours" type="number" min="0" step="0.5" value="8"></div></div><label>What work was completed today?</label><textarea id="dailyWork"></textarea><label>Any delays or problems?</label><textarea id="dailyProblems"></textarea><label>Materials delivered or needed?</label><textarea id="dailyMaterials"></textarea><label>Safety issues?</label><textarea id="dailySafety"></textarea><label>Plan for tomorrow</label><textarea id="dailyTomorrow"></textarea><button class="action-btn success-btn" onclick="generateDaily()">Generate Report</button><div id="dailyPreview"></div></div>`}
function generateDaily(){const e={id:uid(),date:dailyDate.value,weather:dailyWeather.value.trim(),workers:Number(dailyWorkers.value||0),hours:Number(dailyHours.value||0),work:dailyWork.value.trim(),problems:dailyProblems.value.trim(),materials:dailyMaterials.value.trim(),safety:dailySafety.value.trim(),tomorrow:dailyTomorrow.value.trim()};e.report=`DAILY FIELD REPORT\n\nProject: ${data.project.name}\nSupervisor: ${data.project.supervisor}\nDate: ${e.date}\nWeather: ${e.weather||"Not reported"}\nWorkers on Site: ${e.workers}\nHours Worked: ${e.hours}\n\nWORK COMPLETED\n${e.work||"No work details entered."}\n\nDELAYS / PROBLEMS\n${e.problems||"No delays or problems reported."}\n\nMATERIALS\n${e.materials||"No material activity reported."}\n\nSAFETY\n${e.safety||"No safety issues reported."}\n\nPLAN FOR TOMORROW\n${e.tomorrow||"No plan entered."}\n\nGenerated by ELARA Field Commander.`;data.dailyLogs.push(e);addActivity(`Daily report created for ${e.date}`);saveData();dailyPreview.innerHTML=`<div class="card"><h3>Report Preview</h3><div class="preview">${esc(e.report)}</div><div class="row-actions" style="margin-top:14px"><button class="action-btn" onclick='downloadText("daily-report-${e.date}.txt",${JSON.stringify(e.report)})'>Download Report</button><button class="action-btn" onclick='openMail("","Daily Field Report - ${esc(data.project.name)} - ${e.date}",${JSON.stringify(e.report)})'>Email Report</button></div></div>`}
function renderEmail(){return `<div class="card"><h2>Email Assistant</h2><p class="muted">Enter plain words. ELARA creates a professional email.</p><label>Send To</label><input id="emailTo" type="email"><label>Who are you writing to?</label><input id="emailPerson" placeholder="Project superintendent, client, painter"><label>What happened?</label><textarea id="emailSituation"></textarea><label>What do you need from them?</label><textarea id="emailRequest"></textarea><label>Tone</label><select id="emailTone"><option value="professional">Professional</option><option value="firm">Firm but respectful</option><option value="friendly">Friendly</option><option value="urgent">Urgent</option></select><button class="action-btn success-btn" onclick="generateEmail()">Create Email</button><div id="emailPreview"></div></div>`}
function generateEmail(){const to=emailTo.value.trim(),person=emailPerson.value.trim()||"there",s=emailSituation.value.trim(),r=emailRequest.value.trim(),tone=emailTone.value;if(!s||!r){alert("Please enter what happened and what you need.");return}const opening=tone==="friendly"?`Hi ${person},`:`Hello ${person},`;const urgency=tone==="urgent"?"\nThis matter is time-sensitive, and your prompt response would be appreciated.\n":"";const body=`${opening}\n\nI am writing regarding ${data.project.name}.\n\n${s}\n\n${r}${urgency}\nPlease let me know if you need any additional information.\n\nThank you,\n\nErnest Guerrero\nProject Manager`;const subject=`${data.project.name} - Project Update / Action Needed`;data.emails.push({id:uid(),to,subject,body,createdAt:new Date().toISOString()});addActivity(`Email drafted: ${subject}`);saveData();emailPreview.innerHTML=`<div class="card"><h3>Email Preview</h3><p><b>To:</b> ${esc(to||"Not entered")}</p><p><b>Subject:</b> ${esc(subject)}</p><div class="preview">${esc(body)}</div><div class="row-actions" style="margin-top:14px"><button class="action-btn success-btn" onclick='openMail(${JSON.stringify(to)},${JSON.stringify(subject)},${JSON.stringify(body)})'>Open in Email</button><button class="action-btn" onclick='copyText(${JSON.stringify(body)})'>Copy Email</button></div></div>`}
function openMail(to,subject,body){window.location.href=`mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`}
async function copyText(text){try{await navigator.clipboard.writeText(text);alert("Copied.")}catch{alert("Copy failed. Select the text manually.")}}
function renderContractors(){return `<div class="card"><h2>Add Contractor / Update</h2><div class="form-grid"><div><label>Name</label><input id="contractorName"></div><div><label>Trade</label><input id="contractorTrade"></div><div><label>Phone</label><input id="contractorPhone"></div><div><label>Email</label><input id="contractorEmail" type="email"></div><div><label>Status</label><select id="contractorStatus"><option>On Schedule</option><option>Late</option><option>Waiting</option><option>Complete</option></select></div><div><label>Progress %</label><input id="contractorProgress" type="number" min="0" max="100" value="0"></div><div><label>Open Change Order $</label><input id="contractorChangeOrder" type="number" min="0" value="0"></div></div><label>Notes</label><textarea id="contractorNotes"></textarea><button class="action-btn success-btn" onclick="addContractor()">Save Contractor</button></div><div class="card"><h2>Contractor Status</h2><div class="table-wrap"><table><thead><tr><th>Contractor</th><th>Trade</th><th>Status</th><th>Progress</th><th>Change Order</th><th>Action</th></tr></thead><tbody>${data.contractors.map(x=>`<tr><td>${esc(x.name)}</td><td>${esc(x.trade)}</td><td><span class="badge">${esc(x.status)}</span></td><td>${Number(x.progress||0)}%</td><td>${money(x.changeOrder)}</td><td><button class="small-btn" onclick="deleteItem('contractors','${x.id}','contractors')">Delete</button></td></tr>`).join("")||`<tr><td colspan="6">No contractors yet.</td></tr>`}</tbody></table></div></div>`}
function addContractor(){const name=contractorName.value.trim();if(!name){alert("Enter the contractor name.");return}const c={id:uid(),name,trade:contractorTrade.value.trim(),phone:contractorPhone.value.trim(),email:contractorEmail.value.trim(),status:contractorStatus.value,progress:Number(contractorProgress.value||0),changeOrder:Number(contractorChangeOrder.value||0),notes:contractorNotes.value.trim()};data.contractors.push(c);addActivity(`Contractor added: ${c.name}`);saveData("Contractor saved.");loadPage("contractors")}
function renderMeasurements(){const t=totals();return `<div class="card"><h2>Measure New Room</h2><div class="form-grid"><div><label>Room Name</label><input id="roomName"></div><div><label>Length (ft)</label><input id="roomLength" type="number" min="0" step="0.1"></div><div><label>Width (ft)</label><input id="roomWidth" type="number" min="0" step="0.1"></div><div><label>Wall Height (ft)</label><input id="roomHeight" type="number" min="0" step="0.1" value="8"></div></div><button class="action-btn success-btn" onclick="calculateRoom()">Calculate and Save</button></div><div class="grid"><div class="stat"><h3>Total Rooms</h3><p>${t.rooms}</p></div><div class="stat"><h3>Total Sq Ft</h3><p>${t.sqft}</p></div><div class="stat"><h3>Baseboard Ft</h3><p>${t.baseboard}</p></div><div class="stat"><h3>Paint Area</h3><p>${t.paint}</p></div></div><div class="card"><h2>Room Measurements</h2><div class="table-wrap"><table><thead><tr><th>Room</th><th>L</th><th>W</th><th>Sq Ft</th><th>Paint</th><th>Action</th></tr></thead><tbody>${data.rooms.map(r=>`<tr><td>${esc(r.name)}</td><td>${r.length}</td><td>${r.width}</td><td>${r.sqft}</td><td>${r.paint}</td><td><button class="small-btn" onclick="deleteItem('rooms','${r.id}','measurements')">Delete</button></td></tr>`).join("")||`<tr><td colspan="6">No measurements yet.</td></tr>`}</tbody></table></div></div>`}
function calculateRoom(){const name=roomName.value.trim()||"Unnamed Room",l=Number(roomLength.value),w=Number(roomWidth.value),h=Number(roomHeight.value);if(!l||!w||!h){alert("Enter length, width, and height.");return}const p=(l+w)*2;data.rooms.push({id:uid(),name,length:l,width:w,height:h,sqft:Number((l*w).toFixed(2)),perimeter:Number(p.toFixed(2)),baseboard:Number(p.toFixed(2)),paint:Number((p*h).toFixed(2)),status:"Complete"});addActivity(`${name} measured`);saveData("Room saved.");loadPage("measurements")}
function renderDamage(){return `<div class="card"><h2>Add Damage Report</h2><div class="form-grid"><div><label>Area / Room</label><input id="damageArea"></div><div><label>Issue</label><input id="damageIssue"></div><div><label>Severity</label><select id="damageSeverity"><option>Low</option><option>Medium</option><option>High</option></select></div><div><label>Priority</label><select id="damagePriority"><option>Normal</option><option>High</option><option>Urgent</option></select></div><div><label>Estimated Cost</label><input id="damageCost" type="number" min="0" value="0"></div><div><label>Photo</label><input id="damagePhoto" type="file" accept="image/*"></div></div><label>Recommendation</label><textarea id="damageRecommendation"></textarea><button class="action-btn success-btn" onclick="addDamage()">Save Damage Report</button></div><div class="card"><h2>Damage Records</h2>${data.damages.map(x=>`<div class="panel ${x.priority==="Urgent"?"alert":""}"><h3>${esc(x.area)}</h3><p><b>Damage:</b> ${esc(x.issue)}</p><p><b>Severity:</b> ${esc(x.severity)} | <b>Priority:</b> ${esc(x.priority)}</p><p><b>Estimated Cost:</b> ${money(x.estimatedCost)}</p><p><b>Recommendation:</b> ${esc(x.recommendation)}</p><p><b>Photo:</b> ${esc(x.photoName||"None attached")}</p><button class="small-btn" onclick="deleteItem('damages','${x.id}','damage')">Delete</button></div>`).join("")||`<p class="muted">No damage reports yet.</p>`}</div>`}
function addDamage(){const area=damageArea.value.trim(),issue=damageIssue.value.trim();if(!area||!issue){alert("Enter the area and issue.");return}const photo=damagePhoto.files[0];data.damages.push({id:uid(),area,issue,severity:damageSeverity.value,priority:damagePriority.value,estimatedCost:Number(damageCost.value||0),recommendation:damageRecommendation.value.trim(),photoName:photo?photo.name:""});addActivity(`Damage documented: ${area}`);saveData("Damage report saved.");loadPage("damage")}
function renderChangeOrders(){return `<div class="card"><h2>Add Change Order</h2><div class="form-grid"><div><label>Contractor</label><input id="coContractor"></div><div><label>Amount</label><input id="coAmount" type="number" min="0"></div><div><label>Date</label><input id="coDate" type="date" value="${new Date().toISOString().slice(0,10)}"></div><div><label>Status</label><select id="coStatus"><option>Pending Review</option><option>Submitted</option><option>Approved</option><option>Rejected</option></select></div></div><label>Reason / Scope Change</label><textarea id="coReason"></textarea><button class="action-btn success-btn" onclick="addChangeOrder()">Save Change Order</button></div><div class="card"><h2>Change Orders</h2><div class="table-wrap"><table><thead><tr><th>Date</th><th>Contractor</th><th>Amount</th><th>Status</th><th>Reason</th><th>Action</th></tr></thead><tbody>${data.changeOrders.map(x=>`<tr><td>${esc(x.date)}</td><td>${esc(x.contractor)}</td><td>${money(x.amount)}</td><td>${esc(x.status)}</td><td>${esc(x.reason)}</td><td><button class="small-btn" onclick="deleteItem('changeOrders','${x.id}','changeorders')">Delete</button></td></tr>`).join("")||`<tr><td colspan="6">No change orders yet.</td></tr>`}</tbody></table></div></div>`}
function addChangeOrder(){const contractor=coContractor.value.trim(),reason=coReason.value.trim();if(!contractor||!reason){alert("Enter the contractor and reason.");return}const x={id:uid(),contractor,amount:Number(coAmount.value||0),date:coDate.value,status:coStatus.value,reason};data.changeOrders.push(x);addActivity(`Change order added: ${contractor} ${money(x.amount)}`);saveData("Change order saved.");loadPage("changeorders")}
function renderReports(){return `<div class="card"><h2>Excel / Reports</h2><p class="muted">CSV files open directly in Microsoft Excel.</p><div class="big-actions"><button class="big-btn" onclick="exportProjectSummary()">📊 Project Summary</button><button class="big-btn" onclick="exportContractors()">👷 Contractor Report</button><button class="big-btn" onclick="exportMeasurements()">📐 Measurement Report</button><button class="big-btn" onclick="exportDamage()">📸 Damage Report</button><button class="big-btn" onclick="exportChangeOrders()">💵 Change Order Report</button><button class="big-btn" onclick="downloadFullReport()">📄 Full Project Report</button></div></div>`}
function csvEscape(v){return `"${String(v??"").replaceAll('"','""')}"`}
function downloadCsv(name,rows){downloadBlob(name,rows.map(r=>r.map(csvEscape).join(",")).join("\n"),"text/csv;charset=utf-8")}
function exportProjectSummary(){const t=totals();downloadCsv("project-summary.csv",[["Field","Value"],["Project",data.project.name],["Supervisor",data.project.supervisor],["Client",data.project.client],["Location",data.project.location],["Status",data.project.status],["Rooms",t.rooms],["Total Sq Ft",t.sqft],["Damage Reports",data.damages.length],["Contractors",data.contractors.length],["Change Orders",data.changeOrders.length]])}
function exportContractors(){downloadCsv("contractors.csv",[["Name","Trade","Phone","Email","Status","Progress","Change Order","Notes"],...data.contractors.map(x=>[x.name,x.trade,x.phone,x.email,x.status,x.progress,x.changeOrder,x.notes])])}
function exportMeasurements(){downloadCsv("measurements.csv",[["Room","Length","Width","Height","Sq Ft","Perimeter","Baseboard","Paint Area"],...data.rooms.map(x=>[x.name,x.length,x.width,x.height,x.sqft,x.perimeter,x.baseboard,x.paint])])}
function exportDamage(){downloadCsv("damage-report.csv",[["Area","Issue","Severity","Priority","Estimated Cost","Recommendation","Photo"],...data.damages.map(x=>[x.area,x.issue,x.severity,x.priority,x.estimatedCost,x.recommendation,x.photoName])])}
function exportChangeOrders(){downloadCsv("change-orders.csv",[["Date","Contractor","Amount","Status","Reason"],...data.changeOrders.map(x=>[x.date,x.contractor,x.amount,x.status,x.reason])])}
function downloadFullReport(){const t=totals();const report=`ELARA PROJECT MANAGER REPORT\n\nPROJECT\nName: ${data.project.name}\nSupervisor: ${data.project.supervisor}\nClient: ${data.project.client}\nLocation: ${data.project.location}\nStatus: ${data.project.status}\n\nSUMMARY\nRooms Measured: ${t.rooms}\nTotal Square Feet: ${t.sqft}\nDamage Reports: ${data.damages.length}\nContractors: ${data.contractors.length}\nChange Orders: ${data.changeOrders.length}\n\nOPEN TASKS\n${data.tasks.filter(x=>!x.complete).map(x=>"- "+x.text).join("\n")||"None"}\n\nCONTRACTORS\n${data.contractors.map(x=>`- ${x.name} | ${x.trade} | ${x.status} | ${x.progress}%`).join("\n")||"None"}\n\nCHANGE ORDERS\n${data.changeOrders.map(x=>`- ${x.date} | ${x.contractor} | ${money(x.amount)} | ${x.status}`).join("\n")||"None"}\n\nDAMAGE\n${data.damages.map(x=>`- ${x.area}: ${x.issue} | ${x.priority} | ${money(x.estimatedCost)}`).join("\n")||"None"}\n\nGenerated by ELARA Field Commander.`;downloadText("full-project-report.txt",report)}
function renderBackup(){return `<div class="card"><h2>Save / Backup</h2><p>The app saves automatically on this device.</p><div class="big-actions"><button class="big-btn" onclick="exportBackup()">💾 Download Backup</button><button class="big-btn" onclick="backupFile.click()">📂 Restore Backup</button><button class="big-btn danger-btn" onclick="resetAllData()">🗑 Reset Everything</button></div><input id="backupFile" type="file" accept=".json" style="display:none" onchange="importBackup(event)"></div>`}
function exportBackup(){downloadBlob(`elara-backup-${new Date().toISOString().slice(0,10)}.json`,JSON.stringify(data,null,2),"application/json")}
function importBackup(event){const file=event.target.files[0];if(!file)return;const reader=new FileReader();reader.onload=()=>{try{data=JSON.parse(reader.result);saveData("Backup restored.");loadPage("dashboard")}catch{alert("That backup file is not valid.")}};reader.readAsText(file)}
function resetAllData(){if(!confirm("Delete all saved project data on this device?"))return;data=structuredClone(starterData);saveData("Data reset.");loadPage("dashboard")}
function addTask(){const text=prompt("Enter the task:");if(!text||!text.trim())return;data.tasks.push({id:uid(),text:text.trim(),complete:false});addActivity(`Task added: ${text.trim()}`);saveData();loadPage("dashboard")}
function toggleTask(id){const t=data.tasks.find(x=>x.id===id);if(!t)return;t.complete=!t.complete;addActivity(`Task ${t.complete?"completed":"reopened"}: ${t.text}`);saveData();loadPage("dashboard")}
function deleteItem(collection,id,page){if(!confirm("Delete this item?"))return;data[collection]=data[collection].filter(x=>x.id!==id);saveData();loadPage(page)}
function downloadText(name,text){downloadBlob(name,text,"text/plain;charset=utf-8")}
function downloadBlob(name,content,type){const blob=new Blob([content],{type}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url)}

function startRealProject(){if(!confirm("This will replace the example information with a clean project workspace. Continue?"))return;data={project:{name:"Ernest's New Project",isDemo:false,supervisor:"Ernest Guerrero",jobType:"Project Management / Field Supervision",status:"ACTIVE / FIELD READY",location:"",client:"",startDate:"",targetDate:""},rooms:[],damages:[],contractors:[],changeOrders:[],tasks:[],dailyLogs:[],emails:[],reports:[],activities:[{time:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),text:"Real project workspace created"}]};saveData();loadPage("projects")}
function useVoiceExample(number){const examples={1:"ABC Painting is 87 percent complete. We found water damage behind the east wall. Need approval for a 2400 dollar change order.",2:"The flooring contractor is behind schedule. Call him tomorrow morning and inspect the hallway before noon.",3:"Classroom 4 is 24 feet long, 18 feet wide, and 9 feet high. The room is ready for paint measurements.",4:"Island Electric needs a 1750 dollar change order for additional wiring discovered above the ceiling.",5:"Today the painters completed the west wing. Twelve workers were on site. No safety problems. Tomorrow we inspect the flooring and meet the client at 9 AM."};const input=document.getElementById("voiceTranscript");if(input){input.value=examples[number]||"";setVoiceStatus("Example loaded. Press ‘ELARA, Organize This’ to see what happens.","success")}}
function renderHelp(){return `<div class="card help-page"><span class="eyebrow">FIELD COMMANDER GUIDE</span><h2>How Ernest Uses ELARA</h2><div class="how-grid"><div class="how-step"><b>1</b><h3>Open Today</h3><p>Use the Today screen for the fastest field update.</p></div><div class="how-step"><b>2</b><h3>Press Start Talking</h3><p>Allow microphone access, then speak normally. Include names, percentages, locations, problems, and dollar amounts.</p></div><div class="how-step"><b>3</b><h3>Organize the Update</h3><p>Press “ELARA, Organize This.” ELARA prepares the matching records.</p></div><div class="how-step"><b>4</b><h3>Review and Save</h3><p>Check what ELARA understood, then press “Save Everything.”</p></div></div><div class="card inset"><h3>Good things to say</h3><div class="spoken-examples"><button onclick="loadPage('dashboard');setTimeout(()=>useVoiceExample(1),0)">“ABC Painting is 87 percent complete…”</button><button onclick="loadPage('dashboard');setTimeout(()=>useVoiceExample(2),0)">“The flooring contractor is behind schedule…”</button><button onclick="loadPage('dashboard');setTimeout(()=>useVoiceExample(3),0)">“Classroom 4 is 24 feet long…”</button><button onclick="loadPage('dashboard');setTimeout(()=>useVoiceExample(4),0)">“Island Electric needs a $1,750 change order…”</button><button onclick="loadPage('dashboard');setTimeout(()=>useVoiceExample(5),0)">“Today the painters completed the west wing…”</button></div></div><div class="card inset"><h3>Tips for the best results</h3><p>Speak in short, complete thoughts. Say the contractor or trade name. Say the percentage complete. Describe exactly where damage was found. Say the change-order amount. Say “need to,” “call,” “inspect,” or “schedule” when creating a task.</p><p><b>You can always type instead of talking.</b></p></div><div class="card inset"><h3>About the Kapolei project</h3><p>“Example Project — Kapolei Elementary School” is sample data included so Ernest can explore every screen. It is not connected to Kapiolani and it is not permanent. Press <b>Start Ernest’s Real Project</b> on the Today screen to clear the example and begin a real job.</p></div></div>`}

function setVoiceStatus(message,type="info"){const el=document.getElementById("voiceStatus");if(!el)return;el.className=`voice-status ${type}`;el.textContent=message}
function toggleVoiceCapture(){const SpeechRecognition=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SpeechRecognition){setVoiceStatus("Voice recognition is not available in this browser. Type the update in the box instead.","warning");return}if(voiceRecognition){voiceRecognition.stop();return}voiceRecognition=new SpeechRecognition();voiceRecognition.lang="en-US";voiceRecognition.interimResults=true;voiceRecognition.continuous=false;const input=document.getElementById("voiceTranscript"),button=document.getElementById("voiceMicButton"),label=document.getElementById("voiceMicLabel");let finalText=input.value.trim();voiceRecognition.onstart=()=>{button.classList.add("listening");label.textContent="Listening… Tap to Stop";setVoiceStatus("Listening. Speak normally and include names, percentages, locations, and dollar amounts.","listening")};voiceRecognition.onresult=(event)=>{let interim="";for(let i=event.resultIndex;i<event.results.length;i++){const text=event.results[i][0].transcript;if(event.results[i].isFinal)finalText+=(finalText?" ":"")+text;else interim+=text}input.value=(finalText+(interim?" "+interim:"")).trim()};voiceRecognition.onerror=(event)=>{setVoiceStatus(event.error==="not-allowed"?"Microphone permission was blocked. Allow microphone access or type the update.":`Voice recognition stopped: ${event.error}. You can try again or type the update.`,"warning")};voiceRecognition.onend=()=>{button.classList.remove("listening");label.textContent="Start Talking";voiceRecognition=null;if(input.value.trim())setVoiceStatus("I heard the update. Press “ELARA, Organize This” to review it.","success")};voiceRecognition.start()}
function normalizeSpokenNumbers(text){return text.replace(/\b(one|two|three|four|five|six|seven|eight|nine|ten)\b/gi,m=>({one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,nine:9,ten:10}[m.toLowerCase()]))}
function findContractorFromText(text){const lower=text.toLowerCase();const exact=data.contractors.find(c=>lower.includes(c.name.toLowerCase()));if(exact)return exact;const trade=data.contractors.find(c=>lower.includes(String(c.trade||"").toLowerCase()));return trade||null}
function parseVoiceUpdate(raw){const text=normalizeSpokenNumbers(raw.trim()),lower=text.toLowerCase(),result={original:text,contractorUpdate:null,damage:null,changeOrder:null,task:null,dailyNote:text};const contractor=findContractorFromText(text);const pct=text.match(/(?:is|at|about|approximately)?\s*(\d{1,3})\s*(?:%|percent)\s*(?:complete|completed|done)?/i);if(pct||contractor){result.contractorUpdate={id:contractor?.id||null,name:contractor?.name||extractLikelyName(text)||"Contractor",trade:contractor?.trade||"",progress:pct?Math.min(100,Number(pct[1])):Number(contractor?.progress||0),status:/late|behind|delay/i.test(text)?"Late":/complete|finished|done/i.test(text)&&pct&&Number(pct[1])>=100?"Complete":contractor?.status||"Active",notes:text}}
const damageMatch=text.match(/((?:water|roof|wall|floor|ceiling|electrical|plumbing|structural|mold|moisture|crack|leak|damage)[^.]*?(?:damage|leak|crack|issue|problem)?[^.]*)/i);if(damageMatch||/damage|leak|mold|crack|broken|moisture/i.test(text)){const areaMatch=text.match(/(?:behind|at|in|near|under|above|inside)\s+(?:the\s+)?([^.,;]+)/i);result.damage={area:areaMatch?titleCase(areaMatch[1].replace(/\b(wall|floor|ceiling|room|door|window).*$/i,m=>m)):"Field Area",issue:(damageMatch?damageMatch[1]:text).trim(),severity:/severe|major|unsafe|structural|active leak/i.test(text)?"High":"Medium",priority:/urgent|immediately|unsafe|active leak|water damage/i.test(text)?"Urgent":"Normal",estimatedCost:0,recommendation:"Photograph the condition, verify the affected area, and obtain approval before corrective work."}}
const amountMatch=text.match(/(?:\$|dollars?\s*)?([\d,]+(?:\.\d{1,2})?)\s*(?:dollars?|dollar)?\s*(?:change order|extra|additional|more)/i)||text.match(/(?:change order|approval)[^\d$]*(?:\$)?([\d,]+(?:\.\d{1,2})?)/i);if(/change order|extra work|additional work|need approval/i.test(text)){result.changeOrder={contractor:contractor?.name||result.contractorUpdate?.name||"Contractor",amount:amountMatch?Number(amountMatch[1].replaceAll(",","")):0,reason:text,status:"Pending Review",date:new Date().toISOString().slice(0,10)}}
const taskMatch=text.match(/(?:need to|remember to|task|follow up|schedule|call|inspect)\s+([^.;]+)/i);if(taskMatch)result.task=taskMatch[0].trim();return result}
function extractLikelyName(text){const before=text.match(/^([A-Z][A-Za-z0-9&' -]{2,40}?)\s+(?:is|are|was|were|has|have)\b/);return before?before[1].trim():""}
function titleCase(value){return String(value).replace(/\w\S*/g,w=>w.charAt(0).toUpperCase()+w.slice(1).toLowerCase())}
function analyzeVoiceUpdate(){const input=document.getElementById("voiceTranscript"),preview=document.getElementById("voicePreview");if(!input||!input.value.trim()){setVoiceStatus("Tell me what happened first—by voice or by typing.","warning");return}pendingVoiceUpdate=parseVoiceUpdate(input.value);const p=pendingVoiceUpdate,items=[];if(p.contractorUpdate)items.push(`<div class="voice-card"><span class="voice-card-icon">👷</span><div><b>Contractor Update</b><p>${esc(p.contractorUpdate.name)} — ${p.contractorUpdate.progress}% complete — ${esc(p.contractorUpdate.status)}</p></div></div>`);if(p.damage)items.push(`<div class="voice-card"><span class="voice-card-icon">📸</span><div><b>Damage Record</b><p>${esc(p.damage.area)} — ${esc(p.damage.issue)}</p></div></div>`);if(p.changeOrder)items.push(`<div class="voice-card"><span class="voice-card-icon">💵</span><div><b>Change Order</b><p>${esc(p.changeOrder.contractor)} — ${money(p.changeOrder.amount)} — Pending Review</p></div></div>`);if(p.task)items.push(`<div class="voice-card"><span class="voice-card-icon">✅</span><div><b>Task</b><p>${esc(p.task)}</p></div></div>`);items.push(`<div class="voice-card"><span class="voice-card-icon">📝</span><div><b>Daily Field Note</b><p>${esc(p.dailyNote)}</p></div></div>`);preview.innerHTML=`<div class="voice-preview"><h3>ELARA understood:</h3>${items.join("")}<div class="row-actions"><button class="action-btn success-btn" onclick="saveVoiceUpdate()">Save Everything</button><button class="action-btn" onclick="clearVoiceUpdate()">Start Over</button></div></div>`;setVoiceStatus("Review the prepared records, then press “Save Everything.”","success")}
function saveVoiceUpdate(){const p=pendingVoiceUpdate;if(!p)return;if(p.contractorUpdate){let c=p.contractorUpdate.id?data.contractors.find(x=>x.id===p.contractorUpdate.id):null;if(c){c.progress=p.contractorUpdate.progress;c.status=p.contractorUpdate.status;c.notes=[c.notes,p.contractorUpdate.notes].filter(Boolean).join("\n") }else{c={id:uid(),name:p.contractorUpdate.name,trade:p.contractorUpdate.trade,phone:"",email:"",status:p.contractorUpdate.status,progress:p.contractorUpdate.progress,changeOrder:p.changeOrder?.amount||0,notes:p.contractorUpdate.notes};data.contractors.push(c)}}if(p.damage)data.damages.push({id:uid(),...p.damage,photoName:""});if(p.changeOrder)data.changeOrders.push({id:uid(),...p.changeOrder});if(p.task)data.tasks.push({id:uid(),text:p.task,complete:false});data.dailyLogs.push({id:uid(),date:new Date().toISOString().slice(0,10),voiceEntry:true,report:`VOICE FIELD UPDATE\n\nProject: ${data.project.name}\nSupervisor: ${data.project.supervisor}\nDate: ${new Date().toLocaleDateString()}\n\nFIELD UPDATE\n${p.dailyNote}`});addActivity("Voice field update processed by ELARA");saveData();pendingVoiceUpdate=null;loadPage("dashboard");setTimeout(()=>setVoiceStatus("Saved. ELARA updated the matching project records.","success"),0)}
function clearVoiceUpdate(){pendingVoiceUpdate=null;const input=document.getElementById("voiceTranscript"),preview=document.getElementById("voicePreview");if(input)input.value="";if(preview)preview.innerHTML="";setVoiceStatus("Ready when you are.","info")}

loadPage("dashboard");


/* ================================
   ELARA FIELD COMMANDER V3 — VOICE
   ================================ */
let elaraSpeaking=false;
function speakElara(message){
  if(!('speechSynthesis' in window)){ setVoiceStatus(message,'info'); return; }
  window.speechSynthesis.cancel();
  const utterance=new SpeechSynthesisUtterance(message);
  utterance.rate=.92; utterance.pitch=1.02; utterance.lang='en-US';
  utterance.onstart=()=>{elaraSpeaking=true};
  utterance.onend=()=>{elaraSpeaking=false};
  window.speechSynthesis.speak(utterance);
}
function voiceSummaryText(p){
  const parts=[];
  if(p.contractorUpdate)parts.push(`${p.contractorUpdate.name} is recorded at ${p.contractorUpdate.progress} percent complete with status ${p.contractorUpdate.status}.`);
  if(p.damage)parts.push(`Damage noted at ${p.damage.area}: ${p.damage.issue}. Priority ${p.damage.priority}.`);
  if(p.changeOrder)parts.push(`A change order for ${money(p.changeOrder.amount)} is pending review for ${p.changeOrder.contractor}.`);
  if(p.task)parts.push(`Task created: ${p.task}.`);
  parts.push('I also prepared a daily field note.');
  return parts.join(' ');
}
function readVoicePreview(){
  if(!pendingVoiceUpdate){setVoiceStatus('Organize the field update first.','warning');return}
  speakElara(`Ernest, here is what I understood. ${voiceSummaryText(pendingVoiceUpdate)} Review it before saving.`);
  setVoiceStatus('ELARA is reading the summary aloud.','listening');
}
function startGuidedVoice(){
  clearVoiceUpdate();
  speakElara('Go ahead, Ernest. Tell me who did the work, what changed, where it happened, and whether approval or follow up is needed.');
  setTimeout(toggleVoiceCapture,900);
}
function addPromptToVoice(prompt){
  const input=document.getElementById('voiceTranscript');
  if(!input)return;
  const prefix=input.value.trim();
  input.value=(prefix+(prefix?' ':'')+prompt).trim();
  input.focus();
  setVoiceStatus('Added a reminder phrase. Finish the sentence, then organize the update.','info');
}
function renderDashboard(){
 const t=totals(),open=data.tasks.filter(x=>!x.complete),co=data.changeOrders.filter(x=>x.status!=="Approved"),urgent=data.damages.filter(x=>x.priority==="Urgent");
 return `<div class="voice-hero card">
   <div class="voice-heading"><div><span class="eyebrow">ELARA VOICE COMMAND</span><h2>Talk. ELARA handles the paperwork.</h2><p class="muted">Speak one complete field update. Include the contractor, progress, location, problem, amount, and next step whenever they apply.</p></div><div class="voice-ready">● READY</div></div>
   <button class="mic-btn primary-mic" id="voiceMicButton" onclick="startGuidedVoice()"><span class="mic-icon">🎙️</span><span id="voiceMicLabel">Talk to ELARA</span></button>
   <div class="voice-coach"><b>ELARA will ask you to cover:</b><span>Who?</span><span>What happened?</span><span>Where?</span><span>How much?</span><span>What happens next?</span></div>
   <label for="voiceTranscript">ELARA heard:</label>
   <textarea id="voiceTranscript" class="voice-input" placeholder="Example: ABC Painting is 87 percent complete in Classroom 4. We found water damage behind the east wall. Need approval for a $2,400 change order and follow up with the owner tomorrow."></textarea>
   <div class="voice-helper-row"><button onclick="addPromptToVoice('The contractor is ') ">+ Contractor</button><button onclick="addPromptToVoice('Progress is percent complete. ') ">+ Progress</button><button onclick="addPromptToVoice('The location is ') ">+ Location</button><button onclick="addPromptToVoice('The change order amount is $') ">+ Amount</button><button onclick="addPromptToVoice('Need to follow up by ') ">+ Next Step</button></div>
   <div class="example-strip"><b>Practice examples:</b><button onclick="useVoiceExample(1)">Contractor + damage</button><button onclick="useVoiceExample(2)">Delay + task</button><button onclick="useVoiceExample(3)">Measurement</button><button onclick="useVoiceExample(4)">Change order</button><button onclick="useVoiceExample(5)">End-of-day update</button></div>
   <div class="row-actions"><button class="action-btn success-btn strong-action" onclick="analyzeVoiceUpdate()">ELARA, Organize This</button><button class="action-btn" onclick="toggleVoiceCapture()">🎙️ Add More</button><button class="action-btn" onclick="clearVoiceUpdate()">Clear</button></div>
   <div id="voiceStatus" class="voice-status" aria-live="polite">Ready when you are.</div><div id="voicePreview"></div>
 </div>
 <div class="dashboard-layout"><div><div class="card">${data.project.isDemo?`<div class="demo-banner"><b>Example Project</b><span>This sample lets Ernest practice. It can be replaced at any time.</span><button class="action-btn success-btn" onclick="startRealProject()">Start Ernest’s Real Project</button></div>`:""}<h2>${esc(data.project.name)}</h2><p><b>Supervisor:</b> ${esc(data.project.supervisor)}</p><p><b>Location:</b> ${esc(data.project.location||"Not entered")}</p><p><b>Status:</b> ${esc(data.project.status)}</p></div><div class="grid"><div class="stat"><h3>Rooms</h3><p>${t.rooms}</p></div><div class="stat"><h3>Sq Ft</h3><p>${t.sqft}</p></div><div class="stat"><h3>Damage</h3><p>${data.damages.length}</p></div><div class="stat"><h3>Contractors</h3><p>${data.contractors.length}</p></div></div>${urgent.length||co.length?`<div class="card alert"><h2>Field Alerts</h2>${urgent.map(x=>`<p>⚠ Urgent damage: ${esc(x.area)} — ${esc(x.issue)}</p>`).join("")}${co.map(x=>`<p>⚠ Change order pending: ${esc(x.contractor)} — ${money(x.amount)}</p>`).join("")}</div>`:""}<div class="panel"><h2>Recent Activity</h2>${data.activities.slice(0,8).map(x=>`<div class="activity-item"><span class="activity-time">${esc(x.time)}</span>${esc(x.text)}</div>`).join("")||`<p class="muted">No activity yet.</p>`}</div></div><div><div class="panel"><h2>Today's Tasks</h2>${open.map(x=>`<div class="task"><input type="checkbox" onchange="toggleTask('${x.id}')" style="width:auto;margin:0 10px 0 0;">${esc(x.text)}</div>`).join("")||`<p class="muted">All tasks complete.</p>`}<button class="action-btn" onclick="addTask()">+ Add Task</button></div><div class="panel"><h2>ELARA Coach</h2><div class="recommendation"><b>Voice tip:</b> Say names, percentages, locations, dollar amounts, and next steps clearly.</div><div class="recommendation"><b>Field lesson:</b> Never begin extra work until the change order is documented and approval is confirmed.</div><button class="action-btn" onclick="loadPage('help')">Teach Me How</button></div></div></div>`
}
function analyzeVoiceUpdate(){
 const input=document.getElementById('voiceTranscript'),preview=document.getElementById('voicePreview');
 if(!input||!input.value.trim()){setVoiceStatus('Tell me what happened first—by voice or by typing.','warning');speakElara('Tell me what happened first.');return}
 pendingVoiceUpdate=parseVoiceUpdate(input.value);
 const p=pendingVoiceUpdate,items=[];
 if(p.contractorUpdate)items.push(`<div class="voice-card"><span class="voice-card-icon">👷</span><div><b>Contractor Update</b><p>${esc(p.contractorUpdate.name)} — ${p.contractorUpdate.progress}% complete — ${esc(p.contractorUpdate.status)}</p></div><span class="check-mark">✓</span></div>`);
 if(p.damage)items.push(`<div class="voice-card"><span class="voice-card-icon">📸</span><div><b>Damage Record</b><p>${esc(p.damage.area)} — ${esc(p.damage.issue)}</p></div><span class="check-mark">✓</span></div>`);
 if(p.changeOrder)items.push(`<div class="voice-card"><span class="voice-card-icon">💵</span><div><b>Change Order</b><p>${esc(p.changeOrder.contractor)} — ${money(p.changeOrder.amount)} — Pending Review</p></div><span class="check-mark">✓</span></div>`);
 if(p.task)items.push(`<div class="voice-card"><span class="voice-card-icon">✅</span><div><b>Task</b><p>${esc(p.task)}</p></div><span class="check-mark">✓</span></div>`);
 items.push(`<div class="voice-card"><span class="voice-card-icon">📝</span><div><b>Daily Field Note</b><p>${esc(p.dailyNote)}</p></div><span class="check-mark">✓</span></div>`);
 const warnings=[];
 if(p.changeOrder&&p.changeOrder.amount===0)warnings.push('I heard a change order, but I did not catch the amount.');
 if(p.contractorUpdate&&p.contractorUpdate.name==='Contractor')warnings.push('I did not catch the contractor name.');
 preview.innerHTML=`<div class="voice-preview"><div class="preview-title"><div><span class="eyebrow">REVIEW BEFORE SAVING</span><h3>ELARA understood:</h3></div><button class="small-btn readback" onclick="readVoicePreview()">🔊 Read It Back</button></div>${warnings.map(w=>`<div class="voice-warning">⚠ ${esc(w)}</div>`).join('')}${items.join('')}<div class="approval-box"><b>Does this look right?</b><p>Review names, percentages, locations, and dollar amounts.</p><div class="row-actions"><button class="action-btn success-btn strong-action" onclick="saveVoiceUpdate()">Yes — Save Everything</button><button class="action-btn" onclick="toggleVoiceCapture()">🎙️ Add or Correct</button><button class="action-btn" onclick="clearVoiceUpdate()">Start Over</button></div></div></div>`;
 setVoiceStatus('Review the prepared records. ELARA can read them back aloud.','success');
 speakElara(`Ernest, I organized your update. ${voiceSummaryText(p)}`);
}
const originalSaveVoiceUpdate=saveVoiceUpdate;
saveVoiceUpdate=function(){
 if(!pendingVoiceUpdate)return;
 const spoken=`Saved. I updated the project records for ${data.project.name}.`;
 originalSaveVoiceUpdate();
 setTimeout(()=>speakElara(spoken),150);
}


/* =========================================================
   ELARA FIELD COMMANDER V4 — TIMELINE + OPTIONAL ACADEMY
   ========================================================= */

function openAcademy(){
  window.open("academy/index.html","_blank","noopener");
}

function timelineEventIcon(type=""){
  const t=String(type).toLowerCase();
  if(t.includes("contractor")) return "👷";
  if(t.includes("damage")) return "📸";
  if(t.includes("change")) return "💵";
  if(t.includes("task")) return "✅";
  if(t.includes("email")) return "✉️";
  if(t.includes("measurement")) return "📐";
  if(t.includes("report")||t.includes("note")) return "📝";
  if(t.includes("safety")) return "⚠️";
  return "●";
}

function createTimelineFromVoice(p, rawText){
  if(!window.ELARATimeline || !p) return;
  const base={
    projectId: data.project.name.toLowerCase().replace(/[^a-z0-9]+/g,"-"),
    projectName: data.project.name,
    source:"Voice confirmed by user",
    confidence:"Confirmed",
    metadata:{rawVoiceText:rawText||p.dailyNote||""}
  };

  if(p.contractorUpdate){
    ELARATimeline.createEvent({
      ...base,
      type:"Contractor Progress",
      title:`${p.contractorUpdate.name} progress updated`,
      description:`${p.contractorUpdate.name} is ${p.contractorUpdate.progress}% complete. Status: ${p.contractorUpdate.status}.`,
      contractor:p.contractorUpdate.name,
      progress:p.contractorUpdate.progress,
      status:p.contractorUpdate.status
    });
  }
  if(p.damage){
    ELARATimeline.createEvent({
      ...base,
      type:"Damage",
      title:`Damage documented at ${p.damage.area}`,
      description:p.damage.issue,
      location:p.damage.area,
      status:p.damage.priority
    });
  }
  if(p.changeOrder){
    ELARATimeline.createEvent({
      ...base,
      type:"Change Order",
      title:`Change order created for ${p.changeOrder.contractor}`,
      description:p.changeOrder.reason,
      contractor:p.changeOrder.contractor,
      amount:p.changeOrder.amount,
      status:p.changeOrder.status||"Pending Review"
    });
  }
  if(p.task){
    ELARATimeline.createEvent({
      ...base,
      type:"Task",
      title:"Follow-up task created",
      description:p.task,
      status:"Open"
    });
  }
  ELARATimeline.createEvent({
    ...base,
    type:"Daily Field Note",
    title:"Voice field update saved",
    description:p.dailyNote
  });
}

function renderTimeline(){
  const all=window.ELARATimeline?.getAll?.()||[];
  const projectId=data.project.name.toLowerCase().replace(/[^a-z0-9]+/g,"-");
  const events=all.filter(e=>e.projectId===projectId || e.projectName===data.project.name);
  const today=new Date().toISOString().slice(0,10);
  const todayCount=events.filter(e=>e.date===today).length;

  return `<div class="card timeline-header-card">
    <div>
      <span class="eyebrow">AUTOMATIC PROJECT MEMORY</span>
      <h2>Project Timeline</h2>
      <p class="muted">ELARA records confirmed voice updates, damage, contractor progress, tasks, and change orders automatically.</p>
    </div>
    <div class="timeline-stats">
      <div><strong>${events.length}</strong><span>Total Events</span></div>
      <div><strong>${todayCount}</strong><span>Today</span></div>
    </div>
  </div>

  <div class="card">
    <div class="timeline-toolbar">
      <input id="timelineSearchInput" placeholder="Search: painter, damage, change order..." oninput="filterTimelineView()">
      <button class="action-btn" onclick="downloadTodaySummary()">📝 Today's Summary</button>
      <button class="action-btn" onclick="ELARATimelineExport.csv(getCurrentProjectTimeline())">Export CSV</button>
      <button class="action-btn" onclick="ELARATimelineExport.json(getCurrentProjectTimeline())">Export JSON</button>
    </div>
    <div id="timelineEventList">${renderTimelineEvents(events)}</div>
  </div>`;
}

function getCurrentProjectTimeline(){
  const projectId=data.project.name.toLowerCase().replace(/[^a-z0-9]+/g,"-");
  return (window.ELARATimeline?.getAll?.()||[]).filter(e=>e.projectId===projectId || e.projectName===data.project.name);
}

function renderTimelineEvents(events){
  if(!events.length) return `<div class="timeline-empty"><span>🕒</span><h3>No timeline events yet</h3><p>Your next confirmed voice update will appear here automatically.</p></div>`;
  return events.map(event=>`<div class="timeline-event">
    <div class="timeline-icon">${timelineEventIcon(event.type)}</div>
    <div class="timeline-body">
      <div class="timeline-event-top">
        <b>${esc(event.title)}</b>
        <span>${esc(event.date)} · ${esc(event.time)}</span>
      </div>
      <p>${esc(event.description||"")}</p>
      <div class="timeline-tags">
        <span>${esc(event.type)}</span>
        <span>${esc(event.source)}</span>
        <span>${esc(event.confidence)}</span>
        ${event.progress!==null&&event.progress!==undefined?`<span>${event.progress}%</span>`:""}
        ${event.amount?`<span>${money(event.amount)}</span>`:""}
      </div>
    </div>
  </div>`).join("");
}

function filterTimelineView(){
  const query=document.getElementById("timelineSearchInput")?.value||"";
  const events=query.trim()
    ? ELARATimelineSearch.search(query,getCurrentProjectTimeline())
    : getCurrentProjectTimeline();
  const list=document.getElementById("timelineEventList");
  if(list) list.innerHTML=renderTimelineEvents(events);
}

function downloadTodaySummary(){
  const today=new Date().toISOString().slice(0,10);
  const summary=ELARATimelineSummary.daily(today,getCurrentProjectTimeline());
  const blob=new Blob([summary.text],{type:"text/plain"});
  const url=URL.createObjectURL(blob);
  const a=document.createElement("a");
  a.href=url;
  a.download=`${data.project.name.replace(/[^a-z0-9]+/gi,"_")}_${today}_Timeline_Summary.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

const v4LoadPage=loadPage;
loadPage=function(page){
  if(page==="timeline"){
    document.getElementById("content").innerHTML=renderTimeline();
    return;
  }
  v4LoadPage(page);
};

const v4SaveVoiceUpdate=saveVoiceUpdate;
saveVoiceUpdate=function(){
  if(!pendingVoiceUpdate) return;
  const snapshot=JSON.parse(JSON.stringify(pendingVoiceUpdate));
  const rawText=document.getElementById("voiceTranscript")?.value||snapshot.dailyNote||"";
  v4SaveVoiceUpdate();
  createTimelineFromVoice(snapshot,rawText);
};

const v4RenderDashboard=renderDashboard;
renderDashboard=function(){
  const base=v4RenderDashboard();
  const today=new Date().toISOString().slice(0,10);
  const todayEvents=getCurrentProjectTimeline().filter(e=>e.date===today).slice(0,5);
  const quick=`<div class="card v4-command-row">
    <button class="v4-command" onclick="loadPage('timeline')"><span>🕒</span><b>Timeline</b><small>${todayEvents.length} events today</small></button>
    <button class="v4-command academy-command" onclick="openAcademy()"><span>✦</span><b>Academy</b><small>Optional · never interrupts work</small></button>
  </div>`;
  return base+quick;
};


/* =========================================================
   V5 BETA 1 — PWA, BID COMMANDER, FEEDBACK, WELCOME
   ========================================================= */
const SUGGESTION_KEY="elara_field_suggestions_v1";

function openBidCommander(){
  window.location.href="bid-commander/index.html";
}
function finishWelcome(){
  localStorage.setItem("elara_v5_welcome_seen","yes");
  document.getElementById("welcomeWizard")?.classList.add("hidden");
}
function loadSuggestions(){
  try{return JSON.parse(localStorage.getItem(SUGGESTION_KEY))||[]}catch{return[]}
}
function saveSuggestions(items){
  localStorage.setItem(SUGGESTION_KEY,JSON.stringify(items));
}
function renderSuggestions(){
  const items=loadSuggestions();
  return `<div class="card suggestion-hero">
    <span class="eyebrow">BUILD WITH ELARA</span>
    <h2>What would make your day easier?</h2>
    <p class="muted">Speak or type an idea. ELARA saves the screen, project, date, and app version automatically.</p>
    <textarea id="suggestionText" placeholder="Example: I wish I could attach several photos to one damage report."></textarea>
    <div class="row-actions">
      <button class="action-btn" onclick="startSuggestionVoice()">🎙️ Speak Idea</button>
      <button class="action-btn success-btn" onclick="submitSuggestion()">Send Suggestion</button>
      <button class="action-btn" onclick="exportSuggestions()">Export Ideas</button>
    </div>
    <div id="suggestionStatus" class="voice-status"></div>
  </div>
  <div class="card">
    <h2>Saved Ideas</h2>
    ${items.length?items.map(item=>`<div class="suggestion-item">
      <div><b>${esc(item.text)}</b><p>${esc(item.date)} · ${esc(item.project)} · ${esc(item.version)}</p></div>
      <span>${esc(item.status)}</span>
    </div>`).join(""):`<p class="muted">No ideas saved yet.</p>`}
  </div>`;
}
function startSuggestionVoice(){
  const Recognition=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!Recognition){alert("Voice suggestions are not supported in this browser. You can type the idea instead.");return}
  const recognition=new Recognition();
  recognition.lang="en-US";
  recognition.interimResults=false;
  recognition.onresult=e=>{
    document.getElementById("suggestionText").value=e.results[0][0].transcript;
    document.getElementById("suggestionStatus").textContent="I heard your idea. Review it, then press Send Suggestion.";
  };
  recognition.onerror=()=>document.getElementById("suggestionStatus").textContent="I couldn't hear that clearly. Please try again or type the idea.";
  recognition.start();
}
function submitSuggestion(){
  const text=document.getElementById("suggestionText")?.value.trim();
  if(!text){alert("Tell ELARA the idea first.");return}
  const items=loadSuggestions();
  items.unshift({
    id:uid(),
    text,
    date:new Date().toLocaleString(),
    project:data.project.name,
    version:"V5 Beta 1",
    screen:"Ideas for ELARA",
    status:"New"
  });
  saveSuggestions(items);
  addActivity("Suggestion submitted to ELARA");
  loadPage("suggestions");
  setTimeout(()=>{const s=document.getElementById("suggestionStatus");if(s)s.textContent="Thank you. Your idea is saved on this device."},0);
}
function exportSuggestions(){
  const items=loadSuggestions();
  const blob=new Blob([JSON.stringify(items,null,2)],{type:"application/json"});
  const url=URL.createObjectURL(blob);
  const a=document.createElement("a");
  a.href=url;a.download="ELARA_Field_Suggestions.json";a.click();URL.revokeObjectURL(url);
}

const v5LoadPage=loadPage;
loadPage=function(page){
  if(page==="suggestions"){
    document.getElementById("content").innerHTML=renderSuggestions();
    return;
  }
  v5LoadPage(page);
};

const v5RenderDashboard=renderDashboard;
renderDashboard=function(){
  const base=v5RenderDashboard();
  const bidCard=`<div class="card v5-product-card">
    <div><span class="eyebrow">PRE-CONSTRUCTION</span><h2>Bid Commander</h2><p class="muted">When the company asks you to bid a job, ELARA walks through scope, pricing, checklist, and submission.</p></div>
    <button class="action-btn success-btn" onclick="openBidCommander()">Open Bid Commander</button>
  </div>`;
  return base+bidCard;
};
