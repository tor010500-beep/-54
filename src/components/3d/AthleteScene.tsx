import React, { Suspense, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Float, Html } from '@react-three/drei';
import * as THREE from 'three';
import { AthleteModel, WorkoutMode } from './AthleteModel.tsx';
import { Loader2 } from 'lucide-react';

interface AthleteSceneProps {
  currentMode: WorkoutMode;
  speed: number;
  isPlaying: boolean;
  onRepUpdate: (reps: number) => void;
  controlsRef?: React.MutableRefObject<any>;
}

// Sports Studio Stage Podium with LED trim
const StudioPodium: React.FC = () => {
  return (
    <group position={[0, -1.0, 0]}>
      {/* Upper platform */}
      <mesh receiveShadow position={[0, -0.04, 0]}>
        <cylinderGeometry args={[1.35, 1.45, 0.08, 48]} />
        <meshStandardMaterial
          color="#0f172a"
          roughness={0.3}
          metalness={0.5}
        />
      </mesh>

      {/* Glowing Neon Lime LED Ring */}
      <mesh position={[0, -0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.22, 1.28, 48]} />
        <meshBasicMaterial color="#84cc16" side={THREE.DoubleSide} />
      </mesh>

      {/* Outer Cyan Accent Ring */}
      <mesh position={[0, -0.006, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.32, 1.34, 48]} />
        <meshBasicMaterial color="#38bdf8" side={THREE.DoubleSide} />
      </mesh>

      {/* Base tier */}
      <mesh receiveShadow position={[0, -0.12, 0]}>
        <cylinderGeometry args={[1.48, 1.58, 0.08, 48]} />
        <meshStandardMaterial
          color="#020617"
          roughness={0.6}
          metalness={0.2}
        />
      </mesh>
    </group>
  );
};

// Loading fallback
const LoadingOverlay: React.FC = () => {
  return (
    <Html center>
      <div className="flex flex-col items-center gap-3 bg-white/90 backdrop-blur-md px-5 py-4 rounded-2xl shadow-xl border border-slate-200">
        <Loader2 className="w-7 h-7 text-lime-600 animate-spin" />
        <div className="text-xs font-bold text-slate-800 tracking-wide">
          Загрузка 3D-модели тренера...
        </div>
      </div>
    </Html>
  );
};

export const AthleteScene: React.FC<AthleteSceneProps> = ({
  currentMode,
  speed,
  isPlaying,
  onRepUpdate,
  controlsRef,
}) => {
  return (
    <div className="w-full h-full relative cursor-grab active:cursor-grabbing">
      <Canvas
        shadows
        camera={{ position: [0, 0.2, 3.4], fov: 38 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.15,
        }}
      >
        {/* Studio Lighting */}
        <ambientLight intensity={1.3} />

        {/* Key Sun Light */}
        <directionalLight
          position={[2.5, 4.5, 3.5]}
          intensity={2.2}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-bias={-0.0002}
        />

        {/* Cyan Athletic Rim Light */}
        <directionalLight
          position={[-3.5, 2.5, -2.5]}
          intensity={1.8}
          color="#38bdf8"
        />

        {/* Lime Accent Glow */}
        <pointLight
          position={[1.5, -0.3, 1.5]}
          intensity={1.4}
          color="#84cc16"
          distance={5}
        />

        {/* Studio Stage */}
        <StudioPodium />

        {/* Contact Shadow on floor */}
        <ContactShadows
          position={[0, -0.99, 0]}
          opacity={0.65}
          scale={3.6}
          blur={1.8}
          far={2.5}
        />

        {/* 3D Model with Suspense */}
        <Suspense fallback={<LoadingOverlay />}>
          <AthleteModel
            currentMode={currentMode}
            speed={speed}
            isPlaying={isPlaying}
            onRepUpdate={onRepUpdate}
          />
        </Suspense>

        {/* Smooth OrbitControls */}
        <OrbitControls
          ref={controlsRef}
          enablePan={false}
          enableZoom={true}
          minDistance={2.0}
          maxDistance={4.8}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 2 - 0.02}
          dampingFactor={0.06}
          rotateSpeed={0.8}
          target={[0, 0, 0]}
        />
      </Canvas>
    </div>
  );
};
