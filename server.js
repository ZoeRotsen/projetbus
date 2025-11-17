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

// Récupérer la liste de tous les arrêts
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

// Ajouter ou modifier une entrée dans Selectionner
// body: { idUtilisateur, idArret, actif }
app.post('/api/selectionner', async (req, res) => {
    try {
        const { idUtilisateur, idArret, actif } = req.body;
        await db.query(`
            INSERT INTO Selectionner (idUtilisateur, idArret, actif)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE actif = ?
        `, [idArret, idUtilisateur, actif, actif]);
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erreur selectionner" });
    }
});

// Ajouter ou modifier une entrée dans Surveiller
// body: { idUtilisateur, idBus, actif }
app.post('/api/surveiller', async (req, res) => {
    try {
        const { idUtilisateur, idBus, actif } = req.body;
        await db.query(`
            INSERT INTO Surveiller (idUtilisateur, idBus, actif)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE actif = ?
        `, [idBus, idUtilisateur, actif, actif]);
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
