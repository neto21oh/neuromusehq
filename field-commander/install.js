let deferredInstallPrompt = null;

function isIOS(){
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}
function isStandalone(){
  return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
}
function setConnectionStatus(){
  const status = document.getElementById("connectionStatus");
  if(!status) return;
  if(navigator.onLine){
    status.textContent = "● LOCAL + CONNECTED";
    status.className = "status-pill connected";
  }else{
    status.textContent = "● OFFLINE · EVERYTHING SAFE";
    status.className = "status-pill offline";
  }
}
function showInstallHelp(){
  const panel = document.getElementById("installHelp");
  if(panel) panel.classList.remove("hidden");
}
function closeInstallHelp(){
  const panel = document.getElementById("installHelp");
  if(panel) panel.classList.add("hidden");
}
async function installELARA(){
  if(isStandalone()){
    alert("ELARA is already installed on this device.");
    return;
  }
  if(deferredInstallPrompt){
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    updateInstallButton();
    return;
  }
  showInstallHelp();
}
function updateInstallButton(){
  const button = document.getElementById("installAppButton");
  if(!button) return;
  button.style.display = isStandalone() ? "none" : "";
}
window.addEventListener("beforeinstallprompt", event => {
  event.preventDefault();
  deferredInstallPrompt = event;
  updateInstallButton();
});
window.addEventListener("appinstalled", () => {
  deferredInstallPrompt = null;
  updateInstallButton();
});
window.addEventListener("online", setConnectionStatus);
window.addEventListener("offline", setConnectionStatus);

async function registerELARAServiceWorker(){
  if(!("serviceWorker" in navigator)) return;
  if(location.protocol === "file:"){
    console.warn("Service workers require HTTPS or localhost. Deploy the folder to the website to install on a phone.");
    return;
  }
  try{
    const registration = await navigator.serviceWorker.register("./service-worker.js");
    registration.addEventListener("updatefound", () => {
      const worker = registration.installing;
      if(!worker) return;
      worker.addEventListener("statechange", () => {
        if(worker.state === "installed" && navigator.serviceWorker.controller){
          const banner = document.getElementById("updateBanner");
          if(banner) banner.classList.remove("hidden");
        }
      });
    });
  }catch(error){
    console.error("ELARA service worker registration failed:", error);
  }
}
function applyELARAUpdate(){
  navigator.serviceWorker.getRegistration().then(registration => {
    registration?.waiting?.postMessage("SKIP_WAITING");
    location.reload();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setConnectionStatus();
  updateInstallButton();
  registerELARAServiceWorker();

  const params = new URLSearchParams(location.search);
  const action = params.get("action");
  if(action === "timeline") setTimeout(() => loadPage("timeline"), 50);
  if(action === "talk") setTimeout(() => {
    loadPage("dashboard");
    setTimeout(() => document.getElementById("voiceMicButton")?.focus(), 100);
  }, 50);

  if(!localStorage.getItem("elara_v5_welcome_seen")){
    document.getElementById("welcomeWizard")?.classList.remove("hidden");
  }
});
