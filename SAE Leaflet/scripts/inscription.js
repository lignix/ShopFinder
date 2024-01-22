$(document).ready(function () {
    $("#registerButton").on("click", function () {
        var username = $("#username").val();
        var password = $("#password").val();

        // Envoi des données au serveur PHP pour inscription
        $.post('./php/inscription.php', { username: username, password: password }, function (response) {
            console.log(response);
            $("#result").html(response);

            // Vérifie si la réponse est "Inscription réussie"
            if (response.trim() === "Inscription réussie!") {
                // Redirige l'utilisateur vers la page de connexion après une inscription réussie
                console.log("Redirection vers la page de connexion...");
                window.location.href = "./auth.html";
            }
        });
    });
});
