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

    // Vérifier si l'utilisateur existe déjà
    $checkUserQuery = "SELECT id_nom FROM utilisateur WHERE user='$username'";
    $checkUserResult = mysqli_query($connexion, $checkUserQuery);

    if ($checkUserResult && mysqli_num_rows($checkUserResult) > 0) {
        // L'utilisateur existe déjà, renvoyer un message d'erreur
        echo "Erreur : Cet utilisateur existe déjà. Veuillez choisir un autre nom d'utilisateur.";
    } else {
        // Insérer l'utilisateur dans la base de données
        $insertUserQuery = "INSERT INTO utilisateur (user, password) VALUES ('$username', '$password')";
        $insertUserResult = mysqli_query($connexion, $insertUserQuery);

        if ($insertUserResult) {
            // Inscription réussie
            echo "Inscription réussie!";
        } else {
            // Erreur lors de l'inscription
            echo "Erreur d'inscription : " . mysqli_error($connexion);
        }
    }
} else {
    echo "Méthode non autorisée";
}

// Fermer la connexion
mysqli_close($connexion);
?>
