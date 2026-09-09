import React, { useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useGLTF, useAnimations, useTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';
import { createDumbbellMesh } from './Dumbbell.ts';

export type WorkoutMode = 'cardio' | 'curls' | 'squats' | 'warmup';

interface AthleteModelProps {
  currentMode: WorkoutMode;
  speed?: number;
  isPlaying?: boolean;
  onRepUpdate?: (reps: number) => void;
}

export const AthleteModel: React.FC<AthleteModelProps> = ({
  currentMode,
  speed = 1.0,
  isPlaying = true,
  onRepUpdate,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const gltf = useGLTF('/Michelle.glb');
  const limeTexture = useTexture('/michelle_lime.png');

  // Clone scene to prevent mutating the cached GLTF instance
  const clonedScene = useMemo(() => {
    const clone = SkeletonUtils.clone(gltf.scene);
    return clone;
  }, [gltf.scene]);

  // Extract animation actions
  const { actions, mixer } = useAnimations(gltf.animations, groupRef);

  // Store references to key Mixamo bones and base poses
  const bonesRef = useRef<{
    hips?: THREE.Bone;
    spine?: THREE.Bone;
    spine1?: THREE.Bone;
    spine2?: THREE.Bone;
    neck?: THREE.Bone;
    head?: THREE.Bone;
    leftArm?: THREE.Bone;
    leftForeArm?: THREE.Bone;
    leftHand?: THREE.Bone;
    rightArm?: THREE.Bone;
    rightForeArm?: THREE.Bone;
    rightHand?: THREE.Bone;
    leftUpLeg?: THREE.Bone;
    leftLeg?: THREE.Bone;
    leftFoot?: THREE.Bone;
    rightUpLeg?: THREE.Bone;
    rightLeg?: THREE.Bone;
    rightFoot?: THREE.Bone;
  }>({});

  const baseHipsY = useRef<number>(-102.6);
  const exerciseTime = useRef<number>(0);
  const repCycle = useRef<number>(0);
  const lastPhase = useRef<number>(0);

  // 1. Setup athletic material & textures
  useEffect(() => {
    limeTexture.flipY = false;
    limeTexture.colorSpace = THREE.SRGBColorSpace;

    clonedScene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.SkinnedMesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        if (mesh.material) {
          const mat = (mesh.material as THREE.MeshStandardMaterial).clone();
          mat.map = limeTexture;
          mat.roughness = 0.45;
          mat.metalness = 0.15;
          mat.needsUpdate = true;
          mesh.material = mat;
        }
      }
    });

    // Locate bones
    const b: typeof bonesRef.current = {};
    clonedScene.traverse((obj) => {
      if ((obj as THREE.Bone).isBone) {
        const bone = obj as THREE.Bone;
        if (bone.name === 'mixamorig:Hips') b.hips = bone;
        if (bone.name === 'mixamorig:Spine') b.spine = bone;
        if (bone.name === 'mixamorig:Spine1') b.spine1 = bone;
        if (bone.name === 'mixamorig:Spine2') b.spine2 = bone;
        if (bone.name === 'mixamorig:Neck') b.neck = bone;
        if (bone.name === 'mixamorig:Head') b.head = bone;
        if (bone.name === 'mixamorig:LeftArm') b.leftArm = bone;
        if (bone.name === 'mixamorig:LeftForeArm') b.leftForeArm = bone;
        if (bone.name === 'mixamorig:LeftHand') b.leftHand = bone;
        if (bone.name === 'mixamorig:RightArm') b.rightArm = bone;
        if (bone.name === 'mixamorig:RightForeArm') b.rightForeArm = bone;
        if (bone.name === 'mixamorig:RightHand') b.rightHand = bone;
        if (bone.name === 'mixamorig:LeftUpLeg') b.leftUpLeg = bone;
        if (bone.name === 'mixamorig:LeftLeg') b.leftLeg = bone;
        if (bone.name === 'mixamorig:LeftFoot') b.leftFoot = bone;
        if (bone.name === 'mixamorig:RightUpLeg') b.rightUpLeg = bone;
        if (bone.name === 'mixamorig:RightLeg') b.rightLeg = bone;
        if (bone.name === 'mixamorig:RightFoot') b.rightFoot = bone;
      }
    });
    bonesRef.current = b;

    if (b.hips) {
      baseHipsY.current = b.hips.position.y;
    }

    // Attach high-res 3D hexagonal dumbbells to hands
    let leftDumbbell: THREE.Group | null = null;
    let rightDumbbell: THREE.Group | null = null;

    if (b.leftHand) {
      leftDumbbell = createDumbbellMesh('5 KG');
      leftDumbbell.position.set(0.015, 0.075, 0.01);
      leftDumbbell.rotation.set(0, 0, Math.PI / 2);
      b.leftHand.add(leftDumbbell);
    }

    if (b.rightHand) {
      rightDumbbell = createDumbbellMesh('5 KG');
      rightDumbbell.position.set(-0.015, 0.075, 0.01);
      rightDumbbell.rotation.set(0, 0, -Math.PI / 2);
      b.rightHand.add(rightDumbbell);
    }

    return () => {
      if (b.leftHand && leftDumbbell) b.leftHand.remove(leftDumbbell);
      if (b.rightHand && rightDumbbell) b.rightHand.remove(rightDumbbell);
    };
  }, [clonedScene, limeTexture]);

  // 2. Manage animation playback (Cardio mode uses SambaDance clip)
  useEffect(() => {
    const samba = actions['SambaDance'];
    if (!samba) return;

    if (currentMode === 'cardio' && isPlaying) {
      samba.reset().fadeIn(0.4).play();
      samba.setEffectiveTimeScale(speed * 0.95);
    } else {
      samba.fadeOut(0.3);
    }

    return () => {
      samba?.fadeOut(0.3);
    };
  }, [currentMode, isPlaying, speed, actions]);

  // 3. Dynamic workout kinematics loop in useFrame
  useFrame((_, delta) => {
    if (!isPlaying) return;

    const safeDelta = Math.min(delta, 0.1);
    exerciseTime.current += safeDelta * speed;
    const t = exerciseTime.current;
    const b = bonesRef.current;

    // Helper lerp
    const lerp = THREE.MathUtils.lerp;

    if (currentMode === 'cardio') {
      // SambaDance is playing via mixer. We detect dance beat cycles for reps:
      const beat = Math.floor(t * 1.8);
      if (beat !== repCycle.current) {
        repCycle.current = beat;
        onRepUpdate?.(beat);
      }
      return;
    }

    // Custom procedural exercises:
    if (currentMode === 'curls') {
      // DUMBBELL BICEP CURLS & OVERHEAD REACH
      // Cycle: 2.6 seconds per rep
      const cycleFreq = 2.4;
      const phase = (t * cycleFreq) % (Math.PI * 2);

      // Detect completed rep
      if (phase < lastPhase.current) {
        repCycle.current += 1;
        onRepUpdate?.(repCycle.current);
      }
      lastPhase.current = phase;

      const curlFactor = (Math.sin(phase) + 1) * 0.5; // 0 to 1

      // Reset hips to neutral
      if (b.hips) {
        b.hips.position.y = lerp(b.hips.position.y, baseHipsY.current + curlFactor * 0.8, 0.1);
        b.hips.rotation.x = -Math.PI / 2;
        b.hips.rotation.y = 0;
        b.hips.rotation.z = 0;
      }

      // Spine posture with rhythmic breathing
      if (b.spine) {
        b.spine.rotation.x = lerp(b.spine.rotation.x, 0.04 - curlFactor * 0.06, 0.1);
        b.spine.rotation.y = lerp(b.spine.rotation.y, Math.sin(t * 1.2) * 0.02, 0.1);
      }
      if (b.spine1) {
        b.spine1.rotation.x = lerp(b.spine1.rotation.x, curlFactor * 0.03, 0.1);
      }

      // Upper arms: slight stabilization forward
      if (b.leftArm) {
        b.leftArm.rotation.x = lerp(b.leftArm.rotation.x, -0.15 - curlFactor * 0.25, 0.15);
        b.leftArm.rotation.z = lerp(b.leftArm.rotation.z, 0.08, 0.15);
      }
      if (b.rightArm) {
        b.rightArm.rotation.x = lerp(b.rightArm.rotation.x, -0.15 - curlFactor * 0.25, 0.15);
        b.rightArm.rotation.z = lerp(b.rightArm.rotation.z, -0.08, 0.15);
      }

      // Forearms: flex upward from 0 (straight down) to ~135° curl
      if (b.leftForeArm) {
        const targetCurl = -0.1 - curlFactor * 1.85;
        b.leftForeArm.rotation.x = lerp(b.leftForeArm.rotation.x, targetCurl, 0.2);
        b.leftForeArm.rotation.z = lerp(b.leftForeArm.rotation.z, 0.2, 0.2);
      }
      if (b.rightForeArm) {
        const targetCurl = -0.1 - curlFactor * 1.85;
        b.rightForeArm.rotation.x = lerp(b.rightForeArm.rotation.x, targetCurl, 0.2);
        b.rightForeArm.rotation.z = lerp(b.rightForeArm.rotation.z, -0.2, 0.2);
      }

      // Legs: slight athletic knee bounce
      if (b.leftLeg) b.leftLeg.rotation.x = lerp(b.leftLeg.rotation.x, 0.08 + curlFactor * 0.05, 0.1);
      if (b.rightLeg) b.rightLeg.rotation.x = lerp(b.rightLeg.rotation.x, 0.08 + curlFactor * 0.05, 0.1);
      if (b.leftUpLeg) b.leftUpLeg.rotation.x = lerp(b.leftUpLeg.rotation.x, -0.06, 0.1);
      if (b.rightUpLeg) b.rightUpLeg.rotation.x = lerp(b.rightUpLeg.rotation.x, -0.06, 0.1);

    } else if (currentMode === 'squats') {
      // ATHLETIC DEEP SQUATS
      // Cycle: 2.8 seconds per squat
      const squatFreq = 2.1;
      const phase = (t * squatFreq) % (Math.PI * 2);

      if (phase < lastPhase.current) {
        repCycle.current += 1;
        onRepUpdate?.(repCycle.current);
      }
      lastPhase.current = phase;

      // Squat depth (0 at top, 1 at bottom)
      const depth = (1 - Math.cos(phase)) * 0.5;

      // Hips lower down
      if (b.hips) {
        b.hips.position.y = lerp(b.hips.position.y, baseHipsY.current - depth * 14.5, 0.18);
        b.hips.position.z = lerp(b.hips.position.z, -depth * 4.0, 0.18);
        b.hips.rotation.x = -Math.PI / 2;
      }

      // Spine hinges forward for balance
      if (b.spine) {
        b.spine.rotation.x = lerp(b.spine.rotation.x, depth * 0.32, 0.18);
      }
      if (b.spine1) {
        b.spine1.rotation.x = lerp(b.spine1.rotation.x, depth * 0.15, 0.18);
      }
      if (b.head) {
        // Keep head looking up/forward
        b.head.rotation.x = lerp(b.head.rotation.x, -depth * 0.25, 0.18);
      }

      // UpLegs flex forward and slightly abduct
      if (b.leftUpLeg) {
        b.leftUpLeg.rotation.x = lerp(b.leftUpLeg.rotation.x, -depth * 0.85, 0.18);
        b.leftUpLeg.rotation.z = lerp(b.leftUpLeg.rotation.z, -0.15 - depth * 0.12, 0.18);
      }
      if (b.rightUpLeg) {
        b.rightUpLeg.rotation.x = lerp(b.rightUpLeg.rotation.x, -depth * 0.85, 0.18);
        b.rightUpLeg.rotation.z = lerp(b.rightUpLeg.rotation.z, 0.15 + depth * 0.12, 0.18);
      }

      // Knees bend
      if (b.leftLeg) {
        b.leftLeg.rotation.x = lerp(b.leftLeg.rotation.x, depth * 1.25, 0.18);
      }
      if (b.rightLeg) {
        b.rightLeg.rotation.x = lerp(b.rightLeg.rotation.x, depth * 1.25, 0.18);
      }

      // Arms hold dumbbells in front (goblet / counterbalance hold)
      if (b.leftArm) {
        b.leftArm.rotation.x = lerp(b.leftArm.rotation.x, -0.65 - depth * 0.2, 0.18);
        b.leftArm.rotation.z = lerp(b.leftArm.rotation.z, 0.25, 0.18);
      }
      if (b.rightArm) {
        b.rightArm.rotation.x = lerp(b.rightArm.rotation.x, -0.65 - depth * 0.2, 0.18);
        b.rightArm.rotation.z = lerp(b.rightArm.rotation.z, -0.25, 0.18);
      }
      if (b.leftForeArm) {
        b.leftForeArm.rotation.x = lerp(b.leftForeArm.rotation.x, -0.75, 0.18);
      }
      if (b.rightForeArm) {
        b.rightForeArm.rotation.x = lerp(b.rightForeArm.rotation.x, -0.75, 0.18);
      }

    } else if (currentMode === 'warmup') {
      // MOBILITY & WARMUP: Torso rotations, side stretches, breathing
      const cycleFreq = 1.6;
      const phase = (t * cycleFreq) % (Math.PI * 2);

      if (phase < lastPhase.current) {
        repCycle.current += 1;
        onRepUpdate?.(repCycle.current);
      }
      lastPhase.current = phase;

      const sway = Math.sin(t * 1.5);
      const armLift = (Math.sin(t * 1.8) + 1) * 0.5;

      if (b.hips) {
        b.hips.position.y = lerp(b.hips.position.y, baseHipsY.current, 0.1);
        b.hips.position.z = lerp(b.hips.position.z, 0, 0.1);
        b.hips.rotation.y = lerp(b.hips.rotation.y, sway * 0.12, 0.1);
      }

      if (b.spine) {
        b.spine.rotation.y = lerp(b.spine.rotation.y, sway * 0.22, 0.1);
        b.spine.rotation.z = lerp(b.spine.rotation.z, -sway * 0.08, 0.1);
        b.spine.rotation.x = lerp(b.spine.rotation.x, 0.02, 0.1);
      }

      if (b.head) {
        b.head.rotation.y = lerp(b.head.rotation.y, -sway * 0.15, 0.1);
      }

      // Smooth arm lateral raises
      if (b.leftArm) {
        b.leftArm.rotation.z = lerp(b.leftArm.rotation.z, 0.2 + armLift * 0.55, 0.12);
        b.leftArm.rotation.x = lerp(b.leftArm.rotation.x, -0.15, 0.12);
      }
      if (b.rightArm) {
        b.rightArm.rotation.z = lerp(b.rightArm.rotation.z, -0.2 - armLift * 0.55, 0.12);
        b.rightArm.rotation.x = lerp(b.rightArm.rotation.x, -0.15, 0.12);
      }
      if (b.leftForeArm) {
        b.leftForeArm.rotation.x = lerp(b.leftForeArm.rotation.x, -0.3, 0.12);
      }
      if (b.rightForeArm) {
        b.rightForeArm.rotation.x = lerp(b.rightForeArm.rotation.x, -0.3, 0.12);
      }

      // Gentle stance
      if (b.leftLeg) b.leftLeg.rotation.x = lerp(b.leftLeg.rotation.x, 0.05, 0.1);
      if (b.rightLeg) b.rightLeg.rotation.x = lerp(b.rightLeg.rotation.x, 0.05, 0.1);
      if (b.leftUpLeg) b.leftUpLeg.rotation.x = lerp(b.leftUpLeg.rotation.x, -0.05, 0.1);
      if (b.rightUpLeg) b.rightUpLeg.rotation.x = lerp(b.rightUpLeg.rotation.x, -0.05, 0.1);
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.98, 0]} scale={[1.18, 1.18, 1.18]}>
      <primitive object={clonedScene} />
    </group>
  );
};

// Pre-load the gltf and texture assets
useGLTF.preload('/Michelle.glb');
useTexture.preload('/michelle_lime.png');
