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
import { useMoralis } from "react-moralis";

const ForSiteOwners = () => {
  const { isAuthenticated } = useMoralis();

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
              secondary="Register your site on Soleil and you'll earn cryptocurrency for generating solar power. Use the funds to keep fighting climate change!"
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Contribute to a growing data feed"
              secondary="Nonsensitive energy generation data from your site is stored in a public decentralised data feed. This public good can help us in the fight against climate change in a number of ways."
            />
          </ListItem>
        </List>
      </CardContent>
      <CardActions
        sx={{
          display: "flex",
          justifyContent: "center",
          mb: 2,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Button
            variant="contained"
            disableElevation
            component={Link}
            to="/register-site"
            disabled={!isAuthenticated}
            style={{ margin: "0 0 10px 0" }}
          >
            Register your site
          </Button>
        </div>
      </CardActions>
    </Card>
  );
};

export default ForSiteOwners;
