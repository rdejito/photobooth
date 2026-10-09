import { createTheme } from "@mui/material/styles";

const muiTheme = createTheme({
  palette: {
    primary: {
      light: "#fda4af",
      main: "#be185d",
      dark: "#9d174d",
      contrastText: "#ffffff",
    },
    text: {
      primary: "#111827",
    },
  },
  typography: {
    fontFamily: '"Inter", "Segoe UI", sans-serif',
    body1: {
      lineHeight: 1.5,
      fontWeight: 400,
    },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          textTransform: "none",
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        html: {
          background: "#fffaf6",
        },
        body: {
          margin: 0,
          minHeight: "100vh",
          color: "#111827",
          background:
            "radial-gradient(circle at top, rgba(251, 191, 36, 0.18), transparent 30%), linear-gradient(135deg, #fffaf6 0%, #fff7ed 100%)",
        },
      },
    },
  },
});

export default muiTheme;
