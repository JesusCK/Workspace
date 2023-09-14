from flask import Flask, render_template,request, Response, jsonify
import time
import mysql.connector
from config import db_config








app = Flask(__name__)

@app.route('/')
def index():
    return render_template('PRUEBA2.html')



def enviar_datos():

    while True:
        conexion = mysql.connector.connect(**db_config)

        cursor = conexion.cursor()
        # Ejecuta una consulta SQL para obtener el último dato agregado
        cursor.execute("SELECT Latitud, Longitud, Estampa_de_tiempo FROM gps ORDER BY id DESC LIMIT 1")

        # Recupera el último dato agregado en ambas columnas
        ultima_fila = cursor.fetchone()

        # Imprime el resultado (esto puede variar dependiendo de tus columnas)
        #print("Último dato en columna1:", ultima_fila[0])
        #print("Último dato en columna2:", ultima_fila[1])
        #print("Último dato en columna3:", ultima_fila[2])
        
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
        

        
@app.route('/stream')
def stream():
    return Response(enviar_datos(), content_type='text/event-stream')

if __name__ == '__main__':
    app.run( debug=True ,port=80)
