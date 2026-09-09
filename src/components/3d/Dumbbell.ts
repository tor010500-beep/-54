import React, { useMemo } from 'react';
import * as THREE from 'three';

interface DumbbellProps {
  weightText?: string;
}

/**
 * Creates a high-fidelity hexagonal dumbbell matching athletic fitness gear:
 * - Knurled chrome steel handle
 * - Matte dark graphite hexagonal plates
 * - Neon lime bevel accent ring matching her sports uniform
 */
export const createDumbbellMesh = (weight: string = '5 KG'): THREE.Group => {
  const group = new THREE.Group();

  // 1. Chrome steel knurled grip bar
  const gripGeo = new THREE.CylinderGeometry(0.016, 0.016, 0.17, 24);
  const gripMat = new THREE.MeshStandardMaterial({
    color: 0xd1d5db,
    metalness: 0.85,
    roughness: 0.25,
  });
  const grip = new THREE.Mesh(gripGeo, gripMat);
  grip.rotation.z = Math.PI / 2;
  grip.castShadow = true;
  group.add(grip);

  // 2. Hexagonal weight plates materials
  const plateMat = new THREE.MeshStandardMaterial({
    color: 0x18181b, // Matte slate-black
    roughness: 0.45,
    metalness: 0.35,
  });

  const accentMat = new THREE.MeshStandardMaterial({
    color: 0x84cc16, // Vibrant Lime 500 matching uniform
    roughness: 0.3,
    metalness: 0.2,
    emissive: 0x4d7c0f,
    emissiveIntensity: 0.15,
  });

  const hexPlateGeo = new THREE.CylinderGeometry(0.056, 0.056, 0.05, 6);
  const ringGeo = new THREE.TorusGeometry(0.052, 0.005, 12, 24);

  // Left plate assembly
  const leftPlate = new THREE.Mesh(hexPlateGeo, plateMat);
  leftPlate.rotation.z = Math.PI / 2;
  leftPlate.position.x = -0.095;
  leftPlate.castShadow = true;
  group.add(leftPlate);

  const leftRing = new THREE.Mesh(ringGeo, accentMat);
  leftRing.rotation.y = Math.PI / 2;
  leftRing.position.x = -0.07;
  group.add(leftRing);

  // Right plate assembly
  const rightPlate = new THREE.Mesh(hexPlateGeo, plateMat);
  rightPlate.rotation.z = Math.PI / 2;
  rightPlate.position.x = 0.095;
  rightPlate.castShadow = true;
  group.add(rightPlate);

  const rightRing = new THREE.Mesh(ringGeo, accentMat);
  rightRing.rotation.y = Math.PI / 2;
  rightRing.position.x = 0.07;
  group.add(rightRing);

  // Inner collars
  const collarGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.015, 18);
  const collarMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    metalness: 0.7,
    roughness: 0.3,
  });

  const leftCollar = new THREE.Mesh(collarGeo, collarMat);
  leftCollar.rotation.z = Math.PI / 2;
  leftCollar.position.x = -0.065;
  group.add(leftCollar);

  const rightCollar = new THREE.Mesh(collarGeo, collarMat);
  rightCollar.rotation.z = Math.PI / 2;
  rightCollar.position.x = 0.065;
  group.add(rightCollar);

  // Scale appropriate for athlete hand
  group.scale.set(0.9, 0.9, 0.9);

  return group;
};
