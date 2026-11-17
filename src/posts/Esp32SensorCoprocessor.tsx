import Figure from './Figure'

const FOLDER = 'esp32-sensor-coprocessor'

export default function Esp32SensorCoprocessor() {
  return (
    <>
      <p>
        I wanted VL53L1X time-of-flight distance sensors on the robot, but its controller has no native
        support for them. So I brought them in anyway, using an ESP32 as a dedicated sensor
        coprocessor, and then used their readings to check how well the robot’s position tracking
        holds up.
      </p>

      <h2>The coprocessor</h2>
      <p>
        The ESP32 drives the sensors over I2C, handling device addressing, configuration, and ranging
        timing. It forwards the readings to the main robot controller over a serial link. That keeps
        all the sensor I/O off the controller’s main loop, which only has to read finished
        measurements.
      </p>

      <Figure
        folder={FOLDER}
        file="IMG_9071.webp"
        caption="Bench test: the ESP32 reads the distance sensor and sends the reading over serial to the robot’s controller, which displays it"
      />

      <h2>Checking position tracking</h2>
      <p>
        The distance measurements gave me an independent reference for the robot’s position. By
        comparing the robot’s reported pose against measured distances to fixed field elements, I could
        confirm that the tracking held up over the length of a match.
      </p>
    </>
  )
}
