import { render, screen } from "@testing-library/react";
import HomePage from "../HomePage.jsx";
import JoinRoomPanel from "../JoinRoomPanel.jsx";

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

  it("keeps the room code form and CTA buttons accessible while using Flowbite controls", () => {
    render(
      <JoinRoomPanel
        roomInput=""
        setRoomInput={() => {}}
        joinStatus="idle"
        setJoinStatus={() => {}}
        createRoom={() => {}}
        joinRoom={() => {}}
      />,
    );

    expect(screen.getByLabelText(/room code/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /create a room/i })).toHaveClass("bg-primary-700");
    expect(screen.getByRole("button", { name: /join with code/i })).toHaveClass("bg-white");
  });
});
