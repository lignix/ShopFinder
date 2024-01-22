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
    // Récupérer les données du formulaire
    $username = $_POST['username'];
    $password = $_POST['password'];

    // Échapper les variables pour prévenir les attaques par injection SQL
    $username = mysqli_real_escape_string($connexion, $username);
    $password = mysqli_real_escape_string($connexion, $password);

    // Requête SQL pour vérifier les informations de connexion
    $requete = "SELECT id_nom FROM utilisateur WHERE user='$username' AND password='$password'";
    $resultat = mysqli_query($connexion, $requete);

    if ($resultat) {
        // Vérifier si des résultats ont été trouvés
        if (mysqli_num_rows($resultat) > 0) {
            // Utilisateur authentifié avec succès
            $row = mysqli_fetch_assoc($resultat);
            $_SESSION['id_utilisateur'] = $row['id_nom'];
            echo "Connexion réussie!";
        } else {
            // Nom d'utilisateur ou mot de passe incorrect
            echo "Nom d'utilisateur ou mot de passe incorrect.";
        }
    } else {
        // Erreur lors de l'exécution de la requête
        echo "Erreur de requête : " . mysqli_error($connexion);
    }
} else {
    echo "Méthode non autorisée";
}

// Fermer la connexion
mysqli_close($connexion);
?>
