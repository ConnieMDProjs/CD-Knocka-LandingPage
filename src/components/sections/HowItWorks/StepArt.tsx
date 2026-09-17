import Image from "next/image";

import type { Art } from "./steps";

const IMG = "/avatar-profile-img";

/**
 * The picture inside each card.
 *
 * Small product mock-ups rather than icons: a dashed upload well, an avatar
 * being tuned, a message being performed, a room filling up, a knock landing.
 * They are built out of the profile renders the page already ships and a
 * little CSS, so the section adds no new assets and no icon library.
 */
export function StepArt({ art }: { art: Art }) {
  if (art === "selfie") {
    return (
      <div className="how-art how-art-selfie">
        <span className="how-well">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M4 8.5A2.5 2.5 0 0 1 6.5 6h1.2l.9-1.5h6.8L16.3 6h1.2A2.5 2.5 0 0 1 20 8.5v8A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5v-8Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
            />
            <circle
              cx="12"
              cy="12.4"
              r="3.4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
            />
          </svg>
          <b>Take a selfie</b>
        </span>
        <span className="how-file">selfie.jpg · uploaded</span>
      </div>
    );
  }

  if (art === "avatar") {
    return (
      <div className="how-art how-art-avatar">
        <span className="how-face">
          <Image
            src={`${IMG}/avatar1.png`}
            alt=""
            width={500}
            height={500}
            sizes="120px"
          />
        </span>
        <span className="how-swatches" aria-hidden="true">
          {["#f5cba7", "#7c3f1d", "#38bdf8", "#ec4899"].map((c, i) => (
            <i key={c} style={{ background: c }} data-on={i === 2} />
          ))}
        </span>
      </div>
    );
  }

  if (art === "message") {
    return (
      <div className="how-art how-art-message">
        <span className="how-bubble">
          Guess who just landed
          <em aria-hidden="true">now</em>
        </span>
        <span className="how-face how-face-pop">
          <Image
            src={`${IMG}/avatar3.png`}
            alt=""
            width={500}
            height={500}
            sizes="110px"
          />
        </span>
      </div>
    );
  }

  if (art === "room") {
    return (
      <div className="how-art how-art-room">
        <span className="how-stack" aria-hidden="true">
          {["avatar2.png", "avatar4.png", "avatar6.png"].map((file) => (
            <i key={file}>
              <Image
                src={`${IMG}/${file}`}
                alt=""
                width={500}
                height={500}
                sizes="64px"
              />
            </i>
          ))}
          <b>+3</b>
        </span>
        <span className="how-file">Ice cream shop · 6 inside</span>
      </div>
    );
  }

  return (
    <div className="how-art how-art-knock">
      <span className="how-knock" data-mark="1">
        Knock
      </span>
      <span className="how-knock" data-mark="2">
        Knock
      </span>
    </div>
  );
}
