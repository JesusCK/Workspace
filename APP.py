from flask import Flask, render_template,request, Response, jsonify
import time
import mysql.connector
from config import db_config
from hostcd import ht_config


app = Flask(__name__)

@app.route('/')
def index():
    return render_template('InicioWP.html')

@app.route('/tiempo-real')
def index1():
    return render_template('PRUEBA2.html')

@app.route('/historicos')
def index2():
    return render_template('historicos.html')

def enviar_datos():

    while True:
        conexion = mysql.connector.connect(**db_config)

        cursor = conexion.cursor()
        # Ejecuta una consulta SQL para obtener el último dato agregado
        cursor.execute("SELECT Latitud, Longitud, Estampa_de_tiempo FROM gps ORDER BY id DESC LIMIT 1")

        # Recupera el último dato agregado en ambas columnas
        ultima_fila = cursor.fetchone()

        
        nuevo_dato = f'{ultima_fila[0]}, {ultima_fila[1]},{ultima_fila[2]}'  # Datos enviados
        yield f'data: {nuevo_dato}\n\n'
        time.sleep(1)  # Controla la frecuencia de envío de datos
        conexion.close()
        stream()

@app.route('/buscar-ruta', methods=['POST'])
def buscar_ruta():
    fecha_inicio = request.form['fecha-inicio']
    fecha_fin = request.form['fecha-fin']
    hora_inicio = request.form['hora-inicio']
    hora_fin = request.form['hora-fin']
    
    # Convierte las fechas y horas a un formato compatible con la base de datos
    fecha_hora_inicio = f'{fecha_inicio} {hora_inicio}:00'
    fecha_hora_fin = f'{fecha_fin} {hora_fin}:00'
    
    # Realiza una consulta SQL para obtener las coordenadas dentro del rango de fecha y hora
    conexion = mysql.connector.connect(**db_config)
    cursor = conexion.cursor()
    consulta = ("SELECT Latitud, Longitud FROM gps "
                "WHERE Estampa_de_tiempo >= %s AND Estampa_de_tiempo <= %s")
    cursor.execute(consulta, (fecha_hora_inicio, fecha_hora_fin))
    coordenadas = cursor.fetchall()
    conexion.close()
    
    # Prepara las coordenadas para enviarlas al frontend
    coordenadas_json = [{'latitud': lat, 'longitud': lon} for lat, lon in coordenadas]
    
    return jsonify(coordenadas_json)

import math

from flask import jsonify

@app.route('/buscar-fechas-punto', methods=['POST'])
def buscar_fechas_punto():
    latitud_deseada = request.form['latitud']
    longitud_deseada = request.form['longitud']
    radio_km = request.form['radio']  # Puedes ajustar el radio deseado en kilómetros aquí
    fecha_inicio = request.form['fecha-inicio']
    fecha_fin = request.form['fecha-fin']
    hora_inicio = request.form['hora-inicio']
    hora_fin = request.form['hora-fin']
    
    # Convierte las fechas y horas a un formato compatible con la base de datos
    fecha_hora_inicio = f'{fecha_inicio} {hora_inicio}:00'
    fecha_hora_fin = f'{fecha_fin} {hora_fin}:00'
    
    # Realiza una consulta SQL para obtener las fechas en las que se pasó por el punto dentro del radio
    conexion = mysql.connector.connect(**db_config)
    cursor = conexion.cursor()

    # Construye la consulta SQL con la fórmula de distancia haversine y el rango de fechas
    consulta = (
        "SELECT Estampa_de_tiempo, Latitud, Longitud FROM gps WHERE "
        "((6371 * ACOS("
        "COS(RADIANS(%s)) * COS(RADIANS(Latitud)) * COS(RADIANS(Longitud) - RADIANS(%s)) + "
        "SIN(RADIANS(%s)) * SIN(RADIANS(Latitud))"
        ")) <= %s) AND (Estampa_de_tiempo BETWEEN %s AND %s)"
    )

    # Ejecuta la consulta con los parámetros
    cursor.execute(consulta, (latitud_deseada, longitud_deseada, latitud_deseada, radio_km, fecha_hora_inicio, fecha_hora_fin))

    coordenadas = cursor.fetchall()

    conexion.close()

    # En lugar de retornar fechas como JSON, crea un diccionario con las fechas
    # Esto es importante porque jsonify espera un diccionario
    response_data = [{'fecha': fecha, 'Latitud': lat , 'Longitud': lon} for fecha, lat, lon in coordenadas]
    print(response_data)

    return jsonify(response_data)


        

        
@app.route('/stream')
def stream():
    return Response(enviar_datos(), content_type='text/event-stream')

if __name__ == '__main__':
    app.run(**ht_config)
