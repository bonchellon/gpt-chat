from flask import Flask, request, jsonify, send_from_directory
import openai
from dotenv import load_dotenv
from PyPDF2 import PdfReader
import os
import mysql.connector

load_dotenv()  # Загружаем переменные окружения

app = Flask(__name__, static_folder='build', static_url_path='')

# Инициализируем OpenAI API ключ из переменных окружения
openai.api_key = os.getenv("OPENAI_API_KEY")

# Установим модель по умолчанию на GPT-4
default_model = "gpt-4"

# Настройка подключения к MySQL
db_config = {
    'user': os.getenv("DB_USER"),
    'password': os.getenv("DB_PASSWORD"),
    'host': os.getenv("DB_HOST"),
    'database': 'chatdb',
    'port': int(os.getenv("DB_PORT", 3306))  # Добавляем порт, по умолчанию 3306
}

def read_pdf(file):
    pdf_reader = PdfReader(file)
    text = ''
    for page in pdf_reader.pages:
        text += page.extract_text()
    return text

def save_message(user_message, bot_response):
    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO chat_history (user_message, bot_response) VALUES (%s, %s)",
        (user_message, bot_response)
    )
    conn.commit()
    cursor.close()
    conn.close()

def get_chat_history():
    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor()
    cursor.execute("SELECT user_message, bot_response, timestamp FROM chat_history ORDER BY timestamp")
    chat_history = cursor.fetchall()
    cursor.close()
    conn.close()
    return [{"user_message": row[0], "bot_response": row[1], "timestamp": row[2].strftime("%Y-%m-%d %H:%M:%S")} for row in chat_history]

def clear_chat_history():
    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor()
    cursor.execute("DELETE FROM chat_history")
    conn.commit()
    cursor.close()
    conn.close()

@app.route('/chat', methods=['POST'])
def chat():
    try:
        data = request.form
        model_id = data.get('bot', default_model)  # Используем модель по умолчанию, если не указано
        message = data['message']
        file = request.files.get('file', None)

        if file:
            if file.content_type.startswith('image/'):
                # Для изображений используем OpenAI API для анализа изображений
                response = openai.Image.create_variation(
                    image=file,
                    n=1,
                    size="1024x1024"
                )
                image_analysis = response['data'][0]['url']
                message = f"{message}\n\nImage analysis URL: {image_analysis}"
            else:
                # Для PDF файлов
                file_text = read_pdf(file)
                message = f"{message}\n\nFile content:\n{file_text}"

        response = openai.ChatCompletion.create(
            model=model_id,
            messages=[{"role": "user", "content": message}]
        )

        bot_response = response.choices[0].message['content']
        save_message(message, bot_response)

        return jsonify({"message": bot_response})
    except Exception as e:
        print(f"Error in /chat: {str(e)}")  # Логирование ошибки
        return jsonify({"error": str(e)}), 500

@app.route('/upload', methods=['POST'])
def upload():
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file part"}), 400
        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "No selected file"}), 400
        if file.content_type.startswith('image/'):
            return jsonify({"text": "Image uploaded successfully"})
        else:
            text = read_pdf(file)
            return jsonify({"text": text})
    except Exception as e:
        print(f"Error in /upload: {str(e)}")  # Логирование ошибки
        return jsonify({"error": str(e)}), 500

@app.route('/bots', methods=['GET'])
def get_bots():
    try:
        models = openai.Model.list()  # Получаем список всех моделей
        model_ids = [model['id'] for model in models['data']]  # Создаем список идентификаторов моделей
        return jsonify(model_ids)
    except Exception as e:
        print(f"Error in /bots: {str(e)}")  # Логирование ошибки
        return jsonify({"error": str(e)}), 500

@app.route('/history', methods=['GET'])
def history():
    try:
        chat_history = get_chat_history()
        return jsonify(chat_history)
    except Exception as e:
        print(f"Error in /history: {str(e)}")  # Логирование ошибки
        return jsonify({"error": str(e)}), 500

@app.route('/clear', methods=['POST'])
def clear():
    try:
        clear_chat_history()
        return jsonify({"message": "Chat history cleared"})
    except Exception as e:
        print(f"Error in /clear: {str(e)}")  # Логирование ошибки
        return jsonify({"error": str(e)}), 500

@app.route('/')
def serve():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def serve_static_files(path):
    return send_from_directory(app.static_folder, path)

if __name__ == '__main__':
    app.run(debug=True)
