import React from "react";
import ChatBox from "components/ChatBox";
import UserListBox from "components/UserListBox";


function MainPage() {
  return (
    <div style={{ padding: '20px' }}>
      <ChatBox />
      <UserListBox />
    </div>
  );
}

export default MainPage;
