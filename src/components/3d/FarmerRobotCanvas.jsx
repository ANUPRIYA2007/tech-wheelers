import React, { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls, Float, ContactShadows } from '@react-three/drei';

function RobotModel({ url }) {
  const { scene } = useGLTF(url);
  const modelRef = useRef();

  useFrame((state) => {
    if (modelRef.current) {
      modelRef.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.8) * 0.3 + 0.2;
    }
  });

  return (
    <primitive 
      ref={modelRef} 
      object={scene} 
      scale={2.4} 
      position={[0, -1.8, 0]} 
    />
  );
}

// Preload GLTF model
useGLTF.preload('/models/farmer_robot.glb');

export default function FarmerRobotCanvas({ className = 'w-full h-[380px]' }) {
  return (
    <div className={`relative ${className} rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-b from-primary-950/70 via-surface-900/90 to-surface-950 border border-primary-500/30 backdrop-blur-md`}>
      <Canvas
        camera={{ position: [0, 0, 4.2], fov: 45 }}
        gl={{ preserveDrawingBuffer: true, antialias: true }}
      >
        <ambientLight intensity={1.8} />
        <directionalLight position={[5, 10, 7]} intensity={2.2} castShadow />
        <directionalLight position={[-5, -5, -5]} intensity={0.6} color="#34d399" />
        <pointLight position={[0, 2, 2]} intensity={1.5} color="#10b981" />

        <Suspense fallback={
          <mesh>
            <boxGeometry args={[1.2, 1.8, 1]} />
            <meshStandardMaterial color="#10b981" wireframe />
          </mesh>
        }>
          <Float speed={2.5} rotationIntensity={0.2} floatIntensity={0.5}>
            <RobotModel url="/models/farmer_robot.glb" />
          </Float>
          <ContactShadows position={[0, -2.1, 0]} opacity={0.7} scale={8} blur={2} far={4} />
        </Suspense>

        <OrbitControls 
          enableZoom={false} 
          enablePan={false}
          autoRotate={false} 
          maxPolarAngle={Math.PI / 2 + 0.1}
          minPolarAngle={Math.PI / 4}
        />
      </Canvas>

      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-surface-900/90 backdrop-blur border border-emerald-500/30 text-xs text-emerald-300 font-medium flex items-center gap-2 shadow-xl">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        Meshy AI — 3D Farmer Robot
      </div>
    </div>
  );
}
