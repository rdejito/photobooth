import BoothTemplate from "../templates/BoothTemplate.jsx";

/**
 * BoothPage — the in-room photobooth screen.
 *
 * Thin page shell over BoothTemplate. All the room/capture wiring originates in
 * App and flows down through this page as props; keeping the page stateless
 * means the whole booth layout can be tested and reused independently.
 *
 * @param {object} props - The full booth prop set from App.
 */
export default function BoothPage(props) {
  return <BoothTemplate {...props} />;
}