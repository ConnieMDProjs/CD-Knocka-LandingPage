import { FilmPlayer } from "./FilmPlayer";

/**
 * THE FILM — a whole Knocka, start to finish, in thirty seconds.
 *
 * Placed straight after S2 on purpose. S2 makes the argument in the abstract
 * (text is flat; someone just showed up); this shows one real message making
 * the whole trip — sent, travelling, knocking, arriving — before How it works
 * explains how to send one yourself. It is also not pinned, so the page still
 * never holds the visitor in two scroll sequences back to back.
 *
 * A server component: the copy is static and the reveals are AOS. The heading
 * is handed to the player as children so the player can own the layout — on
 * a wide screen the film sits beside the heading and the chapters, on a
 * narrow one the three stack as heading, film, chapters.
 */
export function Film() {
  return (
    <section className="film" id="film" aria-labelledby="film-title">
      <div className="film-inner">
        <FilmPlayer>
          <p className="film-eyebrow" data-aos="knocka-rise">
            <span aria-hidden="true">✦</span> The Knocka film
          </p>

          <h2
            className="film-title delay-[60ms]"
            id="film-title"
            data-aos="knocka-heading"
          >
            Watch a message <span className="text-gradient">arrive.</span>
          </h2>

          <p className="film-lead delay-[140ms]" data-aos="knocka-rise">
            Jessica has news. Thirty seconds later, she&apos;s knocking on his
            screen to tell him herself.
          </p>
        </FilmPlayer>
      </div>
    </section>
  );
}
