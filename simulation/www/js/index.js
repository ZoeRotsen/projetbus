
// Configuration API
const API_CONFIG = {
  baseUrl: "http://10.40.56.177:3000/api",
  idBus: 2,
  interval: 5000, // 5s
};

let isTracking = false;
let intervalId = null;

// Liste des points du GPX
let gpxPoints = [];
let gpxIndex = 0;


document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {
  loadGPX();

  document.getElementById("gpsToggle").addEventListener("change", toggleGPS);
}


// Charger le fichier GPX depuis www/data/

function loadGPX() {
  fetch("data/S01_vers_Darboussier.gpx")
    .then((response) => response.text())
    .then((xmlText) => {
      parseGPX(xmlText);
      showMessage("Tracé GPX chargé points)", "success");
    })
    .catch((err) => {
      console.error("Erreur chargement du fichier GPX", err);
      showMessage("Impossible de charger le fichier GPX", "error");
    });
}


// Conversion du  GPX (de XML à un tableau JS)
function parseGPX(gpxText) {
  const parser = new DOMParser();
  const xml = parser.parseFromString(gpxText, "application/xml");

  const trkpts = xml.getElementsByTagName("trkpt");

  gpxPoints = [];

  for (let i = 0; i < trkpts.length; i++) {
    const lat = parseFloat(trkpts[i].getAttribute("lat"));
    const lon = parseFloat(trkpts[i].getAttribute("lon"));

    const timeTag = trkpts[i].getElementsByTagName("time")[0];

    gpxPoints.push({
      latitude: lat,
      longitude: lon,
      timestamp: timeTag ? timeTag.textContent : new Date().toISOString(),
    });
  }
}

// =============================
// Toggle du simulateur GPS
// =============================
function toggleGPS(event) {
  const isEnabled = event.target.checked;

  if (isEnabled) startTracking();
  else stopTracking();
}

// =============================
// Démarrer simulation
// =============================
function startTracking() {
  if (isTracking) return;
  if (gpxPoints.length === 0) {
    showMessage("Aucun fichier GPX chargé", "error");
    return;
  }

  isTracking = true;
  gpxIndex = 0;

  updateStatus("Activé", true);

  // Envoi immédiat
  sendGPXPoint(gpxPoints[gpxIndex]);
  gpxIndex++;

  intervalId = setInterval(() => {
    if (gpxIndex >= gpxPoints.length) {
      gpxIndex = 0; // repart au début
    }

    sendGPXPoint(gpxPoints[gpxIndex]);
    gpxIndex++;

  }, API_CONFIG.interval);

  showMessage("Simulation GPS démarrée", "success");
}

// =============================
// Arrêter simulation
// =============================
function stopTracking() {
  if (!isTracking) return;

  isTracking = false;
  updateStatus("Désactivé", false);

  if (intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
  }

  resetDisplay();

  showMessage("Simulation GPS arrêtée", "info");
}

//Formatage de la date
function formatToMySQL(date) {
  return date.getFullYear() + "-" +
    String(date.getMonth() + 1).padStart(2, "0") + "-" +
    String(date.getDate()).padStart(2, "0") + " " +
    String(date.getHours()).padStart(2, "0") + ":" +
    String(date.getMinutes()).padStart(2, "0") + ":" +
    String(date.getSeconds()).padStart(2, "0");
}

// =============================
// Envoi API
// =============================
function sendGPXPoint(point) {
  updateDisplay(point.latitude, point.longitude);

  const now = new Date();             // récupère l'heure locale du téléphone
  const dateEnvoi = formatToMySQL(now);
  

  const data = {
    idBus: API_CONFIG.idBus,
    longitude: point.longitude,
    latitude: point.latitude,
    dateEnvoi: dateEnvoi
  };

  cordova.plugin.http.setDataSerializer("json");

  cordova.plugin.http.post(
    `${API_CONFIG.baseUrl}/gps`,
    data,
    { "Content-Type": "application/json" },
    function (response) {
      console.log("Point envoyé");
      showMessage("Données envoyées", "success");
    },
    function (error) {
      console.error("Erreur:", error);
      showMessage("Erreur réseau", "error");
      showMessage(error.error, "error");
    }
  );
}

// =============================
// Affichage Interface
// =============================
function updateDisplay(latitude, longitude) {
  document.getElementById("latitude").textContent = latitude.toFixed(6);
  document.getElementById("longitude").textContent = longitude.toFixed(6);
  document.getElementById("lastUpdate").textContent = new Date().toLocaleTimeString();
}

function resetDisplay() {
  document.getElementById("latitude").textContent = "--";
  document.getElementById("longitude").textContent = "--";
  document.getElementById("lastUpdate").textContent = "--";
}

function updateStatus(text, isActive) {
  const statusText = document.getElementById("statusText");
  statusText.textContent = text;
  statusText.style.color = isActive ? "#4CAF50" : "#666";
}

function showMessage(text, type) {
  const messageBox = document.getElementById("messageBox");
  messageBox.textContent = text;
  messageBox.className = `message-box ${type} show`;

  setTimeout(() => {
    messageBox.classList.remove("show");
  }, 3000);
}
