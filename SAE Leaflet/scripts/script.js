$(document).ready(function () {
    var radius = 100; //radius de base
    var lastPos;
    var magasinsGeoJSON = {
        type: 'FeatureCollection',
        features: []
    };

    // Preparation de la map
    const config = {
        minZoom: 7,
        maxZoom: 18,
    };
    const zoom = 18;
    const initialCoordinates = [48.8589384, 2.2646341]; //Paris
    // Bordures de la map
    const maxBounds = L.latLngBounds(
        L.latLng(-90, -180),  // Coin sud-ouest du monde
        L.latLng(90, 180)     // Coin nord-est du monde
    );
    const map = L.map("map", config).setView(initialCoordinates, zoom).setMaxBounds(maxBounds);
    const circlesLayer = L.layerGroup().addTo(map);
    const markers = L.markerClusterGroup();

    // Attribution
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    //parametre color
    var color = "#05a";
    document.querySelector("#valider_color").addEventListener("click", function () {
        color = document.querySelector("#colorInput").value;
        if (!(lastPos === undefined)) {
            drawCircle(lastPos);
        } else {
            console.log("Aucune position enregistrée pour le dernier clic, aucun cercle ne sera créé.");
        }
    });
    document.querySelector("#init_color").addEventListener("click", function () {
        color = "#05a";
        document.querySelector("#colorInput").value = "#0052b1";
        if (!(lastPos === undefined)) {
            drawCircle(lastPos);
        } else {
            console.log("Aucune position enregistrée pour le dernier clic, aucun cercle ne sera créé.");
        }
    });

    // Sidebar
    const menuItems = document.querySelectorAll(".menu-item");
    const buttonClose = document.querySelector(".close-button");
    menuItems.forEach((item) => {
        item.addEventListener("click", handleMenuItemClick);
    });
    buttonClose.addEventListener("click", closeSidebar);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("click", handleDocumentClick);

    // Localisation
    if ("geolocation" in navigator) {
        map.locate({ setView: true, enableHighAccuracy: true })
            .on("locationfound", handleLocationFound)
            .on("locationerror", handleLocationError);
    } else {
        alert("La géolocalisation n'est pas prise en charge par votre navigateur.");
    }


    // ANCIENNE RECHERCHE GEOJSON
    // Sur la base BANCO sur data.gouv
    /*
    $.getJSON('data.geojson')
        .done(function (data) {
            $.each(data.features, function (index, feature) {
                var type = feature.properties.type;
                var name = feature.properties.name;
                if ((type === "convenience" || type === "supermarket") && name != null) {
                    magasinsGeoJSON.features.push(feature);
                }
            });
            console.log("Magasins trouvés : ", magasinsGeoJSON.features.length);
        })
        .fail(function (error) {
            console.error("Erreur lors de la récupération des données GeoJSON:", error.statusText);
        }); 
    */

    // GeoJSON
    $.getJSON('magasinsData.geojson')
        .done(function (data) {
            $.each(data.features, function (index, feature) {
                magasinsGeoJSON.features.push(feature);
            });
            console.log("Magasins trouvés : ", magasinsGeoJSON.features.length);
        })
        .fail(function (error) {
            console.error("Erreur lors de la récupération des données GeoJSON:", error.statusText);
        });

    var userMarker;
    var userIconUrl = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" width="32" height="32" fill="red"><text x="10" y="15" font-size="15" text-anchor="middle">📍</text></svg>';


    // Ajout bouton retour à la position
    const customControl = L.Control.extend({
        options: {
            position: "topright",
        },
        onAdd: function (map) {
            const btn = L.DomUtil.create("button");
            btn.title = "replacer camera";
            btn.textContent = "📍";
            btn.className = "position-button";
            btn.setAttribute(
                "style",
                "background-color: rgba(0, 85, 170, 0.2); border: 1px solid " + color + "; display: flex; cursor: pointer; justify-content: center; font-size: 3em;"
            );
            btn.onmouseover = function () {
                this.style.transform = "scale(1.2)";
            };
            btn.onmouseout = function () {
                this.style.transform = "scale(1)";
            };
            btn.onclick = function () {
                if ("geolocation" in navigator) {
                    navigator.geolocation.getCurrentPosition(
                        function (position) {
                            const userLatLng = L.latLng(position.coords.latitude, position.coords.longitude);
                            map.setView(userLatLng, zoom);
                        },
                        function (error) {
                            console.error("Erreur de géolocalisation:", error.message);
                            alert("Erreur de géolocalisation. Assurez-vous que la géolocalisation est activée.");
                        },
                        { enableHighAccuracy: true }
                    );
                } else {
                    alert("La géolocalisation n'est pas prise en charge par votre navigateur.");
                }
            };

            return btn;
        },
    });
    map.addControl(new customControl());

    function addToFavorites(latitude, longitude, nomMagasin) {
        $.ajax({
            type: "POST",
            url: "./php/ajouter_favori.php",
            data: {
                latitude: latitude,
                longitude: longitude,
                name: nomMagasin
            },
            success: function (response) {
                console.log(`Magasin ${nomMagasin} ajouté aux favoris!`);
            },
            error: function (error) {
                console.error(error);
            }
        });
    }

    function removeFromFavorites(latitude, longitude, nomMagasin) {
        $.ajax({
            type: "POST",
            url: "./php/retirer_favori.php",
            data: {
                latitude: latitude,
                longitude: longitude,
                name: nomMagasin
            },
            success: function (response) {
                console.log(`Magasin ${nomMagasin} retiré des favoris!`);
            },
            error: function (error) {
                console.error(error);
            }
        });
    }

    var marker;
    function displayFavoriteStores() {
        var magasinsFavoris = {
            type: 'FeatureCollection',
            features: []
        };
        const personContent = document.getElementById("person");
        personContent.innerHTML = `
                <h2>Profil</h2>
                <div class="content">
                    <button id="logoutButton">Se déconnecter</button>
                    <h3>Magasins Favoris</h3>
                    <p><i>Chargement des favoris...</i></p>
                </div>
            `;
        $.ajax({
            type: "POST",
            url: "./php/recuperer_favoris.php",
            success: function (response) {
                const favorites = JSON.parse(response);
                $.getJSON('magasinsData.geojson')
                    .done(function (data) {
                        $.each(data.features, function (index, feature) {
                            var name = feature.properties.name;
                            var latitudeGeoJSON = parseFloat(feature.geometry.coordinates[1]);
                            var longitudeGeoJSON = parseFloat(feature.geometry.coordinates[0]);

                            for (i = 0; i < favorites.length; ++i) {
                                if (
                                    name === favorites[i].nom_magasin &&
                                    latitudeGeoJSON === parseFloat(favorites[i].latitude) &&
                                    longitudeGeoJSON === parseFloat(favorites[i].longitude)
                                ) {
                                    magasinsFavoris.features.push(feature);
                                }
                            }
                        });

                        console.log("Magasins favoris trouvés : ", magasinsFavoris.features.length);
                        //AFFICHAGE
                        circlesLayer.clearLayers();
                        if (magasinsFavoris.features.length === 0) {
                            // Si aucun favoris
                            const personContent = document.getElementById("person");
                            personContent.innerHTML = `
                                    <h2>Profil</h2>
                                    <div class="content">
                                        <button id="logoutButton">Se déconnecter</button>
                                        <h3>Magasins Favoris</h3>
                                        <p><i>Vous n'avez pas encore ajouté de magasins aux favoris.<br>Vous pouvez en ajouter un en cliquant sur son nom</i></p>
                                    </div>
                                `;
                            document.getElementById('logoutButton').addEventListener('click', function () {
                                console.log("Déconnexion...");
                                window.location.href = "./auth.html";
                            });
                        } else {
                            const favoriteStoresList = magasinsFavoris.features.map(store => `<li class="favorite-store">${store.properties.name}</li>`).join('');
                            const personContent = document.getElementById("person");
                            personContent.innerHTML = `
                                    <h2>Profil</h2>
                                    <div class="content">
                                        <button id="logoutButton">Se déconnecter</button>
                                        <h3>Magasins Favoris</h3>
                                        <ul>${favoriteStoresList}</ul>
                                    </div>
                                `;
                            document.getElementById('logoutButton').addEventListener('click', function () {
                                console.log("Déconnexion...");
                                window.location.href = "./auth.html";
                            });

                            const storeElements = document.querySelectorAll('.favorite-store');
                            storeElements.forEach((element, index) => {
                                const store = magasinsFavoris.features[index];
                                const deleteButton = document.createElement('button');
                                deleteButton.textContent = 'Supprimer des favoris';
                                deleteButton.classList.add('delete-button'); // Ajoutez cette ligne
                                deleteButton.addEventListener('click', function () {
                                    removeFromFavorites(
                                        store.geometry.coordinates[1],
                                        store.geometry.coordinates[0],
                                        store.properties.name
                                    );
                                    // Après la suppression, actualiser la liste des favoris
                                    displayFavoriteStores();
                                });

                                element.appendChild(deleteButton);
                                element.addEventListener('click', function () {
                                    const popupContent = createPopupContent(store);
                                    marker = L.marker([store.geometry.coordinates[1], store.geometry.coordinates[0]]);
                                    marker.bindPopup(popupContent);
                                    clearMap();
                                    markers.addLayer(marker);
                                    map.addLayer(markers);
                                    marker.openPopup();
                                    map.setView([store.geometry.coordinates[1], store.geometry.coordinates[0]], zoom);
                                });
                            });


                        }
                    })
                    .fail(function (error) {
                        console.error("Erreur lors de la récupération des données GeoJSON:", error.statusText);
                    });
            },
            error: function (error) {
                console.error(error);
            }
        });
        document.getElementById('logoutButton').addEventListener('click', function () {
            console.log("Déconnexion...");
            window.location.href = "./auth.html";
        });
    }

    function createPopupContent(store) {
        const popupContent = document.createElement('div');
        popupContent.innerHTML = `<b>${store.properties.name}</b><br>`;

        if (store.properties.type === "convenience") {
            popupContent.innerHTML += `Type: épicerie<br>`;
        } else if (store.properties.type === "supermarket") {
            popupContent.innerHTML += `Type: supermarché<br>`;
        } else {
            popupContent.innerHTML += `Type inconnu<br>`;
        }
        // Ajouter l'adresse s'il n'est pas null
        if (store.properties.address !== null) {
            popupContent.innerHTML += `Adresse: ${store.properties.address}<br>`;
        } else {
            popupContent.innerHTML += `Adresse inconnue<br>`;
        }
        popupContent.style.textAlign = 'center';

        const latitude = store.geometry.coordinates[1];
        const longitude = store.geometry.coordinates[0];
        const nomMagasin = store.properties.name;
        // Créer un bouton "favoris"
        const favoriteButton = document.createElement('button');
        favoriteButton.style.border = '0.1em solid black'; // sera gold si déjà favoris
        favoriteButton.style.color = 'black'; // sera gold si déjà favoris
        favoriteButton.style.borderRadius = '0.5em';
        favoriteButton.style.background = 'none';
        favoriteButton.style.padding = '0';
        // Conteneur pour le texte et l'icône
        const buttonContainer = document.createElement('div');
        buttonContainer.classList.add('icon-star-container');

        // Texte
        const buttonText = document.createElement('div');
        buttonText.textContent = "Ajouter aux favoris"; //Changera si déjà favoris
        const svgIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svgIcon.classList.add('icon-star');
        svgIcon.innerHTML = `<use xlink:href="#icon-star"></use>`;
        // Ajouter le texte et l'icône au conteneur
        buttonContainer.appendChild(buttonText);
        buttonContainer.appendChild(svgIcon);
        buttonContainer.style.margin = '5px';

        // Ajouter le conteneur au bouton
        favoriteButton.appendChild(buttonContainer);

        // vérifie si favoris
        $.ajax({
            type: "POST",
            url: "./php/recuperer_favoris.php",
            success: function (response) {
                const favorites = JSON.parse(response);

                let isFavorite = false;

                for (let i = 0; i < favorites.length; ++i) {
                    if (
                        nomMagasin === favorites[i].nom_magasin &&
                        latitude === parseFloat(favorites[i].latitude) &&
                        longitude === parseFloat(favorites[i].longitude)
                    ) {
                        isFavorite = true;
                        break; // Si l'élément est trouvé dans les favoris, pas besoin de continuer la boucle
                    }
                }

                if (isFavorite) {
                    favoriteButton.style.border = '0.1em solid gold';
                    favoriteButton.style.color = 'gold';
                    buttonText.textContent = "Dans les favoris";
                } else {
                    favoriteButton.addEventListener('click', function () {
                        addToFavorites(latitude, longitude, nomMagasin);
                        favoriteButton.style.border = '0.1em solid gold';
                        favoriteButton.style.color = 'gold';
                        buttonText.textContent = "Dans les favoris";
                    });
                }
            },
            error: function (error) {
                console.error(error);
            }
        });


        popupContent.appendChild(document.createElement('br'));
        popupContent.appendChild(document.createElement('br'));
        popupContent.appendChild(favoriteButton);
        return popupContent;
    }

    function clearMap() {
        circlesLayer.clearLayers();
        markers.clearLayers();
        closeSidebar();
    }

    // Si clic sur la map
    map.on("click", handleMapClick);
    // Créer le bouton "Retour position"
    const locateButton = document.getElementById('locateButton');

    function handleMenuItemClick(e) {
        const target = e.target;
        if (target.classList.contains("active-item") || !document.querySelector(".active-sidebar")) {
            document.body.classList.toggle("active-sidebar");
        }

        if (target.dataset.item === "person") {
            displayFavoriteStores();
        }

        showContent(target.dataset.item);
        addRemoveActiveItem(target, "active-item");
    }

    function handleKeyDown(event) {
        if (event.key === "Escape") {
            closeSidebar();
        }
    }

    function handleDocumentClick(e) {
        if (!e.target.closest(".sidebar")) {
            closeSidebar();
        }
    }

    function closeSidebar() {
        document.body.classList.remove("active-sidebar");
        const element = document.querySelector(".active-item");
        const activeContent = document.querySelector(".active-content");
        if (!element) return;
        element.classList.remove("active-item");
        activeContent.classList.remove("active-content");
    }

    function handleLocationFound(e) {
        const userLatLng = e.latlng;

        if (!userMarker) {
            userMarker = L.marker(userLatLng, { icon: L.icon({ iconUrl: userIconUrl, iconSize: [64, 64] }) }).addTo(map);
        }
        else {
            userMarker.setLatLng(userLatLng);
        }
        map.setView(userLatLng, map.getZoom());
    }

    function handleLocationError(e) {
        console.error("Location error:", e);
        alert("Accès à la localisation refusé.");
    }

    function handleMapClick(e) {
        lastPos = e.latlng;
        drawCircle(lastPos);
    }

    function addRemoveActiveItem(target, className) {
        const element = document.querySelector(`.${className}`);
        target.classList.add(className);
        if (!element) return;
        element.classList.remove(className);
    }

    function showContent(dataContent) {
        const idItem = document.querySelector(`#${dataContent}`);
        addRemoveActiveItem(idItem, "active-content");
    }

    // Fonction pour filtrer les magasins dans le cercle
    function filterStoresInCircle(circle) {
        const filteredStores = magasinsGeoJSON.features.filter(store => {
            if (
                store.geometry &&
                store.geometry.coordinates &&
                store.geometry.coordinates.length === 2 &&
                typeof store.geometry.coordinates[0] === 'number' &&
                typeof store.geometry.coordinates[1] === 'number'
            ) {
                const storeLatLng = L.latLng(store.geometry.coordinates[1], store.geometry.coordinates[0]);

                // Vérifier si le magasin est à l'intérieur du cercle en utilisant la distance
                const distanceToCenter = circle.getLatLng().distanceTo(storeLatLng);
                return distanceToCenter <= circle.getRadius();
            }
            return false;
        });

        markers.clearLayers();

        filteredStores.forEach(store => {
            const popupContent = createPopupContent(store);
            const marker = L.marker([store.geometry.coordinates[1], store.geometry.coordinates[0]]);
            marker.bindPopup(popupContent);
            markers.addLayer(marker);
        });
        map.addLayer(markers);
    }

    function drawCircle(pos) {
        circlesLayer.clearLayers();
        const circle = L.circle(pos, radius, {
            color: color,
            fillColor: '#fff',
            fillOpacity: 0.2
        }).addTo(circlesLayer);
        filterStoresInCircle(L.circle(lastPos, radius));
    }
    $("#changerRayon").on("click", function () {
        const radiusInput = document.getElementById("radiusInput");
        const newRadius = parseInt(radiusInput.value);

        // Mettre à jour le rayon du cercle avec la nouvelle valeur
        if (!isNaN(newRadius) && newRadius > 0) {
            radius = newRadius;
            console.log("Nouveau rayon: ", radius);
            if (!(lastPos === undefined)) {
                drawCircle(lastPos);
            } else {
                console.log("Aucune position enregistrée pour le dernier clic, aucun cercle ne sera créé.");
            }

        } else {
            alert("Veuillez saisir un nombre valide pour le radius.");
        }
    });

});


