import React, { Suspense, useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

const heroModelUrl = '/models/farmer_robot.glb';

function RobotModel({ animState = 'idle', onWaveComplete }) {
  const { scene, animations } = useGLTF(heroModelUrl);
  const modelRef = useRef();
  const { actions } = useAnimations(animations, modelRef);
  
  const waveTimeRef = useRef(0);
  const isWavingRef = useRef(false);

  // Clone scene & compute exact center bounds
  const clonedScene = useMemo(() => {
    const clone = scene.clone(true);
    const box = new THREE.Box3().setFromObject(clone);
    const center = box.getCenter(new THREE.Vector3());
    
    // Shift mesh so center of bounding box sits at origin (0, 0, 0)
    clone.position.set(-center.x, -center.y, -center.z);
    return clone;
  }, [scene]);

  // Animation Actions Controller (supports embedded GLTF actions)
  useEffect(() => {
    if (animState === 'wave' || animState === 'greeting') {
      isWavingRef.current = true;
      waveTimeRef.current = 0;
    }

    if (actions && Object.keys(actions).length > 0) {
      let actionName = 'Idle breathing';
      if (animState === 'wave' || animState === 'greeting') actionName = 'Hand wave greeting';
      if (animState === 'nod') actionName = 'Small head nod';
      if (animState === 'point' || animState === 'pointRight') actionName = 'Point towards login cards';
      if (animState === 'celebrate') actionName = 'Celebrate animation';

      const targetAction = actions[actionName] || actions['Idle breathing'] || Object.values(actions)[0];
      if (targetAction) {
        Object.values(actions).forEach(a => a?.fadeOut(0.2));
        targetAction.reset().fadeIn(0.2).play();
      }
    }
  }, [animState, actions]);

  useFrame((state, delta) => {
    if (!modelRef.current) return;
    const t = state.clock.getElapsedTime();

    // STRICT FRONT-FACING STANCE
    let targetRotY = 0;
    let targetRotZ = 0;
    let targetPosY = Math.sin(t * 1.5) * 0.015;

    // Procedural wave fallback if action track is un-keyed
    if (isWavingRef.current) {
      waveTimeRef.current += delta;
      if (waveTimeRef.current < 2.0) {
        const waveFreq = Math.sin(waveTimeRef.current * 8);
        targetRotZ = waveFreq * 0.05;
        targetRotY = Math.sin(waveTimeRef.current * 3) * 0.06;
      } else {
        isWavingRef.current = false;
        waveTimeRef.current = 0;
        if (onWaveComplete) onWaveComplete();
      }
    }

    modelRef.current.rotation.y += (targetRotY - modelRef.current.rotation.y) * 0.1;
    modelRef.current.rotation.z += (targetRotZ - modelRef.current.rotation.z) * 0.1;
    modelRef.current.position.y += (targetPosY - modelRef.current.position.y) * 0.1;
  });

  return (
    <group ref={modelRef} rotation={[0, 0, 0]}>
      <primitive object={clonedScene} />
    </group>
  );
}

// Preload GLTF model
try {
  useGLTF.preload(heroModelUrl);
} catch (e) {
  // Catch preload error
}

class CanvasErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.warn('HeroModel 3D Canvas notice:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xl font-bold shadow-md">
            👨‍🌾
          </div>
          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mt-1">
            Hero AI Assistant
          </span>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function HeroModel({ animState = 'idle', onWaveComplete, className = 'w-full h-full' }) {
  return (
    <CanvasErrorBoundary>
      <div className={`relative ${className} overflow-visible pointer-events-none select-none`}>
        <Canvas
          camera={{ position: [0, 0.05, 3.2], fov: 38 }}
          gl={{ preserveDrawingBuffer: true, antialias: true, alpha: true }}
          style={{ background: 'transparent', overflow: 'visible' }}
        >
          <ambientLight intensity={1.9} />
          <directionalLight position={[4, 7, 5]} intensity={2.5} castShadow />
          <directionalLight position={[-4, -3, -3]} intensity={0.5} color="#34d399" />
          <pointLight position={[0, 1.2, 2]} intensity={1.1} color="#10b981" />

          <Suspense fallback={null}>
            <RobotModel animState={animState} onWaveComplete={onWaveComplete} />
            <ContactShadows position={[0, -1.05, 0]} opacity={0.55} scale={4.5} blur={1.8} far={3} />
          </Suspense>
        </Canvas>
      </div>
    </CanvasErrorBoundary>
  );
}
