document.addEventListener('deviceready', loadBus, false);

function loadBus() {
    const container = document.getElementById('bus-list');
    container.innerHTML = '<p>Chargement des bus...</p>';

    // Utilisation de cordova-plugin-advanced-http
    cordova.plugin.http.get(`${API_BASE}/bus/`, {}, {}, 
        function(response) {
            // response.data contient le JSON sous forme de string
            try {
                const buses = JSON.parse(response.data);
                container.innerHTML = '';

                if (buses.length === 0) {
                    container.innerHTML = '<p>Aucun bus disponible.</p>';
                    return;
                }

                buses.forEach(bus => {
                    const div = document.createElement('div');
                    div.className = 'col-md-4';
                    div.innerHTML = `
                        <div class="card bus-card shadow-sm" onclick="window.location.href='arretbus.html?id=${bus.id}'" style="cursor:pointer;">
                            <div class="card-body">
                                <h5 class="card-title">${bus.nomBus}</h5>
                            </div>
                        </div>
                    `;
                    container.appendChild(div);
                });
            } catch (e) {
                console.error("Erreur parsing JSON:", e);
                container.innerHTML = '<p>Impossible de charger les bus (erreur JSON)</p>';
            }
        },
        function(error) {
            console.error("Erreur HTTP plugin:", error);
            container.innerHTML = '<p>Impossible de charger les bus (erreur HTTP)</p>';
            alert("Erreur HTTP : " + JSON.stringify(error));
        }
    );
}
