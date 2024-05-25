from flask import Flask, request, jsonify, send_from_directory
import openai
from dotenv import load_dotenv
from PyPDF2 import PdfReader
import os
import mysql.connector
from mysql.connector import Error
from llamaapi import LlamaAPI

load_dotenv()

app = Flask(__name__, static_folder='build', static_url_path='')

openai.api_key = os.getenv("OPENAI_API_KEY")
llama_api_key = os.getenv("LLAMA_API_KEY")
llama = LlamaAPI(llama_api_key)

default_model = "gpt-4"

db_config = {
    'user': os.getenv("DB_USER"),
    'password': os.getenv("DB_PASSWORD"),
    'host': os.getenv("DB_HOST"),
    'database': 'chatdb',
    'port': int(os.getenv("DB_PORT", 3306))
}

def read_pdf(file):
    pdf_reader = PdfReader(file)
    text = ''
    for page in pdf_reader.pages:
        text += page.extract_text()
    return text

def save_message(user_message, bot_response):
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO chat_history (user_message, bot_response) VALUES (%s, %s)",
            (user_message, bot_response)
        )
        conn.commit()
        cursor.close()
        conn.close()
        print("Message saved to database")
    except Error as e:
        print(f"Error saving message to database: {e}")

def get_chat_history():
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
        cursor.execute("SELECT user_message, bot_response, timestamp FROM chat_history ORDER BY timestamp")
        chat_history = cursor.fetchall()
        cursor.close()
        conn.close()
        print("Chat history fetched from database")
        return [{"user_message": row[0], "bot_response": row[1], "timestamp": row[2].strftime("%Y-%m-%d %H:%M:%S")} for row in chat_history]
    except Error as e:
        print(f"Error fetching chat history from database: {e}")
        return []

def clear_chat_history():
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
        cursor.execute("DELETE FROM chat_history")
        conn.commit()
        cursor.close()
        conn.close()
        print("Chat history cleared in database")
    except Error as e:
        print(f"Error clearing chat history in database: {e}")

@app.route('/chat', methods=['POST'])
def chat():
    try:
        data = request.form
        model_id = data.get('bot', default_model)
        message = data['message']
        file = request.files.get('file', None)

        if file:
            if file.content_type.startswith('image/'):
                response = openai.Image.create_variation(
                    image=file,
                    n=1,
                    size="1024x1024"
                )
                image_analysis = response['data'][0]['url']
                message = f"{message}\n\nImage analysis URL: {image_analysis}"
            else:
                file_text = read_pdf(file)
                message = f"{message}\n\nFile content:\n{file_text}"

        if model_id == 'llama':
            api_request_json = {
                "messages": [
                    {"role": "user", "content": message},
                ]
            }
            response = llama.run(api_request_json)
            response_data = response.json()
            bot_response = response_data['choices'][0]['message']['content']
        else:
            response = openai.ChatCompletion.create(
                model=model_id,
                messages=[{"role": "user", "content": message}]
            )
            bot_response = response.choices[0].message['content']

        save_message(message, bot_response)

        return jsonify({"message": bot_response})
    except Exception as e:
        print(f"Error in /chat: {str(e)}")
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
        print(f"Error in /upload: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/bots', methods=['GET'])
def get_bots():
    try:
        models = openai.Model.list()
        model_ids = [model['id'] for model in models['data']]
        return jsonify(model_ids)
    except Exception as e:
        print(f"Error in /bots: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/history', methods=['GET'])
def history():
    try:
        chat_history = get_chat_history()
        return jsonify(chat_history)
    except Exception as e:
        print(f"Error in /history: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/clear', methods=['POST'])
def clear():
    try:
        clear_chat_history()
        return jsonify({"message": "Chat history cleared"})
    except Exception as e:
        print(f"Error in /clear: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/test_save')
def test_save():
    try:
        save_message("Test user message", "Test bot response")
        return jsonify({"message": "Test save successful"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/test_get')
def test_get():
    try:
        chat_history = get_chat_history()
        return jsonify(chat_history)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/test_clear')
def test_clear():
    try:
        clear_chat_history()
        return jsonify({"message": "Test clear successful"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/')
def serve():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def serve_static_files(path):
    return send_from_directory(app.static_folder, path)

if __name__ == '__main__':
    app.run(debug=True)
