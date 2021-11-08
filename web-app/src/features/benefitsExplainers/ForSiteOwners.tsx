import React from "react";
import {
  Button,
  Card,
  CardActions,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import { Link } from "react-router-dom";

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
      <CardActions
        sx={{
          display: "flex",
          justifyContent: "center",
          mb: 2
        }}
      >
          <Button
            variant="contained"
            disableElevation
            component={Link}
            to="/register-site"
          >
            Register your site
          </Button>
      </CardActions>
    </Card>
  );
};
