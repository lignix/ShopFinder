<?php
session_start();

// Assurez-vous que l'utilisateur est connecté
if (!isset($_SESSION['id_utilisateur'])) {
    echo json_encode([]);
    exit();
}

// Établir la connexion avec la base de données
$serveur = "localhost";
$utilisateur = "root";
$motdepasse = "root";
$base = "comptesMap";

$connexion = mysqli_connect($serveur, $utilisateur, $motdepasse, $base);

if (!$connexion) {
    die("Échec de la connexion : " . mysqli_connect_error());
}

// Récupérer l'ID de l'utilisateur connecté
$id_utilisateur = $_SESSION['id_utilisateur'];

// Requête SQL pour récupérer les magasins favoris de l'utilisateur
$requete = "SELECT * FROM favoris WHERE id_utilisateur = $id_utilisateur";
$resultat = mysqli_query($connexion, $requete);

if ($resultat) {
    $favoris = [];

    while ($row = mysqli_fetch_assoc($resultat)) {
        // Ajouter les détails du favori dans le tableau
        $favori = [
            'latitude' => $row['latitude'],
            'longitude' => $row['longitude'],
            'nom_magasin' => $row['nom_magasin'],
        ];

        $favoris[] = $favori;
    }

    // Fermer la connexion
    mysqli_close($connexion);

    // Convertir le tableau en format JSON et le renvoyer
    echo json_encode($favoris);
} else {
    // Erreur lors de l'exécution de la requête
    echo json_encode([]);
}

?>
