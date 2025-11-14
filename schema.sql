
--  TABLE : Bus
CREATE TABLE Bus (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nomBus VARCHAR(100),
    longitudeDepart FLOAT,
    latitudeDepart FLOAT,
    longitudeArrivee FLOAT,
    latitudeArrivee FLOAT
);

--  TABLE : ArretBus
CREATE TABLE ArretBus (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nomArret VARCHAR(100),
    longitude FLOAT,
    latitude FLOAT
);

--  TABLE : Utilisateur
CREATE TABLE Utilisateur (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nom VARCHAR(100),
    prenom VARCHAR(100),
    email VARCHAR(150)
);

--  TABLE : GPS
CREATE TABLE GPS (
    id INT PRIMARY KEY AUTO_INCREMENT,
    dateEnvoi DATETIME,
    longitude FLOAT,
    latitude FLOAT,
    idBus INT,

    CONSTRAINT fk_gps_bus
    FOREIGN KEY (idBus) REFERENCES Bus(id)
    ON DELETE CASCADE
);

--  TABLE : PasserPar (relation Bus et ArretBus)
CREATE TABLE PasserPar (
    idBus INT,
    idArret INT,
    ordre INT,
    PRIMARY KEY (idBus, idArret),

    CONSTRAINT fk_passer_bus
    FOREIGN KEY (idBus) REFERENCES Bus(id)
    ON DELETE CASCADE,

    CONSTRAINT fk_passer_arret
    FOREIGN KEY (idArret) REFERENCES ArretBus(id)
    ON DELETE CASCADE
);

--  TABLE : Selectionner (relation Utilisateur et ArretBus)
CREATE TABLE Selectionner (
    idArret INT,
    idUtilisateur INT,
    actif BOOLEAN,
    PRIMARY KEY (idArret, idUtilisateur),

    CONSTRAINT fk_sel_arret
    FOREIGN KEY (idArret) REFERENCES ArretBus(id)
    ON DELETE CASCADE,

    CONSTRAINT fk_sel_user
    FOREIGN KEY (idUtilisateur) REFERENCES Utilisateur(id)
    ON DELETE CASCADE
);

--  TABLE : Surveiller (relation Utilisateur et Bus)
CREATE TABLE Surveiller (
    idBus INT,
    idUtilisateur INT,
    actif BOOLEAN,
    PRIMARY KEY (idBus, idUtilisateur),

    CONSTRAINT fk_surv_bus
    FOREIGN KEY (idBus) REFERENCES Bus(id)
    ON DELETE CASCADE,

    CONSTRAINT fk_surv_user
    FOREIGN KEY (idUtilisateur) REFERENCES Utilisateur(id)
    ON DELETE CASCADE
);
