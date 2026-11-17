import Figure, { FigureRow } from './Figure'

// Photos for this post live in src/assets/projects/vex-robot-structures/,
// numbered in the order they were taken.
const FOLDER = 'vex-robot-structures'

export default function VexRobotStructures() {
  return (
    <>
      <p>
        On VEX competition robots, I replaced stock structural parts with custom ones laser-cut from
        sheet plastic and metal, trading weight against rigidity wherever a subsystem needed it. On our
        larger robot I was mainly responsible for the plastic guards. The smaller robot is the one I
        mainly designed and built, so most of this post follows it from its first prototype in
        December to where it stood by March.
      </p>

      <FigureRow>
        <Figure folder={FOLDER} file="smallrobot.webp" caption="The small robot, which I designed and built" />
        <Figure folder={FOLDER} file="bigrobot.webp" caption="Our larger robot, where I was mainly responsible for the plastic guards" />
      </FigureRow>

      <h2>The prototype: black plastic</h2>
      <p>
        The first version came together in early December. Its job was to test the geometry, and
        whether the robot could actually manipulate the game object the way the design intended. So
        I built it from materials that were quick to cut: the outer shell was 3 mm black ABS, and the
        internal ball guide was 1/16" ABS sheet. It was on the field two days after the parts were
        laid out.
      </p>

      <FigureRow>
        <Figure folder={FOLDER} file="1-subassembly.webp" caption="An early subassembly, December 3" />
        <Figure folder={FOLDER} file="2-prototype-parts.webp" caption="Parts for the prototype laid out, with the black ABS shell plates, December 6" />
      </FigureRow>

      <FigureRow>
        <Figure folder={FOLDER} file="2-prototype-bench.gif" caption="Testing the prototype on the bench, December 6" />
        <Figure folder={FOLDER} file="3-prototype-field.gif" caption="The prototype on the field, December 8" />
      </FigureRow>

      <Figure folder={FOLDER} file="3-prototype-field.webp" caption="The prototype, with its black ABS shell up top" />

      <h2>Back to CAD</h2>
      <p>
        With the geometry proven, in late December I reworked the design in CAD into a production
        version, keeping the same layout but changing what it was made of.
      </p>

      <FigureRow>
        <Figure folder={FOLDER} file="4-cad-1.webp" caption="Reworking the side profile in CAD, December 27" />
        <Figure folder={FOLDER} file="4-cad-2.webp" caption="The full side view" />
      </FigureRow>

      <h2>Cutting the production parts</h2>
      <p>
        The production version kept the prototype’s dimensions and upgraded the materials:
      </p>
      <ul>
        <li>
          <strong>Internal ball guide:</strong> 1/16" ABS became 1/16" aluminum. Same size, but much
          more rigid and stronger.
        </li>
        <li>
          <strong>Outer shell:</strong> 3 mm black ABS became 4 mm white polypropylene. Polypropylene
          is less brittle than ABS, so it stands up better to impacts, and I thickened the walls
          around the pockets for the same reason.
        </li>
      </ul>
      <p>I cut the new parts on January 10.</p>

      <Figure folder={FOLDER} file="5-aluminum-plates.webp" caption={'The internal ball guides, cut from 1/16" aluminum, January 10'} />

      <FigureRow>
        <Figure folder={FOLDER} file="5-laser-cutter.webp" caption="Plates on the laser cutter" />
        <Figure folder={FOLDER} file="5-laser-cutting.webp" caption="A freshly cut polypropylene plate" />
      </FigureRow>

      <h2>The final robot</h2>
      <p>
        {/* TODO: how the final version performed compared with the prototype. */}
        The production version was assembled by January 11, a day after its plates were cut, and
        fully wired by January 19.
      </p>

      <Figure folder={FOLDER} file="6-final-front.webp" caption="The production version with its white polypropylene shell, January 11" />

      <FigureRow>
        <Figure folder={FOLDER} file="6-final-side.webp" caption="The other side, with an air tank mounted" />
        <Figure folder={FOLDER} file="6-final-arm.webp" caption="With the front mechanism lowered" />
      </FigureRow>

      <FigureRow>
        <Figure folder={FOLDER} file="7-wired.webp" caption="Fully wired, January 19" />
        <Figure folder={FOLDER} file="7-air-tanks.webp" caption="With both air tanks mounted" />
      </FigureRow>

      <Figure folder={FOLDER} file="8-march.webp" caption="The robot in March, with its team plates on" />

      <h2>How I approached the parts</h2>
      <p>
        <strong>Choosing materials.</strong> Rather than one stock material for everything, I chose the
        material and thickness for each part based on the loads it actually carried. On the small
        robot that meant aluminum where the ball guide needed stiffness, and polypropylene where the
        shell needed to survive impacts.
      </p>
      <p>
        <strong>Cutting weight, keeping stiffness.</strong> I cut lightening pockets into low-stress
        regions to remove mass without giving up stiffness. Where parts were twisted under load, I added
        gussets and laminated layers instead.
      </p>
      <p>
        <strong>Staying compatible.</strong> I matched hole patterns to the VEX grid, so the custom
        parts stayed compatible with off-the-shelf hardware and could be swapped in mid-build.
      </p>
    </>
  )
}
