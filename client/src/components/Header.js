import React from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "socket/socket";

function Header({ isConnected }) {
  const navigate = useNavigate();

  // socket
  function connect() {
    socket.connect();
  }

  function disconnect() {
    socket.disconnect();
  }

  return (
    <div style={{
      backgroundColor: 'lightgrey',
      padding: '20px',
      display: 'flex',
      justifyContent: 'space-between'
    }}>
      <div style={{ display: 'flex', gap: '10px' }}>
        <div onClick={() => navigate('/main')} style={{ cursor: 'pointer' }}>
          <h6>Main</h6>
        </div>
        <div onClick={() => navigate('/playground')} style={{ cursor: 'pointer' }}>
          <h6>Playground</h6>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          style={{
            backgroundColor: isConnected ? '#007bff' : 'white',
            color: isConnected ? 'white' : '#007bff',
            border: '1px solid #007bff',
            padding: '5px 10px',
            cursor: 'pointer'
          }}
          onClick={connect}
        >
          Connect
        </button>
        <button
          style={{
            backgroundColor: isConnected ? 'white' : '#007bff',
            color: isConnected ? '#007bff' : 'white',
            border: '1px solid #007bff',
            padding: '5px 10px',
            cursor: 'pointer'
          }}
          onClick={disconnect}
        >
          Disconnect
        </button>
      </div>
    </div>
  );
}

export default Header;
