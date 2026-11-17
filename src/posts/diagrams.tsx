import type { ReactNode } from 'react'

/*
 * UML diagrams for the "How this website works" post, drawn as inline SVG so
 * they follow the site's light/dark theme (colours come from the .uml rules in
 * style.css) and stay sharp at any size. On a phone each diagram keeps a
 * readable minimum width and scrolls sideways inside its own box, like the
 * autotune charts.
 */

function DiagramFigure({ caption, children }: { caption: string; children: ReactNode }) {
  return (
    <figure className="my-8">
      <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        {children}
      </div>
      <figcaption className="mt-2 text-xs text-zinc-500 dark:text-zinc-400 text-center">{caption}</figcaption>
    </figure>
  )
}

/** Arrowheads; ids are prefixed per diagram since several share one page. */
function Markers({ id }: { id: string }) {
  return (
    <defs>
      <marker id={`${id}-arrow`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M0 0 L10 5 L0 10 z" className="head" />
      </marker>
      <marker id={`${id}-accent`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M0 0 L10 5 L0 10 z" className="head-accent" />
      </marker>
      <marker id={`${id}-open`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M0 0 L10 5 L0 10" className="head-open" />
      </marker>
    </defs>
  )
}

/** A UML node: a box drawn as the front of a cube, with its stereotype and name. */
function Node({ x, y, w, h, stereo, name }: { x: number; y: number; w: number; h: number; stereo: string; name: string }) {
  const d = 8
  return (
    <g>
      <path className="node-side" d={`M${x} ${y} L${x + d} ${y - d} H${x + w + d} V${y + h - d} L${x + w} ${y + h} V${y} Z`} />
      <rect className="node" x={x} y={y} width={w} height={h} />
      <text className="stereo" x={x + 12} y={y + 18}>{stereo}</text>
      <text className="name" x={x + 12} y={y + 35}>{name}</text>
    </g>
  )
}

/** A component or artifact inside a node: optional stereotype, a name, detail lines. */
function Part({ x, y, w, h, stereo, name, lines = [] }: {
  x: number; y: number; w: number; h: number; stereo?: string; name: string; lines?: string[]
}) {
  const nameY = stereo ? y + 31 : lines.length ? y + 20 : y + h / 2 + 4
  return (
    <g>
      <rect className="part" x={x} y={y} width={w} height={h} rx={3} />
      {stereo && <text className="stereo" x={x + 10} y={y + 15}>{stereo}</text>}
      <text className="name" x={x + 10} y={nameY}>{name}</text>
      {lines.map((line, i) => (
        <text key={line} className="muted" x={x + 10} y={nameY + 15 + i * 14}>{line}</text>
      ))}
    </g>
  )
}

/**
 * Deployment diagram: where each piece of the site runs and how a visit reaches
 * the Mac mini. Pages are built and served by Cloudflare Pages from the
 * portfolio-web repository; API calls and photos reach the Mac mini's Express
 * server through a Cloudflare Tunnel.
 */
export function SiteDeploymentDiagram() {
  return (
    <DiagramFigure caption="UML deployment diagram: the site on Cloudflare Pages and the Express API on my Mac mini, reached through a Cloudflare Tunnel">
      <svg className="uml block w-full h-auto min-w-[640px]" viewBox="0 0 830 500" role="img" aria-labelledby="deploy-title deploy-desc">
        <title id="deploy-title">How this website is deployed</title>
        <desc id="deploy-desc">
          Pushes to the portfolio-web repository on GitHub trigger Cloudflare Pages, which builds the site and serves it as
          eddie-lai.com. A visitor’s browser loads pages from Cloudflare Pages, and sends API and photo requests to
          api.eddie-lai.com, which Cloudflare’s proxy forwards through a Cloudflare Tunnel to cloudflared on the Mac mini and on
          to the Express API. Express reads photo metadata from PostgreSQL through Prisma, serves processed WebP files, and asks
          Cloudflare’s analytics API for the last 24 hours of traffic.
        </desc>
        <Markers id="dep" />

        <Node x={20} y={50} w={200} h={140} stereo="«service»" name="GitHub" />
        <Part x={36} y={106} w={168} h={66} stereo="«artifact»" name="portfolio-web" lines={['source repository']} />

        <Node x={20} y={260} w={200} h={150} stereo="«device»" name="Visitor’s browser" />
        <Part x={36} y={316} w={168} h={78} stereo="«artifact»" name="React app" lines={['prerendered HTML pages', '+ JS bundle']} />

        <Node x={300} y={50} w={210} h={440} stereo="«cloud»" name="Cloudflare" />
        <Part x={316} y={96} w={178} h={70} stereo="«component»" name="Pages" lines={['builds + hosts the site', 'eddie-lai.com']} />
        <Part x={316} y={182} w={178} h={64} stereo="«component»" name="Proxy + cache" lines={['api.eddie-lai.com']} />
        <Part x={316} y={262} w={178} h={40} name="Tunnel" lines={['api.* · ssh.* (Access)']} />
        <Part x={316} y={318} w={178} h={58} stereo="«service»" name="Analytics API" lines={['last-24h traffic']} />

        <Node x={590} y={50} w={220} h={440} stereo="«device»" name="Mac mini" />
        <Part x={606} y={96} w={188} h={80} stereo="«component»" name="Photo pipeline" lines={['chokidar watcher + queue', 'sharp · exifr · Ollama']} />
        <Part x={606} y={262} w={188} h={40} name="cloudflared" />
        <Part x={606} y={318} w={188} h={92} stereo="«component» run by pm2" name="Express API"
          lines={['/api/photos · /api/projects', '/api/analytics · /health', '/photos/processed/*.webp']} />
        <Part x={606} y={426} w={90} h={48} name="PostgreSQL" lines={['via Prisma']} />
        <Part x={704} y={426} w={90} h={48} name="processed/" lines={['WebP files']} />

        {/* GitHub → Cloudflare Pages */}
        <path className="edge" d="M204 136 H316" markerEnd="url(#dep-arrow)" />
        <text className="label halo" x={260} y={128} textAnchor="middle">push → build</text>

        {/* Browser → Pages (site) and → Proxy (API, photos) */}
        <path className="edge" d="M204 334 H262 V150 H316" markerEnd="url(#dep-arrow)" />
        <text className="muted halo" x={254} y={250} textAnchor="middle" transform="rotate(-90 254 250)">pages</text>
        <path className="edge" d="M204 372 H280 V214 H316" markerEnd="url(#dep-arrow)" />
        <text className="muted halo" x={291} y={300} textAnchor="middle" transform="rotate(-90 291 300)">API · WebP</text>

        {/* Proxy → Tunnel → cloudflared → Express */}
        <path className="edge" d="M405 246 V262" markerEnd="url(#dep-arrow)" />
        <path className="edge accent" d="M494 282 H606" markerEnd="url(#dep-accent)" />
        <text className="label accent-text" x={550} y={274} textAnchor="middle">tunnel</text>
        <text className="muted" x={550} y={298} textAnchor="middle">no open ports</text>
        <path className="edge" d="M700 302 V318" markerEnd="url(#dep-arrow)" />
        <text className="muted" x={708} y={314}>localhost</text>

        {/* Express → Cloudflare analytics */}
        <path className="edge" d="M606 347 H494" markerEnd="url(#dep-arrow)" />
        <text className="muted" x={550} y={339} textAnchor="middle">stats request</text>

        {/* Express → storage */}
        <path className="edge" d="M651 410 V426" markerEnd="url(#dep-arrow)" />
        <path className="edge" d="M749 410 V426" markerEnd="url(#dep-arrow)" />
      </svg>
    </DiagramFigure>
  )
}

/** A rounded UML action box with one or more centred lines (the first in bold). */
function Action({ cx, y, w, h, lines }: { cx: number; y: number; w: number; h: number; lines: string[] }) {
  const top = y + h / 2 - ((lines.length - 1) * 15) / 2 + 4
  return (
    <g>
      <rect className="part" x={cx - w / 2} y={y} width={w} height={h} rx={14} />
      {lines.map((line, i) => (
        <text key={line} className={i === 0 ? 'name' : 'muted'} x={cx} y={top + i * 15} textAnchor="middle">{line}</text>
      ))}
    </g>
  )
}

/**
 * Activity diagram of a deploy: pushing to portfolio-web makes Cloudflare Pages
 * build the site (the repo's own `pnpm build`, which type-checks, bundles and
 * prerenders every page) and publish it to Cloudflare's CDN.
 */
export function DeployPipelineDiagram() {
  const LANE = 760 / 3
  const GH = LANE / 2, PAGES = LANE * 1.5, CDN = LANE * 2.5
  return (
    <DiagramFigure caption="UML activity diagram: how a push to GitHub becomes the live site">
      <svg className="uml block w-full h-auto min-w-[600px]" viewBox="0 0 760 480" role="img" aria-labelledby="ship-title ship-desc">
        <title id="ship-title">How a change goes live</title>
        <desc id="ship-desc">
          I push to the portfolio-web repository on GitHub. Cloudflare Pages detects the push automatically and builds the site
          with pnpm build, which type-checks the code, bundles it with Vite and prerenders every page. Cloudflare Pages then
          deploys the built files to Cloudflare’s CDN, and eddie-lai.com serves the site globally.
        </desc>
        <Markers id="ship" />

        {/* Swimlanes */}
        {['GitHub', 'Cloudflare Pages', 'Cloudflare CDN'].map((lane, i) => (
          <g key={lane}>
            <rect className="lane" x={i * LANE} y={0} width={LANE} height={480} />
            <text className="name" x={i * LANE + LANE / 2} y={24} textAnchor="middle">{lane}</text>
          </g>
        ))}
        <path className="divider" d="M0 38 H760" />

        <circle className="start" cx={GH} cy={62} r={8} />
        <path className="edge" d={`M${GH} 70 V88`} markerEnd="url(#ship-arrow)" />
        <Action cx={GH} y={88} w={190} h={50} lines={['Push to portfolio-web', 'git push']} />

        <path className="edge accent" d={`M${GH + 95} 113 H${PAGES} V156`} markerEnd="url(#ship-accent)" />
        <text className="muted accent-text halo" x={(GH + PAGES) / 2 + 40} y={106} textAnchor="middle">triggers automatically</text>

        <Action cx={PAGES} y={156} w={200} h={44} lines={['Detect the push']} />
        <path className="edge" d={`M${PAGES} 200 V224`} markerEnd="url(#ship-arrow)" />
        <Action cx={PAGES} y={224} w={200} h={64} lines={['Build: pnpm build', 'type-check · vite build', 'prerender every page']} />
        <path className="edge" d={`M${PAGES} 288 V312`} markerEnd="url(#ship-arrow)" />
        <Action cx={PAGES} y={312} w={200} h={44} lines={['Deploy built files']} />

        <path className="edge" d={`M${PAGES + 100} 334 H${CDN} V380`} markerEnd="url(#ship-arrow)" />
        <Action cx={CDN} y={380} w={200} h={50} lines={['Serve eddie-lai.com', 'globally']} />

        <path className="edge" d={`M${CDN} 430 V446`} markerEnd="url(#ship-arrow)" />
        <circle className="end-ring" cx={CDN} cy={456} r={10} />
        <circle className="start" cx={CDN} cy={456} r={6} />
      </svg>
    </DiagramFigure>
  )
}

/**
 * Activity diagram of an API deploy, from the API repository's GitHub Actions
 * workflow ("Deploy to Mac Mini"): a push to main makes a runner SSH into the
 * Mac mini through Cloudflare Access and rebuild and reload the server there.
 */
export function ApiDeployDiagram() {
  const LANE = 190
  const GH = 95, RUN = 285, CF = 475, MAC = 665
  return (
    <DiagramFigure caption="UML activity diagram: how a push to the API repository redeploys the server on my Mac mini">
      <svg className="uml block w-full h-auto min-w-[640px]" viewBox="0 0 760 590" role="img" aria-labelledby="apideploy-title apideploy-desc">
        <title id="apideploy-title">How the API is deployed</title>
        <desc id="apideploy-desc">
          A push to the main branch of the API repository starts a GitHub Actions workflow. Its runner installs cloudflared,
          sets up an SSH key, and connects to ssh.eddie-lai.com through Cloudflare Access. On the Mac mini it runs git pull,
          pnpm install, pnpm build and pnpm migrate, then reloads the API with pm2 (or starts dist/index.js if it isn’t
          running) and saves the pm2 process list.
        </desc>
        <Markers id="api" />

        {['GitHub', 'Actions runner', 'Cloudflare', 'Mac mini'].map((lane, i) => (
          <g key={lane}>
            <rect className="lane" x={i * LANE} y={0} width={LANE} height={590} />
            <text className="name" x={i * LANE + LANE / 2} y={24} textAnchor="middle">{lane}</text>
          </g>
        ))}
        <path className="divider" d="M0 38 H760" />

        <circle className="start" cx={GH} cy={62} r={8} />
        <path className="edge" d={`M${GH} 70 V88`} markerEnd="url(#api-arrow)" />
        <Action cx={GH} y={88} w={170} h={50} lines={['Push to main', 'API repository']} />

        <path className="edge" d={`M${GH + 85} 113 H${RUN} V150`} markerEnd="url(#api-arrow)" />
        <text className="muted halo" x={GH + 125} y={106} textAnchor="middle">starts workflow</text>

        <Action cx={RUN} y={150} w={170} h={40} lines={['Install cloudflared']} />
        <path className="edge" d={`M${RUN} 190 V214`} markerEnd="url(#api-arrow)" />
        <Action cx={RUN} y={214} w={170} h={40} lines={['Set up SSH key']} />
        <path className="edge" d={`M${RUN} 254 V278`} markerEnd="url(#api-arrow)" />
        <Action cx={RUN} y={278} w={170} h={50} lines={['SSH to the Mac mini', 'ssh.eddie-lai.com']} />

        <path className="edge accent" d={`M${RUN + 85} 303 H${CF - 85}`} markerEnd="url(#api-accent)" />
        <Action cx={CF} y={278} w={170} h={50} lines={['Cloudflare Access', 'cloudflared access ssh']} />
        <path className="edge accent" d={`M${CF + 85} 303 H${MAC - 85}`} markerEnd="url(#api-accent)" />

        <Action cx={MAC} y={278} w={170} h={50} lines={['git pull', 'pnpm install']} />
        <path className="edge" d={`M${MAC} 328 V352`} markerEnd="url(#api-arrow)" />
        <Action cx={MAC} y={352} w={170} h={50} lines={['pnpm build', 'pnpm migrate']} />
        <path className="edge" d={`M${MAC} 402 V426`} markerEnd="url(#api-arrow)" />
        <Action cx={MAC} y={426} w={170} h={50} lines={['pm2 reload api', 'or start dist/index.js']} />
        <path className="edge" d={`M${MAC} 476 V500`} markerEnd="url(#api-arrow)" />
        <Action cx={MAC} y={500} w={170} h={40} lines={['pm2 save']} />

        <path className="edge" d={`M${MAC} 540 V556`} markerEnd="url(#api-arrow)" />
        <circle className="end-ring" cx={MAC} cy={566} r={10} />
        <circle className="start" cx={MAC} cy={566} r={6} />
      </svg>
    </DiagramFigure>
  )
}

/** A UML class box: name compartment, then one attribute per line. */
function ClassBox({ x, y, w, stereo, name, attrs }: { x: number; y: number; w: number; stereo: string; name: string; attrs: string[] }) {
  const head = 44
  const h = head + 12 + attrs.length * 16
  return (
    <g>
      <rect className="part" x={x} y={y} width={w} height={h} />
      <text className="stereo" x={x + w / 2} y={y + 17} textAnchor="middle">{stereo}</text>
      <text className="name" x={x + w / 2} y={y + 34} textAnchor="middle">{name}</text>
      <path className="edge" d={`M${x} ${y + head} H${x + w}`} />
      {attrs.map((attr, i) => (
        <text key={attr} className="mono" x={x + 12} y={y + head + 18 + i * 16}>{attr}</text>
      ))}
    </g>
  )
}

/**
 * Class diagram of the photo data: the Prisma model stored in PostgreSQL on the
 * Mac mini, and the types the site maps it into (mapPhoto in src/lib/api.ts).
 */
export function PhotoModelDiagram() {
  return (
    <DiagramFigure caption="UML class diagram: the Photo model in PostgreSQL, and the types the site maps it into">
      <svg className="uml block w-full h-auto min-w-[640px]" viewBox="0 0 830 336" role="img" aria-labelledby="model-title model-desc">
        <title id="model-title">The photo data model</title>
        <desc id="model-desc">
          On the Mac mini, Prisma’s Photo model in PostgreSQL holds an id, filename, url, description, category, tags, colors,
          optional EXIF fields (date taken, camera, ISO, shutter, aperture, lens, focal length) and a creation time. GET
          /api/photos returns these rows as JSON, and the site’s mapPhoto function turns each into its own Photo type, whose
          meta field holds a PhotoMeta with the camera settings, date and description.
        </desc>
        <Markers id="cls" />

        <ClassBox x={20} y={20} w={270} stereo="«Prisma model» PostgreSQL" name="Photo" attrs={[
          'id: String  {cuid}',
          'filename: String',
          'url: String',
          'description: String',
          'category: String',
          'tags: String[]',
          'colors: String[]',
          'dateTaken: DateTime [0..1]',
          'camera: String [0..1]',
          'iso: Int [0..1]',
          'shutter: String [0..1]',
          'aperture: String [0..1]',
          'lens: String [0..1]',
          'focalLength: String [0..1]',
          'createdAt: DateTime  {now()}',
        ]} />

        <ClassBox x={540} y={20} w={270} stereo="«TypeScript» src/types" name="Photo" attrs={[
          'id: string',
          'url: string [0..1]',
          'ratio: string [0..1]',
          'category: string [0..1]',
          'prominentColor: string [0..1]',
        ]} />

        <ClassBox x={540} y={196} w={270} stereo="«TypeScript» src/types" name="PhotoMeta" attrs={[
          'camera · lens · focalLength',
          'aperture · shutterSpeed · iso',
          'date · location · descriptor',
          '(all optional)',
        ]} />

        {/* Server row → site type, as a dependency through the API */}
        <path className="edge dashed accent" d="M290 96 H540" markerEnd="url(#cls-accent)" />
        <text className="label accent-text halo" x={415} y={86} textAnchor="middle">GET /api/photos  «JSON»</text>
        <text className="muted halo" x={415} y={114} textAnchor="middle">mapPhoto() in src/lib/api.ts</text>

        {/* Photo ◆— meta: PhotoMeta */}
        <path className="diamond" d="M675 156 L681 165 L675 174 L669 165 Z" />
        <path className="edge" d="M675 174 V196" markerEnd="url(#cls-arrow)" />
        <text className="muted" x={686} y={190}>meta 0..1</text>
      </svg>
    </DiagramFigure>
  )
}

/** One participant at the top of the sequence diagram, with its lifeline. */
function Lifeline({ cx, lines, bottom }: { cx: number; lines: string[]; bottom: number }) {
  const w = 104
  return (
    <g>
      <rect className="part" x={cx - w / 2} y={34} width={w} height={44} rx={3} />
      {lines.map((line, i) => (
        <text key={line} className="name" x={cx} y={lines.length === 1 ? 60 : 52 + i * 15} textAnchor="middle">{line}</text>
      ))}
      <path className="lifeline" d={`M${cx} 78 V${bottom}`} />
    </g>
  )
}

/**
 * Sequence diagram of adding photos: the laptop copies originals to the Mac
 * mini over Tailscale, a chokidar watcher queues each finished JPEG, and
 * processPhoto() turns them, one at a time, into a WebP plus a database row.
 * Mirrors startWatcher and processPhoto in the photo server's code.
 */
export function PhotoPipelineDiagram() {
  // Lifeline x positions.
  const LAPTOP = 70, INBOX = 210, WATCH = 340, PROC = 470, DB = 600, OLLAMA = 712, OUT = 818
  const BOTTOM = 630

  const call = (from: number, to: number, y: number, label: string, cls = '') => (
    <g>
      <path className={`edge ${cls}`} d={`M${from} ${y} H${to}`} markerEnd={`url(#seq-${cls === 'accent' ? 'accent' : 'arrow'})`} />
      <text className={`label halo ${cls === 'accent' ? 'accent-text' : ''}`} x={(from + to) / 2} y={y - 7} textAnchor="middle">{label}</text>
    </g>
  )
  const reply = (from: number, to: number, y: number, label: string) => (
    <g>
      <path className="edge dashed" d={`M${from} ${y} H${to}`} markerEnd="url(#seq-open)" />
      <text className="muted halo" x={(from + to) / 2} y={y - 6} textAnchor="middle">{label}</text>
    </g>
  )
  const self = (x: number, y: number, label: string) => (
    <g>
      <path className="edge" d={`M${x + 5} ${y} H${x + 32} V${y + 14} H${x + 7}`} markerEnd="url(#seq-arrow)" />
      <text className="label halo" x={x + 40} y={y + 11}>{label}</text>
    </g>
  )

  return (
    <DiagramFigure caption="UML sequence diagram: sending photos from my laptop to the Mac mini over Tailscale, and how each one is processed">
      <svg className="uml block w-full h-auto min-w-[700px]" viewBox="0 0 880 650" role="img" aria-labelledby="seq-title seq-desc">
        <title id="seq-title">Adding photos from the laptop</title>
        <desc id="seq-desc">
          The laptop copies original photos into ~/photos/unprocessed on the Mac mini with rsync or scp over SSH, across the
          Tailscale network. A chokidar watcher on that folder fires once a file has stopped changing for two seconds, and
          queues it if it is a .jpg or .jpeg. The queue hands files to processPhoto one at a time. For each, processPhoto checks
          PostgreSQL for an existing entry; if one exists it deletes the original and skips it. Otherwise it reads the EXIF
          data with exifr, finds the top five colors with sharp, asks Ollama’s llava model for a description, category and
          tags, encodes a WebP of at most 350 KB into ~/photos/processed, deletes the original, and creates the photo’s row in
          PostgreSQL.
        </desc>
        <Markers id="seq" />

        {/* Everything right of the laptop runs on the Mac mini. */}
        <rect className="frame" x={148} y={10} width={728} height={630} rx={6} />
        <text className="stereo" x={160} y={26}>«device» Mac mini</text>

        <Lifeline cx={LAPTOP} lines={['Laptop']} bottom={BOTTOM} />
        <Lifeline cx={INBOX} lines={['~/photos/', 'unprocessed']} bottom={BOTTOM} />
        <Lifeline cx={WATCH} lines={['watcher', '(chokidar)']} bottom={BOTTOM} />
        <Lifeline cx={PROC} lines={['processPhoto()']} bottom={BOTTOM} />
        <Lifeline cx={DB} lines={['PostgreSQL']} bottom={BOTTOM} />
        <Lifeline cx={OLLAMA} lines={['Ollama', '(llava)']} bottom={BOTTOM} />
        <Lifeline cx={OUT} lines={['~/photos/', 'processed']} bottom={BOTTOM} />

        {call(LAPTOP, INBOX, 112, 'rsync / scp over SSH', 'accent')}
        <text className="muted accent-text halo" x={(LAPTOP + INBOX) / 2} y={128} textAnchor="middle">Tailscale tailnet</text>

        {call(INBOX, WATCH, 160, '‘add’ event')}
        <text className="muted halo" x={(INBOX + WATCH) / 2} y={176} textAnchor="middle">after 2 s unchanged</text>
        {self(WATCH, 186, 'queue it (.jpg / .jpeg only)')}

        {/* processPhoto is active from the moment the queue hands it a file. */}
        <rect className="activation" x={PROC - 5} y={232} width={10} height={380} />
        {call(WATCH, PROC - 5, 232, 'processPhoto(file)')}
        <text className="muted halo" x={(WATCH + PROC) / 2} y={248} textAnchor="middle">one at a time</text>

        {call(PROC + 5, DB, 268, 'findFirst(filename)')}
        {reply(DB, PROC + 5, 292, 'existing?')}

        {/* alt: already processed vs. new */}
        <rect className="frame" x={162} y={306} width={700} height={312} />
        <path className="frame-tag" d="M162 306 H198 V318 L190 326 H162 Z" />
        <text className="stereo" x={169} y={320}>alt</text>
        <text className="muted halo" x={214} y={322}>[already in database]</text>
        {call(PROC - 5, INBOX, 346, 'delete original · skip')}
        <path className="divider" d="M162 362 H862" />
        <text className="muted halo" x={170} y={378}>[new photo]</text>

        {self(PROC, 392, 'exifr: read EXIF')}
        {self(PROC, 428, 'sharp: top 5 colors')}

        {call(PROC + 5, OLLAMA, 482, 'describe · categorize · tag')}
        {reply(OLLAMA, PROC + 5, 506, 'JSON')}

        {call(PROC + 5, OUT, 546, 'sharp: WebP ≤ 350 KB (quality search)')}
        {call(PROC - 5, INBOX, 574, 'delete original')}
        {call(PROC + 5, DB, 602, 'photo.create(…)')}
      </svg>
    </DiagramFigure>
  )
}
