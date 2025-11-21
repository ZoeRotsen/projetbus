
--  TABLE : Bus
CREATE TABLE Bus (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nomBus VARCHAR(100),
    longitudeDepart DOUBLE,
    latitudeDepart DOUBLE,
    longitudeArrivee DOUBLE,
    latitudeArrivee DOUBLE
);

--  TABLE : ArretBus
CREATE TABLE ArretBus (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nomArret VARCHAR(100),
    longitude DOUBLE,
    latitude DOUBLE
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
    longitude DOUBLE,
    latitude DOUBLE,
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

--  TABLE : Surveiller (relation Utilisateur et Bus)
CREATE TABLE Surveiller (
    idBus INT,
    idArret INT,
    idUtilisateur INT,
    actif BOOLEAN,
    PRIMARY KEY (idBus, idArret, idUtilisateur)

    CONSTRAINT fk_surv_bus
    FOREIGN KEY (idBus) REFERENCES Bus(id)
    ON DELETE CASCADE,

    CONSTRAINT fk_surv_arretbus
    FOREIGN KEY (idArret) REFERENCES ArretBus(id)
    ON DELETE CASCADE,

    CONSTRAINT fk_surv_user
    FOREIGN KEY (idUtilisateur) REFERENCES Utilisateur(id)
    ON DELETE CASCADE
);
