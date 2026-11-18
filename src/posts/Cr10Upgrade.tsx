import Figure from './Figure'

const FOLDER = 'cr10-upgrade'

export default function Cr10Upgrade() {
  return (
    <>
      <p>
        This started as a small upgrade and turned into a full electronics overhaul. The goal was to
        add a BLTouch auto bed leveling probe to a Creality CR-10. It ended with a new motherboard,
        new stepper drivers, a touchscreen, and a custom Marlin firmware build.
      </p>

      <h2>Bricking the stock board</h2>
      <p>
        The printer still had its stock CR-10 motherboard, and supporting a BLTouch meant flashing new
        firmware onto it. The wrong firmware went on. That board has no bootloader, so there was no
        easy way to recover it, and the printer was bricked.
      </p>

      <h2>The rebuild</h2>
      <p>
        Rather than try to revive the stock board, I used the setback as a chance to overhaul the
        electronics:
      </p>
      <ul>
        <li>a BIGTREETECH SKR 3 motherboard in place of the stock board</li>
        <li>new, quieter stepper drivers</li>
        <li>a BIGTREETECH TFT35 E3 touchscreen in place of the stock knob controller</li>
        <li>the BLTouch probe that started it all</li>
      </ul>

      <Figure
        folder={FOLDER}
        file="IMG_6149.webp"
        caption="The rewired control box, with the TFT35 E3 touchscreen running a print"
      />

      <h2>Custom Marlin firmware</h2>
      <p>
        A new board in an old printer doesn’t run out of the box: the firmware has to describe the
        printer it’s driving. I configured my own Marlin build for this CR-10 on the SKR 3, then
        flashed it onto the board and adjusted it until everything worked together:
      </p>
      <ul>
        <li>probe offsets and deployment for the BLTouch</li>
        <li>mesh bed leveling</li>
        <li>stepper driver and endstop setup</li>
        <li>thermal settings</li>
      </ul>

      <h2>Testing</h2>
      <p>
        I tested the rebuild with leveling runs and first-layer test prints, repeating them until the bed
        compensated correctly across its full area.
      </p>

      <Figure folder={FOLDER} file="IMG_6159.webp" caption="The rebuilt CR-10 back in service" />
    </>
  )
}
