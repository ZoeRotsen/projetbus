const USER_ID = 1; // temporaire

document.addEventListener("deviceready", loadSurveillance, false);

function loadSurveillance() {

    const container = document.getElementById("surveillance-list");
    container.innerHTML = "<p>Chargement...</p>";

    cordova.plugin.http.get(
        `${API_BASE}/surveiller/${USER_ID}`,
        {},
        {},
        function (response) {

            const arrets = JSON.parse(response.data);
            container.innerHTML = "";

            if (arrets.length === 0) {
                container.innerHTML = "<p>Aucun arrêt surveillé.</p>";
                return;
            }

            arrets.forEach(a => {

                const html = `
                    <div class="card mb-2 shadow-sm">
                        <div class="card-body d-flex justify-content-between align-items-center">
                            <div>
                                <strong>${a.nomArret}</strong><br>
                                <small>Bus : ${a.nomBus}</small>
                            </div>
                            
                            <div>
                                <div class="form-check form-switch">
                                    <input 
                                        class="form-check-input" 
                                        type="checkbox" 
                                        ${a.actif ? "checked" : ""}
                                        onchange="toggleSurveillance(${USER_ID}, ${a.idBus}, ${a.idArret}, this.checked)"
                                    >
                                </div>
                            </div>
                        </div>
                    </div>
                `;

                container.insertAdjacentHTML("beforeend", html);
            });
        },
        function (error) {
            console.error(error);
            container.innerHTML = "<p>Erreur chargement</p>";
        }
    );
}


/**
 * Activation / désactivation d'un arrêt surveillé
 */
function toggleSurveillance(idUtilisateur, idBus, idArret, actif) {

    cordova.plugin.http.setDataSerializer("json");

    cordova.plugin.http.patch(
        `${API_BASE}/surveiller/${idUtilisateur}/${idBus}/${idArret}`,
        { actif: actif ? 1 : 0 },
        {},
        function () {
            console.log("État mis à jour");
        },
        function (error) {
            alert("Erreur modification " + JSON.stringify(error));
        }
    );
}
