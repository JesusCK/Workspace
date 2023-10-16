var tabla = document.getElementById('tabla-datos');
var maxFilas = 2; // Número máximo de filas a mostrar
var conta = 0;
var polyline; // Variable para almacenar la polilínea
var isDrawing = true; // Variable para verificar si se está dibujando

var map = L.map('map').setView([10.0, -74.0], 13);
map.setView([10.0, -74.0]);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Agrega un marcador inicial
var marker = L.marker([10.0, -74.0]).addTo(map);


// Crear un arreglo para almacenar las coordenadas marcadas
var polylineCoordinates = [];

// Función para incrementar el contador
function incrementarContador() {
    conta++;
}

// Función para agregar una fila en la parte superior de la tabla
function agregarFilaEnLaParteSuperior(nombre, valor, estampa) {
    var fila = tabla.insertRow(1); // Insertar en la posición 1 (parte superior)
    var celdaNombre = fila.insertCell(0);
    var celdaValor = fila.insertCell(1);
    var celdaEstampa = fila.insertCell(2);
    celdaNombre.innerHTML = nombre;
    celdaValor.innerHTML = valor;
    celdaEstampa.innerHTML = estampa;

    // Verificar si hay más filas de las permitidas y borrar las más antiguas
    var filas = tabla.getElementsByTagName('tr');
    if (filas.length > maxFilas) {
        tabla.deleteRow(filas.length - 1); // Borrar la última fila (la más antigua)
    }
}

// Función para manejar eventos SSE
var source = new EventSource("/stream");

source.onmessage = function (event) {
    var nuevoDato = event.data;
    var partesDelMensaje = nuevoDato.split(',');
    var primeraParte = partesDelMensaje[0].trim();
    var segundaParte = partesDelMensaje[1].trim();
    var stamp = partesDelMensaje[2].trim();

    // Agregar la nueva fila en la parte superior
    agregarFilaEnLaParteSuperior(primeraParte, segundaParte, stamp);
    incrementarContador()
    var nuevasCoordenadas = [primeraParte, segundaParte]
    marker.setLatLng(nuevasCoordenadas).update();
    map.setView([primeraParte, segundaParte]);
    

    // Agregar coordenadas a la polilínea si se está dibujando
    if (isDrawing) {
        polylineCoordinates.push([parseFloat(primeraParte), parseFloat(segundaParte)]);
        if (polyline) {
            map.removeLayer(polyline);
        }
        polyline = L.polyline(polylineCoordinates, { color: '#4c2882', weight:5}).addTo(map);
    }
};

// Función para activar o desactivar la polilínea
function togglePolyline() {
    isDrawing = !isDrawing;
    polylineCoordinates = [];

    if (!isDrawing) {
        if (polyline) {
            map.removeLayer(polyline);
            isDrawing=!isDrawing
        }
    }
}

// Agregar o quitar la polilínea cuando se hace clic en el botón
document.getElementById('marcar-button').addEventListener('click', function () {
    togglePolyline();
});


 // Simula un retraso de 3 segundos para la animación
