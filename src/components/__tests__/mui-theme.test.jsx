import muiTheme from "../../theme/muiTheme.js";

describe("MUI theme", () => {
  it("preserves the photobooth palette and shared styling defaults", () => {
    expect(muiTheme.palette.primary).toMatchObject({
      light: "#fda4af",
      main: "#be185d",
      dark: "#9d174d",
    });
    expect(muiTheme.shape.borderRadius).toBe(16);
    expect(muiTheme.typography.fontFamily).toBe('"Inter", "Segoe UI", sans-serif');
    expect(muiTheme.components.MuiButton.defaultProps.disableElevation).toBe(true);
    expect(muiTheme.components.MuiButton.styleOverrides.root.textTransform).toBe("none");
  });

  it("keeps global page defaults in the MUI CssBaseline", () => {
    const baseline = muiTheme.components.MuiCssBaseline.styleOverrides;

    expect(baseline.body).toMatchObject({
      fontSynthesis: "none",
      textRendering: "optimizeLegibility",
      WebkitFontSmoothing: "antialiased",
      MozOsxFontSmoothing: "grayscale",
    });
    expect(baseline["button, input, textarea, select"]).toEqual({ font: "inherit" });
    expect(baseline["#root"]).toMatchObject({ minHeight: "100vh" });
  });

  it("never sets overflow on the root elements", () => {
    // Root overflow propagates to the viewport and freezes document scrolling
    // on mobile browsers; containment has to stay on the booth shell.
    const baseline = muiTheme.components.MuiCssBaseline.styleOverrides;

    for (const element of ["html", "body"]) {
      expect(baseline[element].overflow).toBeUndefined();
      expect(baseline[element].overflowX).toBeUndefined();
      expect(baseline[element].overflowY).toBeUndefined();
      expect(baseline[element].overscrollBehavior).toBeUndefined();
    }
  });
});
