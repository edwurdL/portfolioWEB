import Note from './Note'
import Figure, { FigureRow } from './Figure'
import { GrubblioDataDiagram, GrubblioDeploymentDiagram, GrubblioPhotosDiagram } from './diagrams'

// Screenshots for this post live in src/assets/projects/grubblio/, cropped
// from full-window captures of the game.
const FOLDER = 'grubblio'

export default function Grubblio() {
  return (
    <>
      <p>
        <a href="https://grubbl.io" target="_blank" rel="noopener noreferrer">grubbl.io</a> is a daily
        guessing game: guess the dish from its ingredients. You start with a few, and each wrong guess
        reveals another, with a limited number of guesses to get it. When the game ends, it shows the answer
        with a photo. The exact rules, like how many ingredients you start with and how many guesses you get,
        are still being tuned.
      </p>

      <Note>
        <span className="font-medium">Screenshots from November 17, 2026.</span> The game is still changing, so if
        you play it after that date, it may not look or play exactly like the pictures and clips here.
      </Note>

      <Figure
        folder={FOLDER}
        file="1-board.webp"
        caption="A Rush hour game in progress: the order ticket shows five of the nine ingredients, with two guesses below it"
      />

      <h2>Hints</h2>
      <p>
        Every guess is compared with the answer column by column, in the style of Royaledle: type,
        origin, diet, palate, course, cooking method, spice level and shared ingredients. Each column turns
        green for a match, yellow for close (a related family, the same region, one step apart on the
        vegan-to-omnivore scale) or red otherwise, and a closeness score from 0 to 100% combines them, so
        you can tell when you’re near.
      </p>
      <p>
        There’s no autocomplete. An exact name or alias is accepted straight away, and anything close gets
        a “Did you mean…?” prompt, with small typos allowed. Ingredients and single words don’t match
        anything, so you can’t search your way to the answer.
      </p>

      <Figure
        folder={FOLDER}
        file="did-you-mean.webp"
        caption="Typing “hawaii” gets a “Did you mean…?” prompt for Hawaiian Pizza"
      />

      <Figure
        folder={FOLDER}
        file="2-guesses.webp"
        caption="Two guesses compared with the answer, column by column: Pide is 45% close, Cheeseburger 28%"
      />

      <Figure folder={FOLDER} file="7-wrong-guess.gif" caption="A wrong guess: Bangers and Mash misses, a plate breaks, and the ticket reveals Flour as the seventh ingredient" />

      <p>Every dish photo, sound effect and font is credited in the game.</p>

      <FigureRow>
        <Figure folder={FOLDER} file="3-how-to-play.webp" caption="How to play" />
        <Figure folder={FOLDER} file="4-credits.webp" caption="Credits for the sounds, photos and fonts" />
      </FigureRow>

      <h2>How it’s built</h2>
      <p>
        Everything runs on one Cloudflare Worker. The React client and the dish photos are served as
        static assets, and only requests under <code>/api/</code> run the Worker’s code. The dish list
        (434 dishes, each with its attributes and ingredients in reveal order) is a TypeScript module
        bundled into the Worker.
      </p>

      <GrubblioDeploymentDiagram />

      <p>
        The server keeps no per-player game state. The browser stores the list of guessed dishes and
        sends it with each guess, and the Worker replays it to rebuild the board, sending the answer only
        once the game is over. Rush hour games, with a random dish, need no storage at all: the puzzle id
        is the answer encrypted with AES-GCM, so players can’t read it or forge one.
      </p>

      <h2>Dish photos</h2>
      <p>
        Photos are only ever fetched on my machine. <code>npm run fetch-images</code> searches Pixabay, or
        Wikimedia Commons with <code>--source commons</code> (or when no Pixabay key is set), and saves one
        photo per dish, recording each photo’s credit and source page in <code>credits.json</code>. A
        search result is only used if its description names the dish; otherwise the dish keeps the photo
        it already has. For dishes where Pixabay had nothing usable, I hand-picked a Commons file
        instead. The build copies the photos into the
        site under <code>/images/</code>, and the result card shows each one with its credit. The live site
        never contacts Pixabay or Commons, and a dish without a photo shows its emoji instead.
      </p>
      <p>
        Licensing decides what the repository holds. The 195 Commons photos are committed, since their
        Creative Commons licences allow redistribution. Pixabay’s licence forbids redistributing the raw
        files, so the 235 Pixabay photos are kept out of git, and a build triggered from GitHub
        re-downloads exactly the ones named in <code>credits.json</code> with my Pixabay API key.
        Deploying from my own machine skips that step and uses the photos already on disk.
      </p>

      <GrubblioPhotosDiagram />

      <h2>The daily puzzle</h2>
      <p>
        A Daily dish is identified by the player’s local date, as in Wordle. Each day’s answer picks
        itself: the first request for a date with no answer chooses a dish, preferring ones that haven’t
        been used yet, and stores it in Cloudflare D1, so every later player gets the same one. The Worker
        caches each date’s answer in memory, so each instance reads D1 at most once per date. Requests for
        a date that hasn’t started anywhere on Earth are refused, so nobody can play tomorrow’s puzzle
        early to see its answer.
      </p>

      <Figure
        folder={FOLDER}
        file="5-solved.webp"
        caption="A Daily dish solved in one guess: the answer, its photo and the photographer’s credit"
      />

      <Figure folder={FOLDER} file="8-right-guess.gif" caption="A right guess: Cinnamon Roll is served, and the answer card shows it with its photo" />

      <h2>Accounts and history</h2>
      <p>
        Accounts are optional and use Better Auth inside the Worker. Signing up emails a six-digit code
        through Resend, and the account is created only once the code is entered. Signed-in players get
        their game history, with streaks for the Daily dish. A recorded game can only gain guesses, and a
        finished one never changes, so a loss can’t be replaced after seeing the answer. Code emails and
        sign-in attempts are rate-limited per IP, with the counts kept in D1.
      </p>

      <Figure
        folder={FOLDER}
        file="6-history.webp"
        caption="My games for a signed-in player: Daily dish stats, guesses per solve, and recent games"
      />

      <p>
        A note on those numbers: they’re from my own account, which I used for testing while building the
        game. Some of its early games were recorded before the history handling was finished, or were
        changed while I was testing it, so a few of the stats don’t add up. Accounts created now don’t have
        this problem.
      </p>

      <GrubblioDataDiagram />

      <h2>Deploying</h2>
      <p>
        Every push to the repository’s main branch redeploys through Cloudflare Workers Builds: it
        re-downloads the Pixabay photos, builds the site, applies any new D1 migrations, and deploys the
        Worker.
      </p>
    </>
  )
}
