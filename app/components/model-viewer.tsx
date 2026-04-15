import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { STLLoader } from 'three/addons/loaders/STLLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import occtimportjs from 'occt-import-js';

type Props = { url: string; fileType: string };

export default function ModelViewer({ url, fileType }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight || 400;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7);
    scene.add(directionalLight);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Load model
    const fitCameraToObject = (object: THREE.Object3D) => {
      const box = new THREE.Box3().setFromObject(object);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const fov = camera.fov * (Math.PI / 180);
      let cameraZ = Math.abs(maxDim / (2 * Math.tan(fov / 2)));
      cameraZ *= 1.5;
      camera.position.set(center.x, center.y, center.z + cameraZ);
      controls.target.copy(center);
      camera.updateProjectionMatrix();
      controls.update();
    };

    if (fileType === 'stl') {
      new STLLoader().load(url, (geometry) => {
        const material = new THREE.MeshStandardMaterial({ color: 0x7599c4 });
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);
        fitCameraToObject(mesh);
        setLoading(false);
      });
    } else if (fileType === 'gltf' || fileType === 'glb') {
      new GLTFLoader().load(url, (gltf) => {
        scene.add(gltf.scene);
        fitCameraToObject(gltf.scene);
        setLoading(false);
      });
    } else if (fileType === 'step' || fileType === 'stp') {
      void (async () => {
        try {
          const occt = await occtimportjs({ locateFile: () => '/occt-import-js.wasm' });
          const response = await fetch(url);
          const buffer = new Uint8Array(await response.arrayBuffer());
          const result = occt.ReadStepFile(buffer, null);

          const stepGroup = new THREE.Group();

          for (const resultMesh of result.meshes) {
            const geometry = new THREE.BufferGeometry();
            geometry.setAttribute(
              'position',
              new THREE.Float32BufferAttribute(new Float32Array(resultMesh.attributes.position.array), 3),
            );

            if (resultMesh.attributes.normal) {
              geometry.setAttribute(
                'normal',
                new THREE.Float32BufferAttribute(new Float32Array(resultMesh.attributes.normal.array), 3),
              );
            }

            if (resultMesh.index) {
              geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(resultMesh.index.array), 1));
            }

            let color = 0x7599c4;
            if (resultMesh.color) {
              color = new THREE.Color(
                resultMesh.color[0],
                resultMesh.color[1],
                resultMesh.color[2],
              ).getHex();
            }

            const material = new THREE.MeshStandardMaterial({ color });
            const mesh = new THREE.Mesh(geometry, material);
            stepGroup.add(mesh);
          }

          scene.add(stepGroup);
          fitCameraToObject(stepGroup);
        } catch (error) {
          console.error('STEP 파일 로딩에 실패했습니다.', error);
        } finally {
          setLoading(false);
        }
      })();
    }

    // Animate
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Resize
    const onResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight || 400;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
      controls.dispose();
      renderer.dispose();
      container.removeChild(renderer.domElement);
    };
  }, [url, fileType]);

  return (
    <div ref={containerRef} className="relative h-full w-full overflow-hidden">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
        </div>
      )}
    </div>
  );
}
