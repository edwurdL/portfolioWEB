import Figure, { FigureRow } from './Figure'

// Photos for this post live in src/assets/projects/custom-omni-wheels/,
// numbered in the order they were taken.
const FOLDER = 'custom-omni-wheels'

export default function CustomOmniWheels() {
  return (
    <>
      <p>
        In VEX, teams usually run VEX’s own omni wheels. I wanted wheels that spin on ball bearings
        instead, to cut down rotational friction. Getting there took three versions and one side
        experiment, starting from a fully custom wheel and ending up somewhere much simpler.
      </p>

      <h2>Why ball bearings</h2>
      <p>
        {/* TODO: where the friction was coming from in the stock wheels, and what lower friction buys on the robot. */}
        Every bit of friction in the wheels is power the motors spend fighting the drivetrain instead
        of moving the robot. Ball bearings were my way of taking rotational friction out of the wheels
        themselves.
      </p>

      <h2>Version 1: fully custom</h2>
      <p>
        The first version was a fully custom clamshell wheel. It reused the ball bearings we already
        ran on our high-strength shafts, with an adapter so they fit the imperial screws we use.
      </p>

      <FigureRow>
        <Figure folder={FOLDER} file="1-first-version.webp" caption="Version 1, December 2024: the clamshell wheel, with a shaft bearing at the hub" />
        <Figure folder={FOLDER} file="1-first-version-side.webp" caption="The same wheel from the side" />
      </FigureRow>

      <p>
        It worked, but it had two real drawbacks. It was very heavy. And the gear was printed into the
        backplate, so changing the gear ratio meant printing a whole new backplate.
      </p>

      <Figure folder={FOLDER} file="2-on-robot.webp" caption="The robot in January 2025" />

      <h2>Version 2: modular and pocketed</h2>
      <p>
        The second version went after both problems. I made the gear a separate part, so gears could
        be swapped without a new backplate, and pocketed the wheel to bring the weight down. The
        trade-off was that attaching the gear now took more heat-set inserts.
      </p>

      <Figure
        folder={FOLDER}
        file="5-weight-inserts.webp"
        caption="Version 2, pocketed, with heat-set inserts for the gear: 80.0 g"
      />

      <h2>Version 3: the hybrid</h2>
      <p>
        For the third version I stopped building the whole wheel. The hybrid uses VEX’s own wheels and
        adds a lightweight adapter with smaller bearings, so the bearings come along without the weight
        of a fully custom wheel.
      </p>

      <FigureRow>
        <Figure folder={FOLDER} file="3-bearing-insert-gear.webp" caption="Version 3: a VEX omni wheel with a printed gear and bearing adapters" />
        <Figure folder={FOLDER} file="3-bearing-insert-wheel.webp" caption="The adapters mounted at the hub" />
      </FigureRow>

      <Figure folder={FOLDER} file="3-bearing-blocks.webp" caption="The adapters, each holding a small ball bearing" />

      <FigureRow>
        <Figure folder={FOLDER} file="4-traction-wheel-insert.webp" caption="A traction wheel with a printed bearing adapter" />
        <Figure folder={FOLDER} file="4-traction-wheel-bearings.webp" caption="The traction wheel next to a bag of the bearings" />
      </FigureRow>

      <h2>A side experiment: replacing the housing</h2>
      <p>
        The last prototype I explored replaced the plastic housing of the VEX wheel entirely, so the
        bearings could sit natively in the housing instead of needing adapters. I didn’t go far down
        that route, but it proved the idea works: in principle we could swap out the housing and have
        bearings built into the wheel itself.
      </p>

      <FigureRow>
        <Figure folder={FOLDER} file="5-weight-white.webp" caption="The custom housing prototype: 64.1 g" />
        <Figure folder={FOLDER} file="5-weight-black.webp" caption="A stock VEX omni wheel for comparison: 58.6 g" />
      </FigureRow>

      <h2>Where it landed</h2>
      <p>
        For now we’re running the hybrid design. Moving to custom housings would mean taking apart
        wheels to move their rollers over, and the adapters work fine as they are.
      </p>

      <Figure folder={FOLDER} file="6-lineup.webp" caption="The versions side by side" />
    </>
  )
}
