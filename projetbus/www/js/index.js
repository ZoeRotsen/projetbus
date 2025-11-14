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
