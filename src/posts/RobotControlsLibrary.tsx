import Figure from './Figure'
import Chart from './Chart'
// Charts copied from HAILIB's autotune docs (docs/html/autotune_*.svg).
import overviewChart from '../assets/projects/robot-controls-library/charts/autotune_overview.svg?raw'
import stepsChart from '../assets/projects/robot-controls-library/charts/autotune_steps.svg?raw'
import testsChart from '../assets/projects/robot-controls-library/charts/autotune_tests_zoom.svg?raw'

// Photos for this post go in src/assets/projects/robot-controls-library/.
// Each <Figure file="..."> below names the file it shows; until that file
// exists, `npm run dev` draws a dashed slot in its place and the built site
// skips it. Add, remove, or rename figures freely.
const FOLDER = 'robot-controls-library'

export default function RobotControlsLibrary() {
  return (
    <>
      {/* Remove once the library and this write-up are finished. Styled to match
          the blue "in-progress" status pill. */}
      <div
        role="note"
        className="mb-8 rounded-lg border border-blue-200 dark:border-blue-900/60 bg-blue-50 dark:bg-blue-900/20 px-4 py-3 text-sm text-blue-800 dark:text-blue-300"
      >
        <span className="font-medium">Work in progress.</span> This library is still being developed, so
        some of the writing, videos, and pictures here may be incomplete.
      </div>

      <p>
        LemLib is an open-source motion-control library for VEX V5 robots. I started this project as a
        rewrite of it with two goals: use less memory, and make it straightforward to integrate
        third-party sensors alongside the stock hardware. Along the way I added two features of my
        own: automatic tuning of PID constants, and automatic tracking wheel offsets.
      </p>

      <Figure folder={FOLDER} file="1-overview.webp" caption="The robot running the library" />

      <h2>Memory efficiency</h2>
      <p>
        {/* TODO: what used the most memory in LemLib, and what changed in the rewrite. */}
        In the rewrite I reworked how the library stores and manages its state to cut its memory
        footprint, leaving more room for the rest of the robot’s code.
      </p>

      <h2>Third-party sensors</h2>
      <p>
        {/* TODO: how a new sensor plugs in, and which sensors it's been used with so far. */}
        I built the library so that sensors outside the stock VEX lineup can feed into it, rather than
        limiting it to the hardware VEX ships.
      </p>

      <Figure folder={FOLDER} file="2-sensors.webp" caption="Third-party sensors mounted on the robot" />

      <h2>Auto-tuning PID constants</h2>
      <p>
        Tuning PID constants by trial and error is slow and never quite finished, so I wrote an
        autotune that measures the drivetrain and works the gains out from that. It runs in three
        stages: measure, compute, and verify. The charts below come from one real turning autotune on
        my test robot, about 14 seconds from start to finish. Driving is tuned the same way, using
        short drives forward and back in place of spins.
      </p>

      <Figure
        folder={FOLDER}
        file="autotune-setup.webp"
        caption="My setup for recording heading data for the charts below: the robot on a test mat, connected to a laptop"
      />

      <Chart
        svg={overviewChart}
        caption="The whole turning autotune: two open-loop spins to measure the drivetrain, then six verification turns"
      />

      <p>
        <strong>Measure.</strong> The robot spins in place twice at two fixed power levels, with no
        feedback. From how quickly it speeds up and how fast it ends up turning, the autotune measures
        four things: the power it takes just to overcome friction, how much speed each extra unit of
        power adds, how long the speed takes to build up, and the delay before it starts responding at
        all.
      </p>

      <Chart
        svg={stepsChart}
        caption="Turn speed during the two spins (solid) against the model fitted to them (dashed)"
      />

      <p>
        <strong>Compute.</strong> Each measurement maps onto a gain. Friction becomes a feedforward term
        that cancels it. The build-up time sets kD, which cancels the lag. The speed per unit of power and
        the delay together set kP, as high as it can go while staying critically damped, which means
        reaching the target as fast as possible without overshooting. No integral term is needed, since
        the friction term already removes the steady error that friction would otherwise leave.
      </p>

      <p>
        <strong>Verify.</strong> The model is a simplification, so I don’t trust it blindly: the gains are
        checked on the robot with real 90° turns. After each turn kP goes up if the turn landed cleanly
        and down if it overshot, and the largest kP that didn’t overshoot is kept. On this run the model
        turned out to be cautious: the search climbed from kP 0.44 to 0.91 before a turn overshot,
        cutting the turn from 1.8 s to 0.68 s.
      </p>

      <Chart
        svg={testsChart}
        caption="The six verification turns near the 90° target. Each higher kP arrives sooner; the sixth swings past and rings, so the fifth is kept"
      />

      <Figure folder={FOLDER} file="test-route.gif" caption="A test route run after auto-tuning the PID constants" />

      <h2>Tracking wheel auto offsets</h2>
      <p>
        {/* TODO: how the offsets are measured during calibration. */}
        Odometry depends on knowing exactly where each tracking wheel sits on the chassis. Rather than
        measuring those offsets by hand, I made the library calibrate them automatically.
      </p>

      <Figure folder={FOLDER} file="4-tracking-wheels.webp" caption="Tracking wheel placement" />

      <h2>What’s next</h2>
      <p>
        {/* TODO: current status and what's left. */}
        The library is still in progress, and I’ll add more here as it develops.
      </p>
    </>
  )
}
