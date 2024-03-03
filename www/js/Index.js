
function inicio(){
    //Eventos Pantallas
    document.querySelector("#btnLogear").addEventListener('click', recopilarDatos);
    document.querySelector("#btnLogout").addEventListener('click', logout);
    document.querySelector("#btnRegistrarUsuario").addEventListener('click', recopilarDatosRegistro);
    document.querySelector("#btnRegistrarComida").addEventListener('click', datosRegistroComida);
    document.querySelector("#btnListarComidas").addEventListener('click', cargarTablaDeAlimentos);
    document.querySelector("#btnInformeCalorias").addEventListener('click', listarCalorias);
    document.querySelector("#btnMapas").addEventListener("click", listarEnMapa);
    //Eventos Carga de combo desplegables
    document.querySelector("#btnRegistroUsuario").addEventListener('click',obtenerPais);
    document.querySelector("#btnRegistroComidas").addEventListener('click', cargarSelectDeAlimentos);

}

inicio();

//******** Consiguir alimentos desde la endPoint ********

function fetchAlimentos() {
    return fetch(`${URLBASE}alimentos.php`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            "apikey": localStorage.getItem("apiKey"),
            "iduser": localStorage.getItem("user"),
        },
    })
    .then(function(response) {
        if (!response.ok) {
            throw new Error('La solicitud no fue exitosa');
        }
        return response.json(); // Convertir el cuerpo de la respuesta a JSON
    })
    .then(function(data) {
        return data.alimentos; // Devolver los alimentos
    })
    .catch(function(error) {
        mostrarTarjeta("Error al obtener alimentos en la extraccion de los datos desde la endpoint:", `${error}`,"danger");
    });
}



//******** Listar alimentos: Para select/Array ********

function cargarSelectDeAlimentos(){
    fetchAlimentos()
    .then(arrAlimentos => {
        let fila = "";
        for (let alimento of arrAlimentos) {
            fila += `<ion-select-option value=${alimento.id}>${alimento.nombre} ${tipoUnidad(alimento.porcion)}</ion-select-option>`;
        }
        document.querySelector("#slcRegComidalimento").innerHTML = fila;
    })
    .catch(error => {
        mostrarTarjeta("Error!", `${error}`,"danger");
    })
}

//Trae la unidad de la porcion entregada como parametro
function tipoUnidad(porcion){
    let unidad = porcion[porcion.length - 1];
    //Salir del bucle cuando se encuentra el alimento
    return unidad; 
}

//******** Login ********

function recopilarDatos(){
    //Capturo info
    let usuario = document.querySelector("#txtLoginNombre").value;
    let password = document.querySelector("#txtLoginPassword").value;

    //Crear objeto
    let user = new UsuarioLogin(usuario,password);
    login(user);
}


function login(unU) {
    fetch(`${URLBASE}login.php`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(unU)
    })
    .then(function (response) {
        if (response.ok) {
                return response.json();
        } else {
            return response.text().then(body => {
                throw new Error(body);
            });
        }
    })
    .then(function (data) {
        localStorage.setItem("user", data.id)
        localStorage.setItem("apiKey", data.apiKey)
        localStorage.setItem("caloriasDiarias", data.caloriasDiarias)
        //Mostramos menu de usuario logueado
        mostrarMenuLogueado();
        //Ocultamos pantallas
        ocultarPantallas();
        HOME.style.display = "block";
    })
    .catch(function (error) {
         mostrarTarjeta("Error!", `${JSON.parse(error.message).mensaje}`,"danger");
    })
}


//******** Logout ********

function logout(){
    localStorage.removeItem("user");
    localStorage.removeItem("apiKey");
    localStorage.removeItem("caloriasDiarias");
    //Ocultamos pantallas
    ocultarPantallas();
    //Mostramos menu sin loguear
    mostrarMenuSinLoguear();
    //Mostrar Home
    HOME.style.display = "block";
}


//******** Registro Usuario ********

function obtenerPais() {
    fetch(`${URLBASE}paises.php`)
        .then(function (response) {
            return response.json()
        })
        .then(function (data) {
            cargarPaises(data)
        })
        .catch(function (error) {
            mostrarTarjeta("Error!", `${error}`,"danger");
        })
}

function cargarPaises(data){
    let listaPaises = data.paises
    let fila = "";
    for (let pais of listaPaises) {
        fila += `<ion-select-option value=${pais.id}>${pais.name}</ion-select-option>`;
    }
    document.querySelector("#slcPaises").innerHTML = fila;
}



function recopilarDatosRegistro(){
        //Capturo info
        let nombre = document.querySelector("#txtRegistroNombre").value;
        let password = document.querySelector("#txtRegistroPassword").value;
        let pais = document.querySelector("#slcPaises").value;
        let calorias = Number(document.querySelector("#txtRegistroCalorias").value);

    if (!isNaN(calorias)) {
        //Creamos el objeto usuario
        let usuario = new Usuario(nombre, password, pais, calorias);

        //Registramos
        registro(usuario);
    } else { 
        mostrarTarjeta("Error!", "Solo se admiten valores numericos.","danger");
    }

}


//Funcion del registro de usuario
function registro(nuevoUsuario){
    fetch (`${URLBASE}usuarios.php`,{
        method:'POST',
        headers:{
        'Content-Type': 'application/json'
        },
        body: JSON.stringify(nuevoUsuario)
    })
    .then(function (response){
    return response.json()
    })
    .then(function(data){
        if(!data.mensaje){
            mostrarTarjeta("Listo!", "Se a registrado como usuario, correctamente.","success");
            //Hacemos el inicio de sesion automatica
            let usuarioLogin = new UsuarioLogin(nuevoUsuario.usuario, nuevoUsuario.password); 
            login(usuarioLogin);
        }else{
            mostrarTarjeta("Error", "Error en registro.","danger");
        }

    })
    .catch(function(error){
        mostrarTarjeta("Error", "Error en registro.","danger");
    })
}


//******** Registro Comida ********

//Devuelve el subfijo con una promesa
function subfijo(alimento, cantidad) {
    return new Promise((resolve, reject) => {
        fetchAlimentos()
            .then(alimentos => {
                for (let i = 0; i < alimentos.length; i++) {
                    let iterado = alimentos[i];
                    if (Number(alimento) === iterado.id) {
                        let texto = iterado.porcion;
                        let subFijo = texto[texto.length - 1];
                        let caloriasTotales = 0;
                        if(subFijo === "g" || subFijo === "m"){
                            //Gramos o mililitros
                            caloriasTotales = calcularCalorias(Number(cantidad), Number(texto.substring(0, texto.length - 1)), Number(iterado.calorias));
                        }else{
                            //Unidades
                            caloriasTotales = cantidad * iterado.calorias;
                        }
                        resolve(`${caloriasTotales}${subFijo}`);
                        //Salir del bucle cuando se encuentra el alimento
                        return; 
                    }
                }
                reject("No se encontró el alimento con el ID proporcionado");
            })
            .catch(error => {
                reject("Error al conseguir las unidades: " + error);
            });
    });
}

//Calcular cantidad de calorias segun cantidad de gramos o mililitros
function calcularCalorias(cantidad,porcion,calorias){
    let caloriasTotales = (cantidad/porcion)*calorias;
    return caloriasTotales;
}

//recopilar datos del registro de comidas
function datosRegistroComida(){
    //Declaramos idAlimentos antes para usarla y traer el subfijo
    let idAlimento = document.querySelector("#slcRegComidalimento").value;
    let cantidadIngresada = Number(document.querySelector("#txtRegComidaCantidad").value);
    let fecha = document.querySelector("#txtRegComidaFecha").value;
    
    if(!isNaN(cantidadIngresada) && cantidadIngresada != 0 && !controlFecha(fecha)){
        subfijo(idAlimento, cantidadIngresada)
        .then(cantidad =>{
            //Capturo resto de la info
            let idUsuario = localStorage.getItem("user");
            //Creamos el objeto usuario
            let comida = new Comida(idAlimento,idUsuario,cantidad,fecha);
            //Registramos
            registroComida(comida);
        })
        .catch(error =>{
            mostrarTarjeta("Error!", `${error}`,"danger");
        })
    }else{
        mostrarTarjeta("Error!", "Error en uno de los campos ingresados.","danger");
    }

}

function controlFecha(fecha) {
    return new Date(fecha) > new Date();
 }

//Funcion del registro de comida
function registroComida(nuevaComida){
    fetch (`${URLBASE}registros.php`,{
        method:'POST',
        headers:{
        'Content-Type': 'application/json',
        "apikey" : localStorage.getItem("apiKey"),
        "iduser":  localStorage.getItem("user"),
        },
        body: JSON.stringify(nuevaComida)
    })
    .then(function (){
        mostrarTarjeta("Listo!", "Se a realizado correctamente nuevo registro de comida.","success");
    })
    .catch(function(error){
        mostrarTarjeta("Error", `Error en registro: ${error}`,"danger");
    })
}


//******** Listar comidas ********

//Conseguir registros de alimentos
function listarRegistroAlimentos(){
    return fetch(`${URLBASE}registros.php?idUsuario=${localStorage.getItem("user")}`,{
        method:'GET',
        headers:{
        'Content-Type': 'application/json',
        "apikey" : localStorage.getItem("apiKey"),
        "iduser":  localStorage.getItem("user"),
        },
    })
    .then(function (response) {
        if (!response.ok) {
            throw new Error('La solicitud no fue exitosa');
        }
        return response.json(); // Convertir el cuerpo de la respuesta a JSON
    })
    .then(function (data) {
        return data.registros;
        //cargarTablaDeAlimentos(data); // Llamar a la función para listar alimentos registrados
    })
    .catch(function (error) {
        mostrarTarjeta("Error al obtener alimentos:", `${error}`, "danger");
    });
}

//Listar alimentos(ícono, nombre y calorías + imagen con extension y nombre)
function cargarTablaDeAlimentos() {
    fetchAlimentos()
    .then(arr => {
        listarRegistroAlimentos()
            .then(data => {
            displayData(data, arr);
            closeLoadingSpinner('loadingComidas');
        })
        .catch(error => {
            mostrarTarjeta("Error en el fetch de registros antes de la creacion de la tabla:", `${error}`, "danger");
            closeLoadingSpinner('loadingComidas');
        })
    })
    .catch(error => {
        mostrarTarjeta("Error al listar alimentos antes de la creacion de la tabla:", `${error}`,"danger");
    });
}

//******** Eliminar registros de comidas ********

function eliminarRegistro(idregistro){
    fetch(`${URLBASE}registros.php?idRegistro=${idregistro}`,{
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          "apikey": localStorage.getItem("apiKey"),
          "iduser": localStorage.getItem("user"),
        }
      })
      .then(response => {

        if (response.ok) {
            //Cargamos la tabla nuevamente
            cargarTablaDeAlimentos();
            //Mandamos mensaje al usuario
            mostrarTarjeta("Listo!", "Registro eliminado exitosamente.","success");
        } else {
            throw new Error('Registro eliminado exitosamente');
        }
      })
      .catch(error => {
        mostrarTarjeta("Hubo un problema con la solicitud",`${error}`, "danger");
      });
      
}


/********* Busqueda *********/

document.querySelector("#btnBuscarPorFecha").addEventListener("click", buscarPorFecha);

//Busqueda de registros por rango de fechas
function buscarPorFecha(){
    fetchAlimentos()
    .then(arr => {
        listarRegistroAlimentos()
        .then(data => {
            let arrFiltrado = [];
            data.forEach(registro => {
                if(controlFechas(registro.fecha)){
                    arrFiltrado.push(registro);
                }
            });
            displayData(arrFiltrado, arr);
        })
        .catch(error => {
            mostrarTarjeta("Error en el fetch de registros antes de la creacion de la tabla:", `${error}`,"danger");
        })
    })
    .catch(error => {
        mostrarTarjeta("Error al listar alimentos antes de la creacion de la tabla:", `${error}`,"danger");
    });
}

//Control de rango para fecha recibida
function controlFechas(fIterada){
    let fechaInicial = new Date(document.querySelector("#dateInicio").value);
    let fechaFinal = new Date(document.querySelector("#dateFinal").value);
    let fechaIterada = new Date(fIterada);
    if(fechaIterada >= fechaInicial && fechaIterada <= fechaFinal){
        return true;
    }
}


/********* Fetch para imagenes *********/

function obtenerImagenes(producto){
    fetch("https://calcount.develotion.com/imgs/", {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          "apikey": localStorage.getItem("apiKey"),
          "iduser": localStorage.getItem("user"),
        },
        mode: 'no-cors' // Agrega esta opción
    })
    .then(response =>{
        return response.json();
    })
    .then(data => {
        data.forEach(imagenURL => {
            if(imagenURL.propiedad === producto){
                return imagenURL.otraPropiedad;
            }
        });
    })
    .catch(error => console.error("Error al obtener las imágenes:", error));
}


/********* listar calorias (Agregar sistema de colores) *********/

function listarCalorias() {
    let totalCalorias = 0;
    let totalCaloriasDelDia = 0;
    let fechaActual = new Date();
    listarRegistroAlimentos()
        .then(alimentos => {
            alimentos.forEach(alimento => {
                totalCalorias += Number(alimento.cantidad);
                let fechaRegistro = new Date(alimento.fecha);
                fechaRegistro.setMinutes(fechaRegistro.getMinutes() + fechaRegistro.getTimezoneOffset());
                if (fechaActual.getFullYear() == fechaRegistro.getFullYear() && fechaActual.getMonth() == fechaRegistro.getMonth()
                    && fechaActual.getDay() == fechaRegistro.getDay()) {
                    totalCaloriasDelDia += Number(alimento.cantidad);
                } 
            });
            document.querySelector("#txtTotalConsumidas").innerHTML = totalCalorias;
            let caloriasDelDia = document.querySelector("#txtTotalConsumidasDia");
            caloriasDelDia.innerHTML = totalCaloriasDelDia;
            caloriasDelDia.setAttribute("color", `${compararConRegistro(totalCaloriasDelDia)}`);
            //
        }).catch(error => console.error("Error listar las comidas Registrados:", error));   
}

function compararConRegistro(caloriasDia){
    let caloriasRegistro = localStorage.getItem("caloriasDiarias");
    if(caloriasDia > caloriasRegistro){
        return "danger";
    }else if(caloriasDia >= caloriasRegistro-(caloriasRegistro*0.10)){
        return "warning";
    }else{
        return "success";
    }
}

















