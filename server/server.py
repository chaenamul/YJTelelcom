import random
import string
import socketio
import ipaddress
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
ip_username_map = {
}
# TODO:
# use this for settings
settings = {
    "rooms": {
        "room1": {
            "least": "192.168.0.0",
            "greatest": "192.168.0.100"
        },
        "room2": {
            "least": "192.168.0.101",
            "greatest": "192.168.0.255"
        }
    }
}

# Function to generate a random username


def generate_username():
    return 'user_' + ''.join(random.choices(string.ascii_lowercase + string.digits, k=6))

# Function to assign a room based on IP address


def assign_room(ip_address: str) -> str:
    # Extract the 4th octet of the IP address and assign the room accordingly
    # try:
    #     ip_parts = ip_address.split(".")
    #     fourth_octet = int(ip_parts[3])
    #     if 0 <= fourth_octet <= 127:
    #         return "room1"
    #     elif 128 <= fourth_octet <= 255:
    #         return "room2"
    #     else:
    #         return "room1"  # Default to room1 if something goes wrong
    # except Exception as e:
    #     return "room1"  # Default to room1 in case of any error
    try:
        # 방 정보 가져오기
        rooms = settings.get("rooms", {})
        if not rooms:
            return "default-room"  # 방 정보가 없으면 기본 방 반환

        # IP 범위 확인
        for room_name, room_data in rooms.items():
            least_ip = ipaddress.ip_address(room_data["least"])  # 최소 IP
            greatest_ip = ipaddress.ip_address(room_data["greatest"])  # 최대 IP
            current_ip = ipaddress.ip_address(ip_address)  # 현재 IP

            if least_ip <= current_ip <= greatest_ip:
                return room_name  # 범위에 맞는 방 이름 반환

        return "default-room"  # 범위에 맞는 방이 없을 경우 기본 방 반환
    except Exception as e:
        print(f"Error in assign_room: {str(e)}")
        return "default-room"  # 에러 시 기본 방 반환

# Socket.IO connection event

def new_assign_room():
    # implement here
    return "room1"

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

# Handle room data update from client
@sio.event
async def update_settings(sid, rooms: dict):
    try:
        if not isinstance(rooms, dict):
            raise ValueError("Invalid data format. Expected a dictionary.")

        settings["rooms"] = rooms
        print(f"Room settings updated by {sid}: {rooms}")
        return {"status": "success", "rooms": rooms}
    except Exception as e:
        print(f"Error updating room settings: {str(e)}")
        return {"status": "error", "message": str(e)}


@sio.event
async def get_settings(sid):
    print(f"Settings data sent by {sid}")
    await sio.emit("receive_settings", {"status": "success", "settings": settings}, room=sid)
    

# Start ASGI app
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(sio_app, host="localhost", port=8000)
