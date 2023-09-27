var tabla = document.getElementById('tabla-datos');
var maxFilas = 2; // Número máximo de filas a mostrar
var conta = 0;
var polyline; // Variable para almacenar la polilínea
var isDrawing = false; // Variable para verificar si se está dibujando

var map = L.map('map').setView([10.0, -74.0], 13);
map.setView([10.0, -74.0]);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Agrega un marcador inicial
var marker = L.marker([10.0, -74.0]).addTo(map);
marker.bindPopup("Marcador").openPopup();

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
    marker.bindPopup("Coordenadas: " + primeraParte + ", " + segundaParte).openPopup();

    // Agregar coordenadas a la polilínea si se está dibujando
    if (isDrawing) {
        polylineCoordinates.push([parseFloat(primeraParte), parseFloat(segundaParte)]);
        if (polyline) {
            map.removeLayer(polyline);
        }
        polyline = L.polyline(polylineCoordinates, { color: '#2f709f' }).addTo(map);
    }
};

// Función para activar o desactivar la polilínea
function togglePolyline() {
    isDrawing = !isDrawing;
    polylineCoordinates = [];

    if (!isDrawing) {
        if (polyline) {
            map.removeLayer(polyline);
        }
    }
}

// Agregar o quitar la polilínea cuando se hace clic en el botón
document.getElementById('marcar-button').addEventListener('click', function () {
    togglePolyline();
});

function validarFecha(fecha) {
    var fechaActual = new Date();
    var fechaSeleccionada = new Date(fecha);

    if (fechaSeleccionada >= fechaActual) {
        document.getElementById('mensaje-error').innerText = "La fechas deben ser menores que la fecha actual.";
        document.getElementById('mensaje-error').style.display = 'block';
        return false;
    } else if (fechaSeleccionada < new Date("2023-09-06")) {
        document.getElementById('mensaje-error').innerText = "No hay datos disponibles para fechas anteriores al 6 de septiembre de 2023.";
        document.getElementById('mensaje-error').style.display = 'block';
        return false;
    }
    return true;
}

function validarFechaM(fechaInicio, fechaFin) {
    FechaInicio=new Date(fechaInicio);
    FechaFin=new Date (fechaFin);
    if (FechaFin < FechaInicio) {
        document.getElementById('mensaje-error').innerText = "La fecha de fin no puede ser menor que la fecha de inicio.";
        document.getElementById('mensaje-error').style.display = 'block';
        return false;
    }
    return true;
}
function ValidarFechayHora(fechaInicio,fechaFin,horaInicio,horaFin) {
    FechaInicio=new Date(fechaInicio);
    FechaFin=new Date (fechaFin);
    if (FechaFin === FechaInicio) {
        if (horaInicio > horaFin){
            document.getElementById('mensaje-error').innerText = "La hora de fin no puede ser menor que la hora de inicio.";
            document.getElementById('mensaje-error').style.display = 'block';
            return false;
        }
        return true;
    }
    return true;
    
}



document.getElementById('buscar-button').addEventListener('click', function () {
    var fechaInicio = document.getElementById('fecha-inicio').value;
    var fechaFin = document.getElementById('fecha-fin').value;
    var horaInicio = document.getElementById('hora-inicio').value;
    var horaFin = document.getElementById('hora-fin').value;
    
    if (validarFechaM(fechaInicio,fechaFin) && validarFecha(fechaInicio) && validarFecha(fechaFin) && ValidarFechayHora(fechaInicio,fechaFin,horaInicio,horaFin)) {
        // Ocultar el mensaje de error si las fechas son válidas
        document.getElementById('mensaje-error').style.display = 'none';

        // Realiza la solicitud AJAX para buscar la ruta
        fetch('/buscar-ruta', {
            method: 'POST',
            body: new URLSearchParams({
                'fecha-inicio': fechaInicio,
                'fecha-fin': fechaFin,
                'hora-inicio': horaInicio,
                'hora-fin': horaFin
            }),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        })
        .then(response => response.json())
        .then(data => {
            // Limpia la polilínea existente en el mapa
            if (polyline) {
                map.removeLayer(polyline);
            }

            // Crea una nueva polilínea con las coordenadas obtenidas
            var ruta = data.map(coord => [coord.latitud, coord.longitud]);
            polyline = L.polyline(ruta, { color: 'blue' }).addTo(map);
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }
});
 // Simula un retraso de 3 segundos para la animación
 setTimeout(function() {
    var contenedorAnimacion = document.querySelector('.contenedor-animacion');
    var contenidoNormal = document.querySelector('.contenido-normal');

    contenedorAnimacion.style.opacity = '0';
    contenedorAnimacion.style.visibility = 'hidden';
    
}, 3000);