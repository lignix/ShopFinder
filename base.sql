--
-- Projet par Charles Bouvier
--

-- --------------------------------------------------------

--
-- Base de données :  `comptesMap`
--

-- --------------------------------------------------------

--
-- Structure de la table `utilisateur`
--

CREATE TABLE IF NOT EXISTS `utilisateur` (
  `id_nom` int(11) NOT NULL AUTO_INCREMENT,
  `user` text COLLATE utf8_bin NOT NULL,
  `password` text COLLATE utf8_bin NOT NULL,
  PRIMARY KEY (`id_nom`)
);


-- Ajout de la contrainte unique composite sur la table `utilisateur`
ALTER TABLE `utilisateur`
ADD CONSTRAINT `unique_user`
UNIQUE (`user`(255));

--
-- Contenu de la table `utilisateur`
--

INSERT INTO `utilisateur` (`user`, `password`) VALUES
('admin', 'admin'),
('Charles', 'Bouvier');



--
-- Structure de la table `favoris`
--
CREATE TABLE IF NOT EXISTS `favoris` (
  `id_favori` int(11) NOT NULL AUTO_INCREMENT,
  `id_utilisateur` int(11) NOT NULL,
  `latitude` double NOT NULL,
  `longitude` double NOT NULL,
  `nom_magasin` text NOT NULL,
  PRIMARY KEY (`id_favori`),
  FOREIGN KEY (`id_utilisateur`) REFERENCES `utilisateur` (`id_nom`) ON DELETE CASCADE
);

-- Ajout d'une contrainte unique composite sur les colonnes pour éviter les doublons par utilisateur
ALTER TABLE `favoris`
ADD CONSTRAINT `unique_favori`
UNIQUE (`id_utilisateur`, `latitude`, `longitude`, `nom_magasin`(255));
ALTER TABLE `favoris`
ADD CONSTRAINT `unique_favori_user`
UNIQUE (`id_utilisateur`, `latitude`, `longitude`, `nom_magasin`(255));
