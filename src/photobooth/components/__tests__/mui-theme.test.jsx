import muiTheme from "../../muiTheme.js";

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
});
