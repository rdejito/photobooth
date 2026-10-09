import { fireEvent, render, screen } from "@testing-library/react";
import HomePage from "../HomePage.jsx";
import JoinRoomPanel from "../JoinRoomPanel.jsx";

describe("MUI home controls", () => {
  it("renders the home screen and create-room action", () => {
    render(
      <HomePage
        roomInput=""
        setRoomInput={() => {}}
        joinStatus=""
        setJoinStatus={() => {}}
        createRoom={() => {}}
        joinRoom={() => {}}
      />,
    );

    expect(screen.getByRole("navigation")).toHaveClass("MuiBox-root");
    expect(screen.getByRole("heading", { name: /get together/i })).toHaveClass("MuiTypography-root");
    expect(screen.getByText(/your online photobooth/i)).toBeInTheDocument();
    expect(screen.getByText(/share a room code to connect/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /create a room/i })).toBeInTheDocument();
    expect(screen.getByText(/photos are saved in this browser/i)).toBeInTheDocument();
  });

  it("uses MUI form controls with accessible names and room status", () => {
    render(
      <JoinRoomPanel
        roomInput=""
        setRoomInput={() => {}}
        joinStatus="Enter a room code first."
        setJoinStatus={() => {}}
        createRoom={() => {}}
        joinRoom={() => {}}
      />,
    );

    expect(screen.getByLabelText(/your room code/i)).toHaveClass("MuiInputBase-input");
    expect(screen.getByRole("button", { name: /create a room/i })).toHaveClass("MuiButton-root");
    expect(screen.getByRole("button", { name: /join with code/i })).toHaveClass("MuiButton-root");
    expect(screen.getByText("Enter a room code first.")).toHaveAttribute("aria-live", "polite");
    expect(screen.getByText("Join or create a room").closest(".MuiPaper-root")).not.toBeNull();
  });

  it("normalizes typed room codes before updating the room input", () => {
    const setRoomInput = vi.fn();

    render(
      <JoinRoomPanel
        roomInput=""
        setRoomInput={setRoomInput}
        joinStatus=""
        setJoinStatus={() => {}}
        createRoom={() => {}}
        joinRoom={() => {}}
      />,
    );

    fireEvent.change(screen.getByLabelText(/your room code/i), {
      target: { value: "gems22" },
    });

    expect(setRoomInput).toHaveBeenCalledWith("GEMS22");
  });

  it("submits the entered room code and clears its validation status on edit", () => {
    const joinRoom = vi.fn();
    const setJoinStatus = vi.fn();

    const { rerender } = render(
      <JoinRoomPanel
        roomInput="GEMS22"
        setRoomInput={() => {}}
        joinStatus=""
        setJoinStatus={setJoinStatus}
        createRoom={() => {}}
        joinRoom={joinRoom}
      />,
    );

    fireEvent.submit(screen.getByRole("button", { name: /join with code/i }).closest("form"));
    expect(joinRoom).toHaveBeenCalledWith("GEMS22");

    rerender(
      <JoinRoomPanel
        roomInput="GEMS22"
        setRoomInput={() => {}}
        joinStatus="Enter a room code first."
        setJoinStatus={setJoinStatus}
        createRoom={() => {}}
        joinRoom={joinRoom}
      />,
    );

    fireEvent.change(screen.getByLabelText(/your room code/i), {
      target: { value: "a" },
    });
    expect(setJoinStatus).toHaveBeenCalledWith("");
  });
});
