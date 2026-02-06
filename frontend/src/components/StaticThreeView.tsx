import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const StaticThreeView: React.FC = () => {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth || 400;
    const height = mount.clientHeight || 300;

    // Scene
    const scene = new THREE.Scene();

    // Camera: tuned for a mostly frontal, slightly right-offset view matching reference image
    const camera = new THREE.PerspectiveCamera(48, width / height, 0.1, 1000);
    camera.position.set(0.9, 1.25, 6.2);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    mount.appendChild(renderer.domElement);

    // Controls (interactive): allow user orbit + limited zoom, constrain vertical tilt to keep frontal feel
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableRotate = false;
    controls.enableZoom = false;
    controls.enablePan = false; // keep model centered
    controls.minDistance = 4.8; // prevent clipping in
    controls.maxDistance = 7.5; // avoid getting too far
    controls.maxPolarAngle = Math.PI / 2.1; // restrict to slightly above horizon
    controls.minPolarAngle = Math.PI / 3.2; // avoid looking too top-down
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.rotateSpeed = 0.6;

    // Lights (hemisphere + subtle directional for depth)
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.2);
    hemiLight.position.set(0, 8, 0);
    scene.add(hemiLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);

    scene.fog = new THREE.Fog(new THREE.Color(0x2e2e2e), 8, 18);

    // Load model
    const loader = new GLTFLoader();
    let modelGroup: THREE.Group | null = null;
    loader.load(
      "/indian_furniture.glb",
      (gltf) => {
        const model = gltf.scene as THREE.Group;

        // Uniform scale (adjusted slightly bigger for visual weight)
        model.scale.set(0.25, 0.25, 0.25);

        // Center model using bounding box so it sits nicely in view
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        model.position.sub(center); // move pivot to geometric center

        // Lift slightly so it doesn't look cut off at bottom
        // model.position.y -= box.min.y ;
        model.position.y += 0.8; // compensate for scaled min y

        // Subtle rotation for a hint of depth (close to frontal)
        model.rotation.y = Math.PI / 18;

        scene.add(model);
        modelGroup = model;

        // Update controls target & camera look at center (raise target for vertical centering)
        controls.target.set(0, 0.75, 0);
        camera.lookAt(controls.target);
      },
      undefined,
      (error) => {
        console.error("Error loading model:", error);
      }
    );

    let reqId = 0;
    const animate = () => {
      reqId = requestAnimationFrame(animate);
      if (modelGroup) {
        modelGroup.rotation.y += 0.01; // Auto-rotate on Y-axis
      }
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

  return (
    <div
      ref={mountRef}
      // allow pointer interaction for OrbitControls (remove pointer-events-none)
      className="w-full h-96 md:h-[600px] flex items-center justify-center select-none"
    />
  );
};

export default StaticThreeView;
