import { io } from 'socket.io-client';

const URL = process.env.NODE_ENV === 'production' ? undefined : 'http://localhost:8000';
// const URL = process.env.REACT_APP_SOCKET_URL;

export const socket = io(URL, {
  autoConnect: false
});

export const Event = Object.freeze({
  SEND_MESSAGE: "send_message",
  RECEIVE_MESSAGE: "receive_message",
  CHANGE_USERNAME: "change_username"
});