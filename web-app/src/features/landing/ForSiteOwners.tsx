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

const ForSiteOwners = () => {
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
              secondary="Register your site on Soleil and you'll earn cryptocurrency for generating solar power. No catch. Use the funds to keep fighting climate change!"
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
        <div style={{
          display: 'flex',
          flexDirection: 'column'
        }}>
          <Button
            variant="contained"
            disableElevation
            component={Link}
            to="/register-site"
            style={{margin: '0 0 10px 0'}}
          >
            Register your site
          </Button>

          {/* TODO - Move? */}
          <Button
            variant="contained"
            disableElevation
            component={Link}
            to="/claim"
            style={{margin: '10px 0'}}
          >
            Claim Tokens
          </Button>
        </div>

      </CardActions>
    </Card>
  );
};

export default ForSiteOwners;
