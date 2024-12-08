import DummySettings from "components/DummySettings";
import React, { useState, useEffect } from "react";
import { Box } from "@mui/material";
import { socket } from "socket/socket";


function SettingsPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {

      socket.on("check_admin", (data) => {
        setIsAdmin(data.isAdmin)
      })
      
      if(socket)
        socket.emit("check_admin")

      // Clean up listeners on unmount
      return () => {
          socket.off("check_admin");
      };
  }, []);
  
  return (
    <Box>
      {isAdmin ? <DummySettings /> : <Box>Access denied</Box>}
    </Box>
  );
}

export default SettingsPage;
