import React from "react";
import {
  Box,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";

export const ForSiteOwners = () => {
  return (
    <Card
      sx={{
        maxWidth: "400px",
      }}
    >
      <CardContent>
        <Typography variant="h5">For Solar Panel Owners</Typography>
        <List>
          <ListItem>
            <ListItemText
              primary="Earn cryptocurrency!"
              secondary="Register with your SolarEdge site and you'll earn cryptocurrency for generating solar power. Keep fighting climate change!"
            />
          </ListItem>
        </List>
      </CardContent>
    </Card>
  );
};
