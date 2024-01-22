<?php
session_start();

// Établir la connexion avec la base de données
$serveur = "localhost";
$utilisateur = "root";
$motdepasse = "root";
$base = "comptesMap";

$connexion = mysqli_connect($serveur, $utilisateur, $motdepasse, $base);

if (!$connexion) {
    die("Échec de la connexion : " . mysqli_connect_error());
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Récupérer les données du favori
    $latitude = $_POST['latitude'];
    $longitude = $_POST['longitude'];
    $nom_magasin = $_POST['name'];

    // Suppose que l'utilisateur est connecté et que vous avez l'ID de l'utilisateur.
    $id_utilisateur = $_SESSION['id_utilisateur'];

    // Échapper les variables pour prévenir les attaques par injection SQL
    $latitude = mysqli_real_escape_string($connexion, $latitude);
    $longitude = mysqli_real_escape_string($connexion, $longitude);
    $nom_magasin = mysqli_real_escape_string($connexion, $nom_magasin);

    // Requête SQL pour retirer le favori
    $requete = "DELETE FROM favoris WHERE id_utilisateur='$id_utilisateur' AND latitude='$latitude' AND longitude='$longitude' AND nom_magasin='$nom_magasin'";
    $resultat = mysqli_query($connexion, $requete);

    if ($resultat) {
        echo "Favori retiré avec succès!";
    } else {
        echo "Erreur lors du retrait du favori : " . mysqli_error($connexion);
    }
} else {
    echo "Méthode non autorisée";
}

// Fermer la connexion
mysqli_close($connexion);
?>
