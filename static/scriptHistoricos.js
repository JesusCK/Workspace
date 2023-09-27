var map = L.map('map').setView([10.0, -74.0], 5);
map.setView([10.0, -74.0]);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);
var polyline; // Variable para almacenar la polilínea

const arrayDate = []

function ValidationDate(fechaInicio,fechaFin,horaInicio,horaFin){
    var fechaActual = new Date();
    var fechaSeleccionada = new Date(fechaInicio);
    var FechaInicio=new Date(fechaInicio);
    var FechaFin=new Date (fechaFin);
    var horaInicialObj = new Date("2000-01-01T" + horaInicio);
    var horaFinalObj = new Date("2000-01-01T" + horaFin);
    var fechaInicialObj = new Date(fechaInicio);
    var fechaFinalObj = new Date(fechaFin);

    if (fechaSeleccionada >= fechaActual) {
        document.getElementById('mensaje-error').innerText = "La fechas deben ser menores que la fecha actual.";
        document.getElementById('mensaje-error').style.display = 'block';
        return false;
    } else if (fechaSeleccionada < new Date("2023-09-06")) {
        document.getElementById('mensaje-error').innerText = "No hay datos disponibles para fechas anteriores al 6 de septiembre de 2023.";
        document.getElementById('mensaje-error').style.display = 'block';
        return false;
    } else if (FechaFin < FechaInicio) {
        document.getElementById('mensaje-error').innerText = "La fecha de fin no puede ser menor que la fecha de inicio.";
        document.getElementById('mensaje-error').style.display = 'block';
        return false;
    } else if ((horaFin === "" ) || (horaInicio === "" )){
        document.getElementById('mensaje-error').innerText = "Digite un rango de horas.";
        document.getElementById('mensaje-error').style.display = 'block';
        return false;
    }else if (fechaInicialObj.getTime() === fechaFinalObj.getTime()) {
        // Verificar si la hora inicial es mayor que la hora final
        if (horaInicialObj.getTime() > horaFinalObj.getTime()) {
            // Mostrar un mensaje de error en la página
            document.getElementById('mensaje-error').textContent = "La hora inicial no puede ser mayor que la hora final en la misma fecha.";
            document.getElementById('mensaje-error').style.display = 'block';
            return false;
        } 
    }
    return true;
    

}



document.getElementById('buscar-button').addEventListener('click', function () {
    var fechaInicio = document.getElementById('fecha-inicio').value;
    var fechaFin = document.getElementById('fecha-fin').value;
    var horaInicio = document.getElementById('hora-inicio').value;
    var horaFin = document.getElementById('hora-fin').value;
    
    if (ValidationDate(fechaInicio,fechaFin,horaInicio,horaFin)) {
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
            polyline = L.polyline(ruta, { color: '#2f709f' }).addTo(map);
            map.fitBounds(polyline.getBounds());
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }
});

var circle = null;
var selectedPoint = null; // Variable para almacenar el punto seleccionado
var marker = L.marker([0, 0]).addTo(map); 
// Agrega un controlador de eventos al mapa para capturar las coordenadas cuando el usuario haga clic
map.on('click', function (e) {
// Captura las coordenadas del punto seleccionado
selectedPoint = e.latlng; // e.latlng contiene latitud y longitud
var nuevasCoordenadas = [selectedPoint.lat, selectedPoint.lng]
marker.setLatLng(nuevasCoordenadas).update();
if (circle) {
    map.removeLayer(circle);
}
var radioEnMetros = 100;

circle = L.circle(e.latlng, {
    radius: radioEnMetros,
    color: 'blue', // Color del borde del círculo
    fillColor: 'blue', // Color de relleno del círculo
    fillOpacity: 0.2 // Opacidad del relleno
}).addTo(map);

circle.bringToBack();

// Muestra las coordenadas en la consola para verificar
console.log('Punto seleccionado:', selectedPoint);

// Llama a la función para buscar fechas cuando se seleccione un punto
buscarFechasPunto(selectedPoint);
buscarLocalizacionPunto(selectedPoint);
});

// Función para buscar fechas en el servidor y mostrarlas
function buscarFechasPunto(coordenadas) {
// Realiza una solicitud AJAX para buscar las fechas
fetch('/buscar-fechas-punto', {
    method: 'POST',
    body: new URLSearchParams({
        'latitud': coordenadas.lat,
        'longitud': coordenadas.lng
    }),
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
    }
})
.then(response => response.json())
.then(data => {
    // Comprueba si se encontraron fechas
    if (data.length > 0) {
        // Muestra las fechas en la página de manera creativa
        arrayDate.splice(0, arrayDate.length);
        for (let i = 0; i < data.length; i++) {
             arrayDate[i] = data[i];
        };
        ocultarMensajeSinFechas();
    } else {
        // Muestra un mensaje indicando que no se encontraron fechas
        mostrarMensajeSinFechas();
    }
})
.catch(error => {
    console.error('Error:', error);
});
}

function buscarLocalizacionPunto(coordenadas) {
    // Realiza una solicitud AJAX para buscar las fechas
    fetch('/buscar-localizacion-punto', {
        method: 'POST',
        body: new URLSearchParams({
            'latitud': coordenadas.lat,
            'longitud': coordenadas.lng
        }),
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    })
    .then(response => response.json())
    .then(data => {
        // Comprueba si se encontraron fechas
        if (data.length > 0) {
            
            const coordenadasArray = [data[0].Latitud, data[0].Longitud];
        
        } else {
            // Muestra un mensaje indicando que no se encontraron fechas
            
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

// Función para mostrar un mensaje en la página cuando no se encuentren fechas
function mostrarMensajeSinFechas() {
var mensajeSinFechas = document.getElementById('mensaje-sin-fechas');
mensajeSinFechas.style.display = 'block';

}
function ocultarMensajeSinFechas() {
var mensajeSinFechas = document.getElementById('mensaje-sin-fechas');
mensajeSinFechas.style.display = 'none';
}



document.addEventListener("DOMContentLoaded", function () {
    const myRange = document.getElementById("myRange");
    const valorSeleccionado = document.getElementById("valor-seleccionado");
    
    // Agrega un event listener para detectar cambios en el slider
    myRange.addEventListener("input", function () {
        myRange.max = arrayDate.length + 2;
        const indice = parseInt(myRange.value);
        valorSeleccionado.textContent = `Fecha: ${JSON.stringify(arrayDate[indice].fecha[0])}`;
    });
});