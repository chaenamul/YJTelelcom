import React from "react";
import ChatBox from "components/ChatBox";
import UserListBox from "components/UserListBox";
import { Box, Grid } from "@mui/material";

function MainPage() {
  return (
    <Box sx={{ padding: 3 }}>
      <Grid container spacing={2} sx={{ height: "100vh" }}>
        {/* ChatBox */}
        <Grid item xs={12} md={8}>
          <Box
            sx={{
              height: "100%",
              maxHeight: "80vh",
              overflow: "hidden",
            }}
          >
            <ChatBox />
          </Box>
        </Grid>

        {/* UserListBox */}
        <Grid item xs={12} md={4}>
          <Box
            sx={{
              height: "100%",
              overflowY: "auto", // scrollable
            }}
          >
            <UserListBox />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}

export default MainPage;
