import fs from "node:fs/promises";

describe("Flowbite setup docs and build coverage", () => {
  it("keeps the doc and build instructions aligned with the new style stack", async () => {
    const md = await fs.readFile(`${process.cwd()}/README.md`, "utf8");

    expect(md).toMatch(/Flowbite/i);
    expect(md).toMatch(/Tailwind/i);
    expect(md).toMatch(/npm run build/i);
  });
});
