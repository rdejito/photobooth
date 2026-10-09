import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import CameraIcon from "./CameraIcon.jsx";

export default function JoinRoomPanel({
  roomInput,
  setRoomInput,
  joinStatus,
  setJoinStatus,
  createRoom,
  joinRoom,
}) {
  const submitRoom = (event) => {
    event.preventDefault();
    joinRoom(roomInput);
  };

  return (
    <Paper
      component="section"
      elevation={0}
      sx={{
        width: "100%",
        maxWidth: 448,
        p: 3,
        border: "1px solid #ffe4e6",
        borderRadius: 3,
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        boxShadow: "0 24px 80px rgba(76, 29, 149, 0.12)",
        backdropFilter: "blur(8px)",
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        <Box
          component="span"
          sx={{
            display: "inline-flex",
            width: 28,
            height: 28,
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            borderRadius: "50%",
            color: "#e11d48",
            backgroundColor: "#ffe4e6",
            "& svg": { width: 16, height: 16 },
          }}
        >
          <CameraIcon />
        </Box>
        <Typography
          component="span"
          sx={{
            color: "#f43f5e",
            fontSize: "0.625rem",
            fontWeight: 600,
            letterSpacing: "0.28em",
            textTransform: "uppercase",
          }}
        >
          Your photobooth is ready
        </Typography>
      </Stack>
      <Typography
        id="room-card-title"
        component="h2"
        variant="h5"
        sx={{ mb: 1, fontWeight: 700, letterSpacing: "-0.025em", color: "#0f172a" }}
      >
        Join or create a room
      </Typography>
      <Typography sx={{ mb: 3, color: "#475569", fontSize: "0.875rem" }}>
        Start a room and share the code, or enter one you&apos;ve been given.
      </Typography>

      <Box component="form" onSubmit={submitRoom} sx={{ display: "grid", gap: 2 }}>
        <Box>
          <Typography
            component="label"
            htmlFor="room-code"
            sx={{
              display: "block",
              mb: 1,
              color: "#475569",
              fontSize: "0.75rem",
              fontWeight: 600,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
            }}
          >
            Your room code
          </Typography>
          <TextField
            id="room-code"
            name="room-code"
            value={roomInput}
            onChange={(event) => {
              setRoomInput(event.target.value.toUpperCase());
              if (joinStatus === "Enter a room code first.") setJoinStatus("");
            }}
            placeholder="e.g. GEMS22"
            fullWidth
            inputProps={{
              maxLength: 10,
              autoComplete: "off",
              autoCapitalize: "characters",
              spellCheck: "false",
              "aria-describedby": "room-help room-status",
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                minHeight: 52,
                borderRadius: 1,
                backgroundColor: "#ffffff",
                "& fieldset": { borderColor: "#fecdd3" },
                "&:hover fieldset": { borderColor: "#fda4af" },
                "&.Mui-focused fieldset": { borderColor: "primary.main" },
              },
              "& input": {
                color: "#0f172a",
                fontSize: "1rem",
                "&::placeholder": { color: "#94a3b8", opacity: 1 },
              },
            }}
          />
        </Box>
        <Typography id="room-help" sx={{ color: "#64748b", fontSize: "0.875rem" }}>
          Create a code to share, or enter an existing one.
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: 1.5,
            "@media (min-width: 640px)": { gridTemplateColumns: "repeat(2, minmax(0, 1fr))" },
          }}
        >
          <Button
            type="button"
            variant="contained"
            onClick={createRoom}
            startIcon={
              <Box component="span" sx={{ display: "inline-flex", "& svg": { width: 16, height: 16 } }}>
                <CameraIcon />
              </Box>
            }
            sx={{
              minHeight: 48,
              color: "#ffffff",
              backgroundColor: "primary.dark",
              "&:hover": { backgroundColor: "#9d174d" },
            }}
          >
            Create a room
          </Button>
          <Button
            type="submit"
            variant="outlined"
            sx={{
              minHeight: 48,
              borderColor: "#e2e8f0",
              color: "#1e293b",
              backgroundColor: "#ffffff",
              "&:hover": { borderColor: "#cbd5e1", backgroundColor: "#f8fafc" },
            }}
          >
            Join with code <Box component="span" aria-hidden="true" sx={{ ml: 0.5 }}>→</Box>
          </Button>
        </Box>
      </Box>
      <Box
        id="room-status"
        sx={{
          mt: 2,
          minHeight: 24,
          borderRadius: 1,
          px: 1.5,
          py: 1,
          color: "#be123c",
          backgroundColor: "#fff1f2",
          fontSize: "0.875rem",
        }}
        aria-live="polite"
        data-visible={Boolean(joinStatus)}
      >
        {joinStatus || " "}
      </Box>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 2, color: "#64748b", fontSize: "0.875rem" }}>
        <Box component="span" aria-hidden="true">⌑</Box>
        <Typography component="span" sx={{ fontSize: "inherit" }}>
          Your photos are saved only on this device
        </Typography>
      </Stack>
    </Paper>
  );
}
