import { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";

interface BoxProps {
  text: string;
  position: [number, number, number];
  color?: string;
  width?: number;
  height?: number;
}

function Box({
  text,
  position,
  color = "rgba(255, 255, 255, 0.1)",
  width = 2,
  height = 0.5,
}: BoxProps) {
  const mesh = useRef<THREE.Mesh>(null);
  const [hovered, setHover] = useState(false);

  useFrame(() => {
    if (mesh.current) {
      mesh.current.position.z = THREE.MathUtils.lerp(
        mesh.current.position.z,
        hovered ? 0.2 : 0,
        0.1
      );
      mesh.current.scale.x = THREE.MathUtils.lerp(
        mesh.current.scale.x,
        hovered ? 1.1 : 1,
        0.1
      );
      mesh.current.scale.y = THREE.MathUtils.lerp(
        mesh.current.scale.y,
        hovered ? 1.1 : 1,
        0.1
      );
    }
  });

  return (
    <mesh
      position={position}
      ref={mesh}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
    >
      <boxGeometry args={[width, height, 0.1]} />
      <meshStandardMaterial color={color} transparent opacity={0.8} />
      <Text
        position={[0, 0, 0.06]}
        fontSize={0.2}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {text}
      </Text>
    </mesh>
  );
}

interface BackgroundBoxProps {
  position: [number, number, number];
  width: number;
  height: number;
  depth: number;
  color: string;
}

function BackgroundBox({
  position,
  width,
  height,
  depth,
  color,
}: BackgroundBoxProps) {
  return (
    <mesh position={position}>
      <boxGeometry args={[width, height, depth]} />
      <meshStandardMaterial color={color} transparent opacity={0.3} />
    </mesh>
  );
}

interface ArrowProps {
  start: THREE.Vector3;
  end: THREE.Vector3;
  color: string;
}

function Arrow({ start, end, color }: ArrowProps) {
  const direction = new THREE.Vector3().subVectors(end, start);
  const length = direction.length();

  return (
    <primitive
      object={
        new THREE.ArrowHelper(
          direction.normalize(),
          start,
          length,
          color,
          0.3,
          0.15
        )
      }
    />
  );
}

export default function Architecture() {
  const SPACING = 0.08;

  const topComponents = [
    { text: "Create Schemas", color: "rgba(0,0,0,0.4)", width: 2 },
    { text: "Attestations", color: "rgba(0,0,0,0.4)", width: 2 },
    { text: "Attached Contracts", color: "rgba(0,0,0,0.4)", width: 2 },
    { text: "Scan", color: "rgba(0,0,0,0.4)", width: 2 },
  ];

  const pallets = [
    { text: "Attestation Pallet", color: "#8a2be2", width: 2.5 },
    { text: "Smart Contracts Pallet", color: "rgba(0,0,0,0.4)", width: 2.5 },
    { text: "Balance Pallet", color: "rgba(0,0,0,0.4)", width: 2 },
    { text: "Treasury Pallet", color: "rgba(0,0,0,0.4)", width: 2 },
  ];

  const topTotalWidth = topComponents.reduce(
    (sum, comp) => sum + comp.width,
    0
  );
  let topCurrentX = -(topTotalWidth + (topComponents.length - 1) * SPACING) / 2;

  const topComponentsPositioned = topComponents.map((comp) => {
    const position: [number, number, number] = [
      topCurrentX + comp.width / 2,
      1.7,
      0,
    ];
    topCurrentX += comp.width + SPACING;
    return { ...comp, position };
  });

  const palletTotalWidth = pallets.reduce(
    (sum, pallet) => sum + pallet.width,
    0
  );
  let palletCurrentX = -(palletTotalWidth + (pallets.length - 1) * SPACING) / 2;

  const palletComponents = pallets.map((pallet) => {
    const position: [number, number, number] = [
      palletCurrentX + pallet.width / 2,
      -1.3,
      0,
    ];
    palletCurrentX += pallet.width + SPACING;
    return { ...pallet, position };
  });

  return (
    <div style={{ width: "100%", height: "100vh", position: "relative" }}>
      <div className="glass-bg"></div>
      <h2 className="title">Architecture</h2>
      <Canvas camera={{ position: [0, 0, 5] }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />

        <BackgroundBox
          position={[0, 2, -0.1]}
          width={topTotalWidth + 0.5}
          height={1.5}
          depth={0.1}
          color="#FFFFFF"
        />

        <Text position={[0, 2.5, 0]} fontSize={0.3} color="#22005C">
          Polkattest UI
        </Text>

        {topComponentsPositioned.map((comp, index) => (
          <Box
            key={`top-${index}`}
            text={comp.text}
            position={comp.position}
            color={comp.color}
            width={comp.width}
          />
        ))}

        <BackgroundBox
          position={[0, -1, -0.1]}
          width={palletTotalWidth + 0.5}
          height={1.5}
          depth={0.1}
          color="#FFFFFF"
        />

        <Text position={[0, -0.5, 0]} fontSize={0.3} color="#22005C">
          Polkattest (POP CLI Parachain)
        </Text>

        {palletComponents.map((comp, index) => (
          <Box
            key={`pallet-${index}`}
            text={comp.text}
            position={comp.position}
            color={comp.color}
            width={comp.width}
          />
        ))}

        <Arrow
          start={new THREE.Vector3(0, 0.8, 0)}
          end={new THREE.Vector3(0, 1.1, 0)}
          color="#000"
        />
        <Arrow
          start={new THREE.Vector3(0, 0.2, 0)}
          end={new THREE.Vector3(0, -0.1, 0)}
          color="#000"
        />
        <Text position={[0, 0.5, 0]} fontSize={0.3} color="#000">
          Polkadot JS API
        </Text>
      </Canvas>

      <style>
        {`
    .glass-bg {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      backdrop-filter: blur(10px) brightness(0.9);
      background: rgba(255, 255, 255, 0.1);
      z-index: 0;
    }

    .title {
      text-align: center;
      padding-top: 2rem;
      font-size: 3rem;
      background: linear-gradient(90deg, #FF2670, #7204FF);
      -webkit-background-clip: text;
      color: transparent;
      font-weight: 700;
      letter-spacing: 0.1em;
      z-index: 1;
      position: relative;
    }
  `}
      </style>
    </div>
  );
}
