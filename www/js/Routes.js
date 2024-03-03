//Variables Globales
const URLBASE = "https://calcount.develotion.com/";
const MENU = document.querySelector("#menu");
const ROUTER = document.querySelector("#rooteo");
const HOME = document.querySelector("#pantallaHome");
const LOGIN = document.querySelector("#pantallaLogin");
const REGISTRO_USUARIO = document.querySelector("#pantallaRegistro");
const REGISTRO_COMIDA = document.querySelector("#pantallaRegistroComidas");
const LISTA_DE_COMIDAS = document.querySelector("#pantallaListaDeComidas");
const INFORME_DE_CALORIAS = document.querySelector("#pantallaInformeDeCalorias");
const MAPAS = document.querySelector("#pantallaMapas");

inicio();


function eventos(){
    ROUTER.addEventListener('ionRouteDidChange', navegacion);
}


/* Acciones */

function cerrarMenu(){
    MENU.close();
}


function inicio(){
    //chequearSession
    chequearSession();
    //Eventos de session
    eventos();
}

function ocultarPantallas(){
    HOME.style.display = "none";
    LOGIN.style.display = "none";
    REGISTRO_USUARIO.style.display = "none";
    REGISTRO_COMIDA.style.display = "none";
    LISTA_DE_COMIDAS.style.display = "none";
    INFORME_DE_CALORIAS.style.display = "none";
    MAPAS.style.display = "none";
}

function navegacion(evento){
    ocultarPantallas();
    if(evento.detail.to == "/"){
        HOME.style.display = "block";
    }
    if(evento.detail.to == "/login"){
        LOGIN.style.display = "block";
    }
    if(evento.detail.to == "/registroUsuario"){
        REGISTRO_USUARIO.style.display = "block";
    }
    if(evento.detail.to == "/registroComidas"){
        REGISTRO_COMIDA.style.display = "block";
    }
    if(evento.detail.to == "/listaDeComidas"){
        LISTA_DE_COMIDAS.style.display = "block";
    }
    if(evento.detail.to == "/informeCalorias"){
        INFORME_DE_CALORIAS.style.display = "block";
    }
    if(evento.detail.to == "/mapas"){
        MAPAS.style.display = "block";
    }
    if (evento.detail.to == "/logout") { 
        HOME.style.display = "block";
    }
}

function chequearSession(){
    //Inicia con todos ocultos
    ocultarBotones();
    if(localStorage.getItem("user") != null && localStorage.getItem("apiKey")){
        mostrarMenuLogueado();
    }else{
        mostrarMenuSinLoguear();
    }

}

function ocultarBotones(){
    document.querySelector("#btnHome").style.display = "none";
    document.querySelector("#btnLogin").style.display = "none";
    document.querySelector("#btnRegistroUsuario").style.display = "none";
    document.querySelector("#btnRegistroComidas").style.display = "none";
    document.querySelector("#btnListarComidas").style.display = "none";
    document.querySelector("#btnInformeCalorias").style.display = "none";
    document.querySelector("#btnMapas").style.display = "none";
    document.querySelector("#btnLogout").style.display = "none";
}

function mostrarMenuLogueado(){
    ocultarBotones();
    document.querySelector("#btnRegistroComidas").style.display = "block";
    document.querySelector("#btnHome").style.display = "block";
    document.querySelector("#btnListarComidas").style.display = "block";
    document.querySelector("#btnInformeCalorias").style.display = "block";
    document.querySelector("#btnMapas").style.display = "block";
    document.querySelector("#btnLogout").style.display = "block";
}

function mostrarMenuSinLoguear(){
    ocultarBotones();
    document.querySelector("#btnHome").style.display = "block";
    document.querySelector("#btnLogin").style.display = "block";
    document.querySelector("#btnRegistroUsuario").style.display = "block";
}

function mostrarTarjeta(titulo, mensaje, color){
    //Se crea la alerta
    const alert = document.createElement('ion-alert');
    alert.header = titulo;
    alert.message = mensaje;
    alert.cssClass = color;
    alert.buttons = ['Aceptar'];

    // Escucha el evento cuando la alerta se presenta completamente
    alert.addEventListener('ionAlertDidPresent', function() {
        // Obtén el botón de la alerta
        const button = alert.querySelector('.alert-button');
        // Obtén el span dentro del botón
        const span = button.querySelector('span');

        // Agregar clase de color al span del botón
        if(color === "danger"){
            span.classList.add(`alert-button-inner`, `sc-ion-alert-ios`, `textDanger`);
        } else if(color === "success"){
            span.classList.add(`alert-button-inner`, `sc-ion-alert-ios`, `textSuccess`);
        } else {
            span.classList.add(`alert-button-inner`, `sc-ion-alert-ios`, `textPrimary`);
        }
    });

    // Presenta la alerta
    document.body.appendChild(alert);
    alert.present();
}




