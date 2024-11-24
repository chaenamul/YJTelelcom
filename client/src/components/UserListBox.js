import React, { useState, useEffect } from 'react';
import { socket } from 'socket/socket';

const UserListBox = () => {
  // Implement Here
  const [username, setUsername] = useState("");
  const [userList, setUserList] = useState([]);
  
  return (
    // and Here
    <div>
      <h2>User List</h2>
      <div
        style={{
          width: '20%',
          height: '40vh',
          float: 'right',
          border: "1px solid #ccc",
          padding: "10px",
          boxSizing: 'border-box',
          //overflowY: 'scroll',
        }}
      >
        <ul style={{ listStyleType: "none", padding: 0 }}>
          {userList.map((user, index) => (
            <li key={index} style={{ marginBottom: "5px" }}>
              {user}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default UserListBox;
