import fs from "node:fs/promises";

describe("MUI setup docs and build coverage", () => {
  it("documents MUI/Emotion and retains the developer build instructions", async () => {
    const md = await fs.readFile(`${process.cwd()}/README.md`, "utf8");

    expect(md).toMatch(/\bMUI\b/i);
    expect(md).toMatch(/Emotion/i);
    expect(md).toMatch(/npm install/i);
    expect(md).toMatch(/npm run dev/i);
    expect(md).toMatch(/npm run build/i);
    expect(md).toMatch(/npm run preview/i);
  });
});
