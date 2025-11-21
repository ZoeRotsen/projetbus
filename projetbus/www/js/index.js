// Configuration API
const API_CONFIG = {
  baseUrl: "http://10.253.166.177:3000/api", // Remplacez par l'IP de votre serveur
  interval: 30000, // 30 secondes
  idBus: 1, // ID du bus - À adapter selon votre besoin
};

// Variables globales
let isTracking = false;
let watchId = null;
let intervalId = null;
let currentPosition = null;

document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {
  document.getElementById("gpsToggle").addEventListener("change", toggleGPS);
}

// Toggle GPS tracking
function toggleGPS(event) {
  const isEnabled = event.target.checked;

  if (isEnabled) {
    startTracking();
  } else {
    stopTracking();
  }
}

// Démarrer le tracking GPS
function startTracking() {
  if (isTracking) return;

  isTracking = true;
  updateStatus("Activé", true);

  // Options de géolocalisation
  const options = {
    enableHighAccuracy: true,
    timeout: 30000,
    maximumAge: 0,
  };

  // Démarrer le watch position
  watchId = navigator.geolocation.watchPosition(
    onPositionSuccess,
    onPositionError,
    options
  );

  // Démarrer l'envoi périodique
  startPeriodicSending();

  showMessage("GPS activé", "success");
}

// Arrêter le tracking GPS
function stopTracking() {
  if (!isTracking) return;

  isTracking = false;
  updateStatus("Désactivé", false);

  // Arrêter le watch position
  if (watchId !== null) {
    navigator.geolocation.clearWatch(watchId);
    watchId = null;
  }

  // Arrêter l'envoi périodique
  if (intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
  }

  // Réinitialiser l'affichage
  resetDisplay();

  showMessage("GPS désactivé", "info");
}

// Callback de succès de géolocalisation
function onPositionSuccess(position) {
  currentPosition = position;

  const latitude = position.coords.latitude;
  const longitude = position.coords.longitude;
  const accuracy = position.coords.accuracy;

  // Mettre à jour l'interface
  updateDisplay(latitude, longitude, accuracy);
}

// Callback d'erreur de géolocalisation
function onPositionError(error) {
  console.error("Erreur GPS:", error);

  let message = "Erreur GPS: ";
  switch (error.code) {
    case error.PERMISSION_DENIED:
      message += "Permission refusée";
      break;
    case error.POSITION_UNAVAILABLE:
      message += "Position indisponible";
      break;
    case error.TIMEOUT:
      message += "Délai dépassé";
      break;
    default:
      message += "Erreur inconnue";
      break;
  }

  showMessage(message, "error");
}

// Démarrer l'envoi périodique
function startPeriodicSending() {
  // Envoyer immédiatement
  sendDataToServer();

  // Puis envoyer à intervalle régulier
  intervalId = setInterval(() => {
    sendDataToServer();
  }, API_CONFIG.interval);
}

// Mettre à jour l'affichage
function updateDisplay(latitude, longitude, accuracy) {
  document.getElementById("latitude").textContent = latitude.toFixed(6);
  document.getElementById("longitude").textContent = longitude.toFixed(6);
  document.getElementById("accuracy").textContent = accuracy.toFixed(2) + " m";
  document.getElementById("lastUpdate").textContent =
    new Date().toLocaleTimeString();
}

// Réinitialiser l'affichage
function resetDisplay() {
  document.getElementById("latitude").textContent = "--";
  document.getElementById("longitude").textContent = "--";
  document.getElementById("accuracy").textContent = "--";
  document.getElementById("lastUpdate").textContent = "--";
}

// Mettre à jour le statut
function updateStatus(text, isActive) {
  const statusText = document.getElementById("statusText");
  statusText.textContent = text;
  statusText.style.color = isActive ? "#4CAF50" : "#666";
}

// Afficher un message
function showMessage(text, type) {
  const messageBox = document.getElementById("messageBox");
  messageBox.textContent = text;
  messageBox.className = `message-box ${type} show`;

  setTimeout(() => {
    messageBox.classList.remove("show");
  }, 3000);
}

// Envoyer les données au serveur
function sendDataToServer() {
  if (!currentPosition) {
    console.log("Aucune position à envoyer");
    return;
  }

  const data = {
    idBus: API_CONFIG.idBus,
    longitude: currentPosition.coords.longitude,
    latitude: currentPosition.coords.latitude,
    dateEnvoi: new Date().toISOString(),
  };

  // Utilisation de cordova-plugin-advanced-http
  cordova.plugin.http.setDataSerializer("json");

  cordova.plugin.http.post(
    `${API_CONFIG.baseUrl}/gps`,
    data,
    {
      "Content-Type": "application/json",
    },
    function (response) {
      // Succès
      console.log("Données envoyées avec succès");
      console.log("Réponse:", response.data);
      showMessage("Données envoyées ✓", "success");
    },
    function (error) {
      // Erreur

      alert(error.error);

      console.error("Erreur réseau:", error);
      console.error("Status:", error.status);
      console.error("Message:", error.error);
      showMessage("Erreur réseau", "error");
    }
  );
}
