import { render, screen } from "@testing-library/react";
import HomePage from "../HomePage.jsx";

describe("Flowbite migration setup", () => {
  it("renders the join screen with a working room code flow", () => {
    render(
      <HomePage
        roomInput=""
        setRoomInput={() => {}}
        joinStatus="idle"
        setJoinStatus={() => {}}
        createRoom={() => {}}
        joinRoom={() => {}}
      />,
    );

    expect(screen.getByRole("heading", { name: /get together\./i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /create a room/i })).toBeInTheDocument();
  });
});
