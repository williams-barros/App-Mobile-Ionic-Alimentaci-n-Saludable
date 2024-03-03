document.querySelector("#btnListarEnMapa").addEventListener("click", cargarInfoMapa);

//Se setean las variables para casos donde el GPS no este permitido
let latitud = -32.875554;
let longitud = -56.020152;
let mapa = null;
let markerUsuario = null;
//Icono de punto marcando mi propia ubicacion
let posicionUsuarioIcon = L.icon({
    iconUrl: 'img/user.png',
    iconSize: [25, 25]
});
//Icono de punto marcando icono de cada pais encontrado
let posicionPaisIcon = L.icon({
    iconUrl: 'img/pais.png',
    iconSize: [25, 25]
});

// Crear un grupo de capas para los marcadores de países
let markerPaisesGroup = L.layerGroup();

function listarEnMapa(){
    getMiPosicion();
}

function getMiPosicion(){
    //Obtener posicion actual
    navigator.geolocation.getCurrentPosition(miUbicacion);
}

function miUbicacion(position) {
    latitud = position.coords.latitude
    longitud = position.coords.longitude
    crearMapa();
}

function crearMapa(){
    if(!mapa){
        mapa = L.map('mapa').setView([latitud, longitud], 13);
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(mapa);
    
        markerUsuario = L.marker([latitud, longitud], {icon:posicionUsuarioIcon}).addTo(mapa);
    }
}

function cargarInfoMapa() {
    fetch(URLBASE + '/usuariosPorPais.php', {
        method: 'GET',
        headers: {
             'Content-Type': 'application/json',
             "apikey": localStorage.getItem("apiKey"),
             "iduser": localStorage.getItem("user"),
        }
    })
    .then(response => {
        return response.json();
    })
    .then(data => {
        if (data && data.codigo === 200 && data.paises && data.paises.length > 0) {
            mapa.setZoom(3);
            marcarPaisesEnMapa(data)
            closeLoadingSpinner('loadingMap');
        } else {
            mostrarTarjeta('¡Atención!', 'No se han encontado paises con usuarios registrados.', 'danger');
        }
    })
    .catch(error => {
        mostrarTarjeta('¡Atención!', `Error: ${error}.`, 'danger');    
    }
    );
}

async function marcarPaisesEnMapa(data) {
    let filtro = Number(document.querySelector("#txtMapaDeRegistrosFiltro").value);
    
    if (!isNaN(filtro)) {
        // Limpiar los marcadores de países existentes antes de agregar nuevos
        markerPaisesGroup.clearLayers();

        try {
            const paisesValidos = data.paises.filter(pais => pais.cantidadDeUsuarios >= filtro && pais !== undefined)
            let paises = await obtenerPaisMapa();

            const paisesCoincidentes = paises.filter(pais => {
                const paisValido = paisesValidos.find(p => p.id === pais.id);
                return paisValido !== undefined;
            });

            paisesCoincidentes.forEach(pais => {
                if (pais) { 
                    let latP = pais.latitude;
                    let longP = pais.longitude;
                    L.marker([latP, longP], { icon: posicionPaisIcon }).addTo(markerPaisesGroup);
                }
            });

            // Agregar el grupo de capas al mapa
            markerPaisesGroup.addTo(mapa);
        } catch (error) {
            mostrarTarjeta('¡Atención!', `Error: ${error}.`, 'danger');
        }
    } else {
        mostrarTarjeta('¡Atención!', `Solo se admiten valores numericos.`, 'danger');
    }
}


async function obtenerPaisMapa() {
    try {
        const response = await fetch(URLBASE + '/paises.php', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        const data = await response.json();
        if (data && data.codigo === 200 && data.paises && data.paises.length > 0) {
            return data.paises;
        } else {
            throw new Error('Problema con la búsqueda de países');
        }
    } catch (error) {
        mostrarTarjeta('¡Atención!', `Error: ${error}.`, 'danger');
    }
}

function closeLoadingSpinner(idComponent) { 
    let loadingElement = document.getElementById(idComponent);       
    loadingElement.componentOnReady().then(function (loading) {
        loading.dismiss();
    });
}


