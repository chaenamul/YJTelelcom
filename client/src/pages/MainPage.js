import React from "react";
import ChatBox from "components/ChatBox";
import UserListBox from "components/UserListBox";
import { Box } from "@mui/material";


function MainPage() {
  return (
    <Box sx={{ display: "flex", flexDirection: "row" }}>
      <ChatBox />
      <UserListBox />
    </Box>
  );
}

export default MainPage;
