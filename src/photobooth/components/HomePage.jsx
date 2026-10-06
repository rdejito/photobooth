import JoinRoomPanel from "./JoinRoomPanel.jsx";
import CameraIcon from "./CameraIcon.jsx";

export default function HomePage(props) {
  return (
    <div className="home-page">
      <nav className="home-nav" aria-label="Main navigation">
        <a className="home-brand" href="/" aria-label="Little Moments home">
          <span className="brand-icon"><CameraIcon /></span>
          <span>Little Moments</span>
        </a>
        <span className="nav-note">
          <span className="live-dot" /> A little booth for your people
        </span>
      </nav>

      <section className="home-hero">
        <div className="hero-copy">
          <div className="eyebrow">
            <span>✦</span> YOUR ONLINE PHOTOBOOTH
          </div>
          <h1>
            Get together.
            <br />
            <span>Make a moment.</span>
          </h1>
          <p className="hero-description">
            Invite your favorite people, pick a frame, and make a photo
            together. Save every little moment to your snapshots.
          </p>
          <div className="hero-points">
            <div className="hero-point">
              <span className="point-icon">01</span>
              <span>
                <strong>Start or join a room</strong>
                <small>Share a room code to connect</small>
              </span>
            </div>
            <div className="hero-point">
              <span className="point-icon">02</span>
              <span>
                <strong>Take and save photos</strong>
                <small>Pick a frame and keep a snapshot</small>
              </span>
            </div>
          </div>
        </div>

        <div className="hero-side">
          <div className="photo-art" aria-hidden="true">
            <div className="art-sparkle sparkle-one">✦</div>
            <div className="art-sparkle sparkle-two">✧</div>
            <div className="art-orbit orbit-one" />
            <div className="art-orbit orbit-two" />
            <div className="instant-photo photo-back">
              <div className="photo-image image-back">
                <span>✿</span>
              </div>
              <div className="photo-caption">a day worth keeping</div>
            </div>
            <div className="instant-photo photo-front">
              <div className="photo-image image-front">
                <span className="avatar avatar-one">☺</span>
                <span className="avatar avatar-two">☺</span>
                <span className="avatar avatar-three">☺</span>
                <span className="heart-doodle">✦</span>
              </div>
              <div className="photo-caption">the photobooth crew</div>
            </div>
            <div className="art-sticker">UP TO<br />4 IN ONE<br />FRAME</div>
          </div>
          <JoinRoomPanel {...props} />
        </div>
      </section>

      <footer className="home-footer">
        <span>Little Moments</span>
        <span className="footer-heart">·</span>
        <span>Photos are saved in this browser</span>
      </footer>
    </div>
  );
}
