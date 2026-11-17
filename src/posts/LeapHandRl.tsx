import Figure, { FigureRow } from './Figure'

// Photos for this post live in src/assets/projects/leap-hand-rl/, numbered in
// the order they were taken.
const FOLDER = 'leap-hand-rl'

export default function LeapHandRl() {
  return (
    <>
      <p>
        This was the summer after my freshman year. The point wasn’t new research: it was to learn
        Linux, set up a working environment in it, and get a real robotics project running end to end.
        The project I picked was reinforcement learning on the LEAP Hand.
      </p>

      <h2>The LEAP Hand</h2>
      <p>
        The LEAP Hand comes from Kenneth Shaw, Ananye Agarwal, and Deepak Pathak at Carnegie Mellon
        University, published at RSS 2023 (<a href="https://v1.leaphand.com/" target="_blank" rel="noopener noreferrer">project page</a>).
        It’s a low-cost, anthropomorphic hand: it costs under $2,000, about an eighth of the price of
        the Allegro Hand, its closest competitor. Its kinematic structure is designed to stay as
        dexterous as possible whatever pose the fingers are in.
      </p>

      <h2>Recreating the setup</h2>
      <p>
        I didn’t design anything new here. My job was to recreate the research setup so that it ran
        correctly, and that’s where most of the learning happened: working in Linux, setting up
        virtual environments, and sorting out compatibility between all the pieces so everything ran
        the way it should. Getting the hand itself working took some debugging too, both in the wiring
        and in the Python file that runs it.
      </p>

      <p>
        Partway through I had to switch computers. I’d been working in a virtual machine, and it
        couldn’t run training, which needs a GPU. Rather than set up vSphere to get the virtual machine
        a GPU, it was simpler to install Linux as a second boot on a PC with one and carry on there.
      </p>

      <FigureRow>
        <Figure folder={FOLDER} file="3-palm-assembly.webp" caption="The palm housing during assembly, June 20" />
        <Figure folder={FOLDER} file="4-assembled-hand.webp" caption="The assembled hand, its motors connected to a laptop, June 21" />
      </FigureRow>

      <h2>Training and testing</h2>
      <p>
        Once everything was set up, the reinforcement learning itself was straightforward: I ran the
        training script, let it run, and then tested the result on the hand.
      </p>

      <Figure folder={FOLDER} file="cube.gif" caption="The hand manipulating a cube, July 2024" />
    </>
  )
}
