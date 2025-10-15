import { Canvas, useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import { ContactShadows } from '@react-three/drei'

const BASE_Y = -2.22

function Box({ args = [1, 1, 1], color = '#a3b1c6', ...props }) {
  return (
    <mesh castShadow receiveShadow {...props}>
      <boxGeometry args={args} />
      <meshStandardMaterial color={color} roughness={0.9} metalness={0} flatShading />
    </mesh>
  )
}

/** A simple voxel-ish avatar: head, torso, arms, legs */
function Walker() {
  const group = useRef()
  const rArm = useRef(), lArm = useRef()
  const rLeg = useRef(), lLeg = useRef()

  // proportions (world units)
  const torsoH = 1.2, torsoW = 1.0, torsoD = 0.5
  const head = 0.7
  const armL = 1.1, armW = 0.3, armD = 0.3
  const legL = 1.2, legW = 0.35, legD = 0.35

  const hipY = legL
  const shoulderY = hipY + torsoH

  // motion controls
  const TARGET_X = -4.2       // where he should stop (left side)
  const STEP = 1.0            // units per second
  const STOP_EPS = 0.01       // snap distance
  const arrivedRef = useRef(false)
  const ampRef = useRef(1)    // 1 = full walk, 0 = fully still

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime()
    const speed = 1.6
    const swing = 0.55

    // --- move towards target, mark arrival ---
    if (!arrivedRef.current) {
      group.current.position.x = Math.min(TARGET_X, group.current.position.x + delta * STEP)
      if (TARGET_X - group.current.position.x <= STOP_EPS) {
        arrivedRef.current = true
      }
    }

    // --- ease walk amplitude to 0 when near/at target ---
    const nearTarget = TARGET_X - group.current.position.x < 0.4 || arrivedRef.current
    const ampTarget = nearTarget ? 0 : 1
    // exponential smoothing toward ampTarget (feels natural)
    ampRef.current += (ampTarget - ampRef.current) * Math.min(1, 8 * delta)
    const amp = ampRef.current

    // limb swing
    rArm.current.rotation.x = Math.sin(t * speed) * swing * amp
    lArm.current.rotation.x = Math.sin(t * speed + Math.PI) * swing * amp
    rLeg.current.rotation.x = Math.sin(t * speed + Math.PI) * swing * 0.8 * amp
    lLeg.current.rotation.x = Math.sin(t * speed) * swing * 0.8 * amp

    // --- bobbing (also scaled by amp) ---
    const baseBob = 0.02
    group.current.position.y = BASE_Y + Math.abs(Math.sin(t * speed * 2)) * baseBob * amp

    // settle to a neutral pose when fully stopped
    if (amp < 0.02) {
      rArm.current.rotation.x = 0
      lArm.current.rotation.x = 0
      rLeg.current.rotation.x = 0
      lLeg.current.rotation.x = 0
      group.current.position.y = BASE_Y
    }
  })

  return (
    <group ref={group} position={[-7, BASE_Y, 0]} scale={0.9}>
      {/* Torso */}
      <Box args={[torsoW, torsoH, torsoD]} color="#cbd5e1" position={[0, hipY + torsoH / 2, 0]} />

      {/* Head */}
      <Box args={[head, head, head]} color="#e2e8f0" position={[0, shoulderY + head / 2 + 0.05, 0]} />

      {/* Arms (pivot at shoulder, boxes offset downwards so they swing from the top) */}
      <group ref={rArm} position={[torsoW / 2 + armW / 2 + 0.05, shoulderY, 0]}>
        <Box args={[armW, armL, armD]} color="#b6c3d6" position={[0, -armL / 2, 0]} />
      </group>
      <group ref={lArm} position={[-(torsoW / 2 + armW / 2 + 0.05), shoulderY, 0]}>
        <Box args={[armW, armL, armD]} color="#b6c3d6" position={[0, -armL / 2, 0]} />
      </group>

      {/* Legs (pivot at hip) */}
      <group ref={rLeg} position={[0.22, hipY, 0]}>
        <Box args={[legW, legL, legD]} color="#9fb1c8" position={[0, -legL / 2, 0]} />
      </group>
      <group ref={lLeg} position={[-0.22, hipY, 0]}>
        <Box args={[legW, legL, legD]} color="#9fb1c8" position={[0, -legL / 2, 0]} />
      </group>
    </group>
  )
}

export default function BlockyWalker() {
  return (
    <div className="hero-3d">
      <Canvas
        shadows
        dpr={[1, 2]}
        gl={{ alpha: true }}
        camera={{ fov: 35, position: [0, 1.2, 8] }}
      >
        {/* lighting */}
        <ambientLight intensity={0.7} />
        <directionalLight 
            position={[5, 8, 5]} 
            intensity={0.9}
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
            shadow-normalBias={0.02} 
        />
        {/* avatar */}
        <Walker />
        <ContactShadows
            position={[0, BASE_Y + 0.001, 0]}  // just above the ground to avoid z-fighting
            scale={12}                           // size of the shadow plane (increase if needed)
            opacity={0.38}                       // overall darkness
            blur={2.2}                           // softness
            far={8}                              // how far it can project
            resolution={1024}                    // quality (512–2048)
            color="#0b1220"                      // a cool grey that fits your palette
        />
      </Canvas>
    </div>
  )
}
