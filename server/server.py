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

# 각 방에 있는 user들을 저장하는 set
room_users = {
    "room0": set(),
    "room1": set(),
    "room2": set(),
}

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
    try:
        # 방 정보 가져오기
        rooms = settings.get("rooms", {})
        if not rooms:
            return "room0"  # 방 정보가 없으면 기본 방 반환

        # IP 범위 확인
        for room_name, room_data in rooms.items():
            least_ip = ipaddress.ip_address(room_data["least"])  # 최소 IP
            greatest_ip = ipaddress.ip_address(room_data["greatest"])  # 최대 IP
            current_ip = ipaddress.ip_address(ip_address)  # 현재 IP

            if least_ip <= current_ip <= greatest_ip:
                # 일단 비활성화. 유사시 복구
                # if room_name not in room_users:
                #     room_users[room_name] = set()
                #     print("room_users: ", room_users)
                return room_name  # 범위에 맞는 방 이름 반환

        return "room0"  # 범위에 맞는 방이 없을 경우 기본 방 반환
    except Exception as e:
        print(f"Error in assign_room: {str(e)}")
        return "room0"  # 에러 시 기본 방 반환

# Socket.IO connection event
@sio.event
async def connect(sid, environ):
    ip_address = environ.get("REMOTE_ADDR")  # Extract client's IP address
    username = generate_username()  # Generate a random username
    # initialize sid session
    await sio.save_session(sid, {"username": username, "ip_address": ip_address})

    user_list[sid] = username  # Store the username with sid
    room = assign_room(ip_address)  # Determine room based on IP
    print('connected from: ' + ip_address + ' to ' + room)

    # Make sure the user joins the room
    await change_room(sid, room)

    # 사용자들에게 업데이트 된 사용자 목록 전송
    await update_user_list(room)

    # Send the username to client (initial nickname)
    await sio.emit('set_username', {'username': username}, room=sid)

# Handle username change


@sio.event
async def change_username(sid, new_username):
    session = await sio.get_session(sid)
    session.update({"username": new_username})
    sio.save_session(sid, session)
    if sid in user_list:
        user_list[sid] = new_username  # Update the username in the user_list
        room = session.get("room")
        if room:
            await update_user_list(room)  # 업데이트된 사용자 목록 전송
# Handle incoming messages

# 특정 room에 있는 username을 알려줍니다.

# 연결이 끊어진 경우 실헹
@sio.event
async def disconnect(sid):
    # 사용자의 room 정보 확인
    session = await sio.get_session(sid)
    room = session.get("room")

    # room = None
    # for r in sio.rooms(sid):
    #     if r != sid: 
    #         room = r
    #         break

    if room:
        room_users[room].discard(sid)
        await update_user_list(room)

    if sid in user_list:
        del user_list[sid]

    print(f"Disconnected: {sid}, removed from room: {room}")


@sio.event
async def update_user_list(room):
    usernames = [user_list[sid] for sid in room_users[room] if sid in user_list]
    print(room_users)
    await sio.emit('update_user_list', {'users': usernames}, room=room)

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
        room_users.clear()
        room_users["room0"] = set()
        for room_name in rooms:
            room_users[room_name] = set()
        # 사용자 재할당을 진행합니다.
        await reassign_users()
        print(f"Room settings updated by {sid}: {rooms}")
        return {"status": "success", "rooms": rooms}
    except Exception as e:
        print(f"Error updating room settings: {str(e)}")
        return {"status": "error", "message": str(e)}
    

@sio.event
async def get_settings(sid):
    print(f"Settings data sent by {sid}")
    await sio.emit("receive_settings", {"status": "success", "settings": settings}, room=sid)
    

async def change_room(sid, new_room):
    session = await sio.get_session(sid)
    prev_room = session.get("room")

    if prev_room:
        await sio.leave_room(sid, prev_room)
        room_users[prev_room].discard(sid)

    await sio.enter_room(sid, new_room)
    room_users[new_room].add(sid)

    session.update({"room": new_room})
    await sio.save_session(sid, session)


async def reassign_users():
    for sid in user_list:
        session = await sio.get_session(sid)
        #사용지의 ip 주소를 확인합니다.
        ip_address = session.get('ip_address')
        if ip_address:
            # assign room을 활용하여 새로운 방을 할당합니다
            new_room = assign_room(ip_address)
            await change_room(sid, new_room)
        else:
            print(f"No IP address found for sid {sid}")

    # 업데이트된 room_user 정보를 전송합니다. -> 프론트 로직에 따라
    # 변경이 필요할 수 있을 것 같습니다.

    for room in room_users:
        await update_user_list(room)

# Start ASGI app
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(sio_app, host="localhost", port=8000)
