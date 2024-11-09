import random
import string
import socketio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Create FastAPI app and Socket.IO server
app = FastAPI()
sio = socketio.AsyncServer(
    async_mode='asgi', cors_allowed_origins="*")  # CORS 설정
sio_app = socketio.ASGIApp(sio, app)

# Allow CORS from React client
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # React client origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Object to store user information, mapping sid to username
user_list = {}

# Function to generate a random username


def generate_username():
    return 'user_' + ''.join(random.choices(string.ascii_lowercase + string.digits, k=6))

# Function to assign a room based on IP address


def assign_room(ip_address: str) -> str:
    # Extract the 4th octet of the IP address and assign the room accordingly
    try:
        ip_parts = ip_address.split(".")
        fourth_octet = int(ip_parts[3])
        if 0 <= fourth_octet <= 127:
            return "room1"
        elif 128 <= fourth_octet <= 255:
            return "room2"
        else:
            return "room1"  # Default to room1 if something goes wrong
    except Exception as e:
        return "room1"  # Default to room1 in case of any error

# Socket.IO connection event


@sio.event
async def connect(sid, environ):
    ip_address = environ.get("REMOTE_ADDR")  # Extract client's IP address
    username = generate_username()  # Generate a random username
    room = assign_room(ip_address)  # Determine room based on IP
    print('connected from: ' + ip_address + ' to ' + room)
    user_list[sid] = username  # Store the username with sid

    # Make sure the user joins the room
    await sio.enter_room(sid, room)

    # Send the username to client (initial nickname)
    await sio.emit('set_username', {'username': username}, room=sid)

# Handle username change


@sio.event
async def change_username(sid, new_username):
    if sid in user_list:
        user_list[sid] = new_username  # Update the username in the user_list
        await sio.emit('username_changed', {'username': new_username}, room=sid)

# Handle incoming messages


@sio.event
async def send_message(sid, message):
    if sid in user_list:
        username = user_list[sid]  # Get the username from the user_list
        # Get the room the user is currently in
        room = None
        for r in sio.rooms(sid):
            if r != sid:  # Exclude the sid itself, it's not a room
                room = r
                break

        if room:
            # Broadcast the message to everyone in the room (except sender)
            await sio.emit('receive_message', {'text': message, 'sender': username}, room=room, skip_sid=sid)
            await sio.emit('receive_message', {'text': message, 'sender': 'You'}, room=sid)

# Start ASGI app
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(sio_app, host="localhost", port=8000)
