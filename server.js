const express = require('express');
const cors = require('cors');
const db = require('./config/db');

const app = express();
app.use(cors({
    origin: '*'
}));
app.use(express.json());


// Envoyer des données GPS (INSERT)
// body: { idBus, longitude, latitude, dateEnvoi }
app.post('/api/gps', async (req, res) => {
    try {
        const { idBus, longitude, latitude, dateEnvoi } = req.body;
        const date = dateEnvoi || new Date();
        await db.query(
            "INSERT INTO GPS (idBus, longitude, latitude, dateEnvoi) VALUES (?, ?, ?, ?)",
            [idBus, longitude, latitude, date]
        );
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erreur lors de l'insertion GPS" });
    }
});


// Récupérer les données GPS d'un bus depuis une date
// query params: ?idBus=1&dateEnvoi=2025-11-15T12:00:00
app.get('/api/gps', async (req, res) => {
    try {
        const { idBus, dateEnvoi } = req.query;
        if (!idBus) return res.status(400).json({ error: "idBus requis" });
        let query = "SELECT * FROM GPS WHERE idBus = ?";
        const params = [idBus];
        if (dateEnvoi) {
            query += " AND dateEnvoi >= ?";
            params.push(dateEnvoi);
        }
        query += " ORDER BY dateEnvoi ASC";
        const [rows] = await db.query(query, params);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erreur récupération GPS" });
    }
});

// Récupérer la liste de tous les bus
app.get('/api/bus', async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM Bus");
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erreur récupération bus" });
    }
});

// Récupérer la liste de tous les arrêts
app.get('/api/arrets', async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM ArretBus");
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erreur récupération arrets" });
    }
});


// Récupérer la liste des arrêts pour un bus (PasserPar)
app.get('/api/bus/:idBus/arrets', async (req, res) => {
    try {
        const idBus = req.params.idBus;
        const [rows] = await db.query(`
            SELECT ArretBus.id, ArretBus.nomArret, ArretBus.longitude, ArretBus.latitude, PasserPar.ordre
            FROM PasserPar
            JOIN ArretBus ON PasserPar.idArret = ArretBus.id
            WHERE PasserPar.idBus = ?
            ORDER BY PasserPar.ordre ASC
        `, [idBus]);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erreur récupération arrets du bus" });
    }
});


// Récupérer les arrêts surveillés d'un user
// header: { idUtilisateur }
app.get('/api/surveiller/:idUtilisateur', async (req, res) => {
    try {
        const idUtilisateur = req.params.idUtilisateur;

        const [rows] = await db.query(`
            SELECT ArretBus.id AS idArret, ArretBus.nomArret, ArretBus.longitude, ArretBus.latitude, Bus.id AS idBus, Bus.nomBus, Surveiller.actif
            FROM Surveiller
            JOIN ArretBus ON Surveiller.idArret = ArretBus.id
            JOIN Bus ON Surveiller.idBus = Bus.id
            WHERE idUtilisateur = ?
        `, [idUtilisateur]);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erreur récupération arrêts surveillés" });
    }
});


// Modifier une entrée dans Surveiller
// header: { idUtilisateur, idBus, idArret }
app.patch('/api/surveiller/:idUtilisateur/:idBus/:idArret', async (req, res) => {
    try {
        const { idUtilisateur, idBus, idArret } = req.params;
        const { actif } = req.body; // 1 ou 0

        await db.query(`
            UPDATE Surveiller
            SET actif = ?
            WHERE idUtilisateur = ? AND idBus = ? AND idArret = ?
        `, [actif, idUtilisateur, idBus, idArret]);

        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erreur mise à jour surveiller" });
    }
});


// Ajouter une entrée dans Surveiller
// body: { idUtilisateur, idBus, idArret, actif }
app.post('/api/surveiller', async (req, res) => {
    try {
        const { idUtilisateur, idBus, idArret, actif } = req.body;

        await db.query(`
            INSERT INTO Surveiller (idUtilisateur, idBus, idArret, actif)
            VALUES (?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
                actif = VALUES(actif)
        `, [idUtilisateur, idBus, idArret, actif]);

        res.json({ success: true });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erreur surveiller" });
    }
});



// Lancement du serveur
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`API Bus lancée sur http://localhost:${PORT}`);
});
