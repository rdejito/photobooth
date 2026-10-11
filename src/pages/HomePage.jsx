import HomeTemplate from "../templates/HomeTemplate.jsx";

/**
 * HomePage — the landing screen (join / create room).
 *
 * Page is a thin shell over HomeTemplate; it exists as the Atomic-Design page
 * layer so routing/entry points name a "page" while the layout details live in
 * the template and the join card stays a reusable molecule.
 *
 * @param {object} props - Join-form props forwarded to HomeTemplate.
 */
export default function HomePage(props) {
  return <HomeTemplate {...props} />;
}