$(document).ready(function () {
    $("#loginButton").on("click", function () {
        var username = $("#username").val();
        var password = $("#password").val();

        // Envoi des données au serveur PHP pour vérification
        $.post('./php/connexion.php', { username: username, password: password }, function (response) {
            console.log(response);
            $("#result").html(response);

            // Vérifie si la réponse est "Connexion réussie"
            if (response.trim() === "Connexion réussie!") {
                // Redirige l'utilisateur vers la page carte.html
                console.log("redirection sur la carte...");
                window.location.href = "./carte.html";
            }
        });
    });
});