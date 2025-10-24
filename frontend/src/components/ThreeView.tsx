import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";


const ThreeView: React.FC = () => {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth || 400;
    const height = mount.clientHeight || 300;

    // Scene
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(5, 0, 5);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    mount.appendChild(renderer.domElement);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableRotate = false;
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 3;
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Light
    const light = new THREE.HemisphereLight(0xffffff, 0x444444, 1.5);
    light.position.set(0, 20, 0);
    scene.add(light);

    // Load model
    const loader = new GLTFLoader();
    let modelGroup: THREE.Group | null = null;
    loader.load(
      "/ganesha_wooden_mask.glb",
      (gltf) => {
        const model = gltf.scene as THREE.Group;
        model.scale.set(0.15, 0.15, 0.15);
        model.position.set(0.7, 0, 0);
        model.rotation.y = Math.PI / 4;
        scene.add(model);
        modelGroup = model;
      },
      undefined,
      (error) => {
        console.error("Error loading model:", error);
      }
    );

    let reqId = 0;
    const animate = () => {
      reqId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Resize handling
    const handleResize = () => {
      if (!mount) return;
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h || 1;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      if (reqId) cancelAnimationFrame(reqId);

      controls.dispose();
      renderer.dispose();

      if (modelGroup) {
        scene.remove(modelGroup);
        modelGroup.traverse((child) => {
          // dispose geometries and materials only for Mesh objects
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            if (mesh.geometry) mesh.geometry.dispose();
            const material = mesh.material as
              | THREE.Material
              | THREE.Material[]
              | undefined;
            if (material) {
              if (Array.isArray(material)) {
                material.forEach((m) => m.dispose && m.dispose());
              } else {
                material.dispose && material.dispose();
              }
            }
          }
        });
      }

      if (mount && renderer.domElement.parentElement === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full" />;
};

export default ThreeView;
