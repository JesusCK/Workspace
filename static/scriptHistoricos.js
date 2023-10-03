var map = L.map('map').setView([10.96508884429932, -74.83829498291016], 12);
map.setView([10.96508884429932, -74.83829498291016]);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);
var polyline; // Variable para almacenar la polilínea
ocultarSlider()
const arrayDate = [];
const latitudArray = [];
const longitudArray = [];

function ValidationDate(fechaInicio,fechaFin,horaInicio,horaFin){
    var fechaActual = new Date();
    var fechaSeleccionada = new Date(fechaInicio);
    var fechaSeleccionada2 = new Date(fechaFin);
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
    }else if (fechaSeleccionada2 >= fechaActual) {
        document.getElementById('mensaje-error').innerText = "La fechas deben ser menores que la fecha actual.";
        document.getElementById('mensaje-error').style.display = 'block';
        return false;
    }else if (FechaFin < FechaInicio) {
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
        FI=new Date(fechaInicio);
        if (FI < new Date("2023-09-06")){
            fechaInicio="2023-09-06";
            document.getElementById('mensaje-error').innerText = "No hay datos disponibles para fechas anteriores al 6 de septiembre de 2023.";
            document.getElementById('mensaje-error').style.display = 'block';
        }

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
var marcadorActual = null; 
// Agrega un controlador de eventos al mapa para capturar las coordenadas cuando el usuario haga clic
map.on('click', function (e) {
// Captura las coordenadas del punto seleccionado
selectedPoint = e.latlng; // e.latlng contiene latitud y longitud
//var nuevasCoordenadas = [selectedPoint.lat, selectedPoint.lng]
//marker.setLatLng(nuevasCoordenadas).update();
if (circle) {
    map.removeLayer(circle);
}
if (marcadorActual) {
    map.removeLayer(marcadorActual);
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
        arrayDate.splice(0, data.length);
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
        latitudArray.splice(0, data.length)
        longitudArray.splice(0, data.length)
        if (data.length > 0) {
            reinicializarSlider()
            mostrarSlider()
            for (let i = 0; i < data.length; i++) {
                latitudArray[i]= parseFloat(data[i].Latitud);
                longitudArray[i]= parseFloat(data[i].Longitud);

            };
            
        } else {
            ocultarSlider()
            if (marcadorActual) {
                map.removeLayer(marcadorActual);
            }
            

            latitudArray.splice(0, data.length)
            longitudArray.splice(0, data.length)
         
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

const customIcon = L.divIcon({
    className: 'custom-marker',
    // Otras opciones de estilo si es necesario
    iconSize: [32, 32], // Tamaño del icono [ancho, alto]
    iconAnchor: [16, 32], // Anclaje del icono [horizontal, vertical]
    popupAnchor: [0, -32] // Posición de la punta del icono en relación con su punto de anclaje
});

function actualizarMarcador(indice) {

    if (marcadorActual) {
        map.removeLayer(marcadorActual);
    }

    // Crear un nuevo marcador y asignarlo a la variable marcadorActual
    marcadorActual = L.marker([latitudArray[indice],longitudArray[indice]], { icon: customIcon }).addTo(map);
    
}


function reinicializarSlider() {
    const myRange = document.getElementById("myRange");
    const valorSeleccionado = document.getElementById("valor-seleccionado");
    
    // Configura los valores del slider y muestra los elementos
    myRange.value = 0; // Reinicializa el valor del slider
    myRange.max = arrayDate.length + 2;
    myRange.style.display = "block";
    valorSeleccionado.style.display = "block";

    // Agrega un event listener para detectar cambios en el slider
    myRange.addEventListener("input", function () {
        const indice = parseInt(myRange.value);
        valorSeleccionado.textContent = `Fecha: ${JSON.stringify(arrayDate[indice].fecha[0])}`;
        actualizarMarcador(indice);
    });
}

// Llama a reinicializarSlider() cuando se cumpla la condición deseada



function ocultarSlider() {
    const myRange = document.getElementById("myRange");
    const valorSeleccionado = document.getElementById("valor-seleccionado");

    // Oculta el slider y el valor seleccionado
    myRange.style.display = "none";
    valorSeleccionado.style.display = "none";
}
function mostrarSlider() {
    const myRange = document.getElementById("myRange");
    const valorSeleccionado = document.getElementById("valor-seleccionado");

    // Establece el estilo de visualización de nuevo a "block" para mostrar el slider y el valor seleccionado
    myRange.style.display = "block";
    valorSeleccionado.style.display = "block";
}