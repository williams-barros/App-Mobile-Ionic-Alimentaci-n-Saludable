let currentPage = 1;
let rowsPerPage = 10;

// Función para mostrar los datos en la tabla según la página actual
function displayData(datos, alimentos) {
  document.querySelector("#containerListaRegistros").innerHTML = `
    <table id="tableListaDeComidas">
      <thead id="thead"></thead>
      <tbody id="tbody"></tbody>
    </table>
    <div class="pagination" id="pagination"></div>`
  if(datos.length !== 0){
    let start = (currentPage - 1) * rowsPerPage;
    let end = start + rowsPerPage;
    let dataToShow = datos.slice(start, end);
  
    document.getElementById("thead").innerHTML = `
    <tr>
      <th>Img</th>
      <th>Nombre</th>
      <th>Calorias</th>
      <th>Eliminar</th>
    </tr>`;
    let tableBody = document.getElementById("tbody");
    tableBody.innerHTML = "";
  
    dataToShow.forEach(function (item) {
      let alimento = getAlimentoById(item.idAlimento, alimentos)
      let nombre = alimento.nombre;
      let idIcono = alimento.imagen;
      var row = `<tr>
      <td><ion-img src = "https://calcount.develotion.com/imgs/${idIcono}.png" alt="Imagen de comida"></ion-img><td>${nombre}</td>
      </td><td>${item.cantidad}</td>
      <td><button class="btnTable" onclick="eliminarRegistro('${item.id}')">Eliminar</button></td>
      </tr>`;
      tableBody.innerHTML += row;
    });
  
    updatePagination(datos, alimentos);
  }else{
    document.querySelector("#containerListaRegistros").innerHTML += `<p class = "textoImportante titulos textDanger">No hay elementos para mostrar<p>`;
  }

}

// Función para actualizar la paginación
function updatePagination(datos, alimentos) {
  var totalPages = Math.ceil(datos.length / rowsPerPage);
  var pagination = document.getElementById("pagination");
  pagination.innerHTML = "";

  for (var i = 1; i <= totalPages; i++) {
    var button = document.createElement("button");
    button.innerText = i;
    button.addEventListener("click", function() {
      currentPage = parseInt(this.innerText);
      displayData(datos, alimentos);
    });
    if (i === currentPage) {
      button.classList.add("active");
    }
    pagination.appendChild(button);
  }
}

//Devuelve el alimento del array
function getAlimentoById(idAlimento, alimentos) { 
  return alimentos.find(alimento => alimento.id == idAlimento);
}
