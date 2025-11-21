// Récupération du bus dans l'URL
const params = new URLSearchParams(window.location.search);
const busId = params.get("id");

// Variables pour stocker l’arrêt cliqué
let selectedArretId = null;
let selectedArretNom = null;

document.addEventListener("deviceready", loadArrets, false);

function loadArrets() {
    const container = document.getElementById("arrets-list");

    if (!busId) {
        container.innerHTML = "<p>ID du bus manquant.</p>";
        return;
    }

    container.innerHTML = "<p>Chargement des arrêts...</p>";
    cordova.plugin.http.get(
        `${API_BASE}/bus/${busId}/arrets`,
        {},
        {},
        function(response) {
            const arrets = JSON.parse(response.data);
            container.innerHTML = "";

            if (arrets.length === 0) {
                container.innerHTML = "<p>Aucun arrêt trouvé.</p>";
                return;
            }

            document.getElementById("bus-title").innerText = `Arrêts du Bus #${busId}`;

            let html = '<ul class="list-group">';

            arrets.forEach(arret => {
                html += `
                    <li class="list-group-item list-group-item-action"
                        onclick="openConfirmModal(${arret.id}, '${arret.nomArret.replace(/'/g, "\\'")}')">
                        ${arret.nomArret}
                    </li>
                `;
            });

            html += "</ul>";
            container.innerHTML = html;

        },
        function(error) {
            console.error("Erreur HTTP :", error);
            container.innerHTML = "<p>Erreur chargement.</p>";
        }
    );
}

/**
 * Ouvre le modal de confirmation
 */
function openConfirmModal(idArret, nomArret) {
    selectedArretId = idArret;
    selectedArretNom = nomArret;

    document.getElementById("modal-text").innerText =
        `Voulez-vous surveiller l'arrêt "${nomArret}" pour ce bus ?`;

    const modal = new bootstrap.Modal(document.getElementById("confirmModal"));
    modal.show();

    document.getElementById("confirm-btn").onclick = validateSelection;
}

/**
 * Envoie POST surveiller
 */
function validateSelection() {

    const userId = 1;
    const actif = 1;

    cordova.plugin.http.setDataSerializer('json');

    cordova.plugin.http.post(
        `${API_BASE}/surveiller`,
        {
            idUtilisateur: userId,
            idBus: busId,
            idArret: selectedArretId,
            actif: actif
        },
        {},
        function() {

            var modalEl = document.getElementById('confirmModal');
            var modalInstance = bootstrap.Modal.getInstance(modalEl);
            modalInstance.hide();

            alert("L'arrêt a été ajouté aux points que vous surveillés!");
        },
        function(error) {
            alert("Erreur surveiller : " + JSON.stringify(error));
        }
    );
}

