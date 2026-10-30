import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const ThreeCanvas: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 7;
    camera.position.y = 1;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Group
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // 1. Central Core: High-tech Motherboard Microchip Sphere
    const sphereGeometry = new THREE.IcosahedronGeometry(1.6, 2);
    const sphereWireframe = new THREE.WireframeGeometry(sphereGeometry);
    const wireframeLine = new THREE.LineSegments(
      sphereWireframe,
      new THREE.LineBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.6 })
    );
    mainGroup.add(wireframeLine);

    // Inner glowing sphere
    const innerGeo = new THREE.SphereGeometry(1.3, 24, 24);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0x064e3b,
      transparent: true,
      opacity: 0.35,
      wireframe: true
    });
    const innerSphere = new THREE.Mesh(innerGeo, innerMat);
    mainGroup.add(innerSphere);

    // 2. Circuit Track Nodes (E-waste chips floating in orbit)
    const chipGeometry = new THREE.BoxGeometry(0.2, 0.04, 0.2);
    const chipMaterial = new THREE.MeshBasicMaterial({ color: 0x34d399 });
    const chipCount = 18;
    const chips: THREE.Mesh[] = [];

    for (let i = 0; i < chipCount; i++) {
      const chip = new THREE.Mesh(chipGeometry, chipMaterial);
      const angle = (i / chipCount) * Math.PI * 2;
      const radius = 2.4 + (Math.sin(i * 2) * 0.3);
      chip.position.x = Math.cos(angle) * radius;
      chip.position.z = Math.sin(angle) * radius;
      chip.position.y = (Math.sin(i * 3) * 0.6);
      chip.rotation.y = angle;
      chip.rotation.x = 0.2;
      mainGroup.add(chip);
      chips.push(chip);
    }

    // 3. Orbital Circular Economy Rings
    const ringGeo1 = new THREE.RingGeometry(2.8, 2.84, 64);
    const ringMat1 = new THREE.MeshBasicMaterial({
      color: 0x059669,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.7
    });
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    ring1.rotation.x = Math.PI / 2.3;
    mainGroup.add(ring1);

    const ringGeo2 = new THREE.RingGeometry(3.2, 3.23, 64);
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: 0x14b8a6,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.4
    });
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.rotation.x = Math.PI / 1.7;
    ring2.rotation.y = Math.PI / 6;
    mainGroup.add(ring2);

    // 4. Floating Particles (Clean Gold & Silicon atoms recovered)
    const particleCount = 200;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      const rad = 2.0 + Math.random() * 2.2;

      positions[i * 3] = rad * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = rad * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = rad * Math.cos(phi);

      // Gold & Emerald green colors
      const isGold = Math.random() > 0.6;
      colors[i * 3] = isGold ? 0.98 : 0.06;
      colors[i * 3 + 1] = isGold ? 0.8 : 0.72;
      colors[i * 3 + 2] = isGold ? 0.2 : 0.5;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.045,
      vertexColors: true,
      transparent: true,
      opacity: 0.85
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    mainGroup.add(particles);

    // Subtle mouse parallax
    let mouseX = 0;
    let mouseY = 0;
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Resize observer for precise container responsiveness
    const resizeObserver = new ResizeObserver(() => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      if (newWidth > 0 && newHeight > 0) {
        camera.aspect = newWidth / newHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(newWidth, newHeight);
      }
    });
    resizeObserver.observe(container);

    // Resize handler fallback
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      if (newWidth > 0 && newHeight > 0) {
        camera.aspect = newWidth / newHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(newWidth, newHeight);
      }
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animationId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      mainGroup.rotation.y = elapsedTime * 0.2 + mouseX * 0.25;
      mainGroup.rotation.x = Math.sin(elapsedTime * 0.15) * 0.15 + mouseY * 0.2;

      ring1.rotation.z = -elapsedTime * 0.3;
      ring2.rotation.z = elapsedTime * 0.2;
      particles.rotation.y = -elapsedTime * 0.08;

      chips.forEach((chip, idx) => {
        chip.position.y += Math.sin(elapsedTime * 2 + idx) * 0.002;
      });

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      sphereGeometry.dispose();
      ringGeo1.dispose();
      ringGeo2.dispose();
      particleGeometry.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="w-full h-full min-h-[320px] lg:min-h-[380px] flex items-center justify-center relative cursor-grab active:cursor-grabbing pointer-events-auto"
      title="Interactive 3D Circular Economy Core"
    />
  );
};
