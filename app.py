from flask import Flask, request, jsonify, render_template, redirect, url_for, session
import psycopg2
import os

app = Flask(__name__)
app.secret_key = 'your_secret_key'

DATABASE_URL = os.getenv('DATABASE_URL')

def get_user_position(username, password):
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()
    cur.execute("SELECT position FROM users WHERE username = %s AND password = %s", (username, password))
    user = cur.fetchone()
    cur.close()
    conn.close()
    return user[0] if user else None

def save_message_to_db(room, username, position, message):
    if not message.strip():
        return  # Do not save empty messages
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()
    table_name = f"room{room}" if room.isdigit() else room
    room_id = 1 if room == 'room1' else 2
    cur.execute(f"SELECT id FROM {table_name} WHERE username = %s ORDER BY id DESC LIMIT 1", (username,))
    existing_message = cur.fetchone()
    if existing_message:
        cur.execute(f"UPDATE {table_name} SET message = %s WHERE id = %s", (message, existing_message[0]))
    else:
        cur.execute(f"INSERT INTO {table_name} (username, position, message, room_id) VALUES (%s, %s, %s, %s)", (username, position, message, room_id))
    conn.commit()
    cur.close()
    conn.close()

def get_messages_from_db(room):
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()
    table_name = f"room{room}" if room.isdigit() else room
    cur.execute(f"SELECT username, message, position FROM {table_name} ORDER BY id ASC")
    messages = cur.fetchall()
    cur.close()
    conn.close()
    return messages

def get_teacher_messages_from_db(room):
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()
    table_name = f"room{room}" if room.isdigit() else room
    cur.execute(f"SELECT username, message FROM {table_name} WHERE position = 'teacher' ORDER BY id ASC")
    messages = cur.fetchall()
    cur.close()
    conn.close()
    return messages

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/check_user', methods=['POST'])
def check_user():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    room = data.get('room')
    position = get_user_position(username, password)
    if position:
        session['username'] = username
        session['position'] = position
        session['room'] = room
        if position == 'teacher':
            return jsonify({"redirect": url_for('teacher', username=username, position=position, room=room)})
        elif position == 'student':
            return jsonify({"redirect": url_for('student', username=username, position=position, room=room)})
    else:
        return jsonify({"message": "Invalid credentials"}), 401

@app.route('/send_message', methods=['POST'])
def send_message():
    data = request.json
    message = data.get('message')
    username = data.get('username')
    position = data.get('position')
    room = data.get('room')
    if message and username and position and room:
        save_message_to_db(room, username, position, message)
        return jsonify({"status": "success"})
    return jsonify({"status": "error"}), 400

@app.route('/get_messages', methods=['GET'])
def get_messages():
    room = request.args.get('room')
    if room:
        messages = get_messages_from_db(room)
        return jsonify({"messages": messages})
    return jsonify({"status": "error"}), 400

@app.route('/get_teacher_messages', methods=['GET'])
def get_teacher_messages():
    room = request.args.get('room')
    if room:
        messages = get_teacher_messages_from_db(room)
        return jsonify({"messages": messages})
    return jsonify({"status": "error"}), 400

@app.route('/teacher/<username>/<position>/<room>')
def teacher(username, position, room):
    return render_template('teacher.html', username=username, position=position, room=room)

@app.route('/student/<username>/<position>/<room>')
def student(username, position, room):
    return render_template('student.html', username=username, position=position, room=room)

if __name__ == '__main__':
    app.run(debug=True)
