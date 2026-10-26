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
        // The booth is a locked 100dvh dark screen; a light document behind it
        // shows through on iOS overscroll/toolbar resize as a pale band.
        //
        // Never put `overflow` here. The root element's overflow is propagated
        // to the viewport, and mobile WebKit/Blink react by no longer treating
        // the document as a normal scrolling page — the join screen can freeze
        // completely. Containment belongs on the panels that scroll instead
        // (see styles/boothIntro.js and styles/boothTemplate.js).
        html: {
          background: "#171423",
        },
        body: {
          margin: 0,
          minHeight: "100vh",
          color: "#fffaf7",
          background: "#171423",
          fontSynthesis: "none",
          textRendering: "optimizeLegibility",
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
        },
        "button, input, textarea, select": { font: "inherit" },
        "#root": { minHeight: "100vh" },
      },
    },
  },
});

export default muiTheme;
