import Figure, { FigureRow } from './Figure'

const FOLDER = 'vex-robot-structures'

export default function VexRobotStructures() {
  return (
    <>
      <p>
        On VEX competition robots, I replaced stock structural parts with custom ones laser-cut
        from sheet plastic and metal. I designed and manufactured each part in-house, trading weight
        against rigidity wherever a subsystem needed it.
      </p>

      <FigureRow>
        <Figure folder={FOLDER} file="bigrobot.webp" caption="Custom plastic plates and guards on a competition robot" />
        <Figure folder={FOLDER} file="smallrobot.webp" caption="Custom plates mounted on a stock VEX frame" />
      </FigureRow>

      <h2>Choosing materials</h2>
      <p>
        Rather than one stock material for everything, I chose the material and thickness for each
        part based on the loads it actually carried.
      </p>

      <h2>Cutting weight, keeping stiffness</h2>
      <p>
        I cut lightening pockets into low-stress regions to remove mass without giving up stiffness.
        Where parts were twisted under load, I added gussets and laminated layers instead.
      </p>

      <h2>Staying compatible</h2>
      <p>
        I matched hole patterns to the VEX grid, so the custom parts stayed compatible with
        off-the-shelf hardware and could be swapped in mid-build.
      </p>

      <h2>Iterating through the season</h2>
      <p>
        Each revision got tested on the robot and then re-cut. Over the season the parts converged on
        structures that stayed rigid under impact while keeping the robot light enough to hit its
        handling targets.
      </p>
    </>
  )
}
