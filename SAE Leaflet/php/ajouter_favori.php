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

    // Vérifier si l'utilisateur est connecté
    if (isset($_SESSION['id_utilisateur']) && !empty($_SESSION['id_utilisateur'])) {
        // Utilisateur connecté, récupérer l'ID de l'utilisateur
        $id_utilisateur = $_SESSION['id_utilisateur'];

        // Échapper les variables pour prévenir les attaques par injection SQL
        $latitude = mysqli_real_escape_string($connexion, $latitude);
        $longitude = mysqli_real_escape_string($connexion, $longitude);
        $nom_magasin = mysqli_real_escape_string($connexion, $nom_magasin);

        // Requête SQL pour ajouter le favori
        $requete = "INSERT INTO favoris (id_utilisateur, latitude, longitude, nom_magasin) VALUES ('$id_utilisateur', '$latitude', '$longitude', '$nom_magasin')";
        $resultat = mysqli_query($connexion, $requete);

        if ($resultat) {
            echo "Favori ajouté avec succès!";
        } else {
            echo "Erreur lors de l'ajout du favori : " . mysqli_error($connexion);
        }
    } else {
        echo "Utilisateur non connecté";
    }
} else {
    echo "Méthode non autorisée";
}
?>
