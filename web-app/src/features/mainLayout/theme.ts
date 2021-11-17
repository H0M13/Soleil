import { createTheme } from "@mui/material";

export default createTheme({
  palette: {
    primary: {
      main: "rgb(27, 116, 242)",
    },
    secondary: {
      main: "#4493cf",
    },
    background: {
      default: "#f5d312",
      paper: "#f2f2f2",
    },
    text: {
      primary: "#262a31",
      secondary: "#383c4a",
    },
  },
  shape: {
    borderRadius: 0,
  },
  typography: {
    fontFamily: "'Source Code Pro', monospace",
    fontWeightRegular: 600,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          boxShadow: "10px 10px black",
        },
        containedPrimary: {
          "&:hover": {
            backgroundColor: "rgb(27, 116, 242)",
            cursor: "unset",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: "10px 10px black",
          backgroundColor: "transparent",
          border: "1px solid black",
          color: "rgb(27, 116, 242)",
        },
      },
    },
  },
});