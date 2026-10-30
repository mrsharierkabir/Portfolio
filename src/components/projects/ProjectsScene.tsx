"use client";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState, type MutableRefObject } from "react";
import * as THREE from "three";
import { coverDataUrl } from "@/lib/cover";

export type SceneProject = { slug: string; title: string; category: string | null; device: "web" | "mobile"; accent: string | null; cover_url: string | null; summary: string | null; live_url?: string | null };

type Props = { projects: SceneProject[]; progress: MutableRefObject<number>; active: boolean; compact: boolean };

/* ---------- textures ---------- */
function useCover(p: SceneProject) {
  const [tex, setTex] = useState<THREE.Texture | null>(null);
  useEffect(() => {
    let alive = true;
    const mobile = p.device === "mobile";
    const W = mobile ? 800 : 1600, H = mobile ? 1600 : 1000;
    const draw = (img: HTMLImageElement) => {
      const c = document.createElement("canvas");
      c.width = W; c.height = H;
      const ctx = c.getContext("2d")!;
      const r = Math.max(W / img.width, H / img.height);
      const w = img.width * r, h = img.height * r;
      ctx.drawImage(img, (W - w) / 2, (H - h) / 2, w, h);
      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 8;
      if (alive) setTex(t);
    };
    const load = (src: string, fallback?: string) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => draw(img);
      img.onerror = () => fallback && load(fallback);
      img.src = src;
    };
    const generated = coverDataUrl(p);
    load(p.cover_url || generated, p.cover_url ? generated : undefined);
    return () => { alive = false; };
  }, [p]);
  return tex;
}

function roundedPlane(w: number, h: number, r: number) {
  const s = new THREE.Shape();
  const x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
  const g = new THREE.ShapeGeometry(s, 12);
  const uv = g.attributes.uv as THREE.BufferAttribute;
  const pos = g.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, (pos.getX(i) - x) / w, (pos.getY(i) - y) / h);
  return g;
}

/* ---------- glow sprite ---------- */
function glowTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d")!;
  const grd = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  grd.addColorStop(0, "rgba(255,255,255,1)");
  grd.addColorStop(0.35, "rgba(255,255,255,.35)");
  grd.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grd;
  g.fillRect(0, 0, 256, 256);
  const t = new THREE.CanvasTexture(c);
  return t;
}

/* ---------- a device ---------- */
function Device({ p, index, progress, radius }: { p: SceneProject; index: number; progress: MutableRefObject<number>; radius: number }) {
  const group = useRef<THREE.Group>(null);
  const screenMat = useRef<THREE.MeshBasicMaterial>(null);
  const frameMat = useRef<THREE.MeshStandardMaterial>(null);
  const tex = useCover(p);
  const mobile = p.device === "mobile";
  const W = mobile ? 1.36 : 4.3, H = mobile ? 2.8 : 2.72;
  const SW = mobile ? 1.24 : 4.18, SH = mobile ? 2.66 : 2.6;
  const screenGeo = useMemo(() => roundedPlane(SW, SH, mobile ? 0.15 : 0.04), [SW, SH, mobile]);
  const cur = useRef(index);

  useFrame((_, dt) => {
    const g = group.current;
    if (!g) return;
    cur.current += (progress.current - cur.current) * Math.min(1, dt * 6);
    const d = index - cur.current;
    const a = d * 0.72;
    const vis = Math.abs(d) < 2.4;
    g.visible = vis;
    if (!vis) return;
    g.position.set(Math.sin(a * 0.5) * 0.35, -Math.sin(a) * radius, (Math.cos(a) - 1) * radius);
    g.rotation.set(a * 0.95, Math.sin(a) * 0.18, Math.sin(a) * -0.05);
    const k = Math.min(1, Math.abs(d));
    const s = 1 - k * 0.08;
    g.scale.setScalar(s);
    if (screenMat.current) {
      screenMat.current.color.setScalar(1 - k * 0.72);
      screenMat.current.opacity = Math.max(0, 1 - k * 0.5 - Math.max(0, Math.abs(d) - 1) * 0.6);
    }
    if (frameMat.current) frameMat.current.opacity = screenMat.current?.opacity ?? 1;
    g.position.y += Math.sin(performance.now() / 1400 + index) * 0.03 * (1 - k);
  });

  return (
    <group ref={group}>
      <RoundedBox args={[W, H, mobile ? 0.14 : 0.08]} radius={mobile ? 0.2 : 0.05} smoothness={6}>
        <meshStandardMaterial ref={frameMat} color="#1d1d21" metalness={0.65} roughness={0.32} transparent />
      </RoundedBox>
      <mesh geometry={screenGeo} position={[0, mobile ? 0 : -0.02, mobile ? 0.071 : 0.041]}>
        <meshBasicMaterial ref={screenMat} map={tex ?? undefined} color={tex ? "#ffffff" : "#222"} toneMapped={false} transparent />
      </mesh>
      {mobile && <mesh position={[0, 1.2, 0.075]}><capsuleGeometry args={[0.035, 0.22, 4, 12]} /><meshBasicMaterial color="#000" /></mesh>}
    </group>
  );
}

function Rig({ projects, progress, compact }: Omit<Props, "active">) {
  const root = useRef<THREE.Group>(null);
  const glow = useRef<THREE.Mesh>(null);
  const glowTex = useMemo(() => glowTexture(), []);
  const colors = useMemo(() => projects.map((p) => new THREE.Color(p.accent || "#2F45FF")), [projects]);
  const tmp = useMemo(() => new THREE.Color(), []);
  const { pointer } = useThree();

  useFrame((_, dt) => {
    const r = root.current;
    if (!r) return;
    r.rotation.y += (pointer.x * 0.12 - r.rotation.y) * Math.min(1, dt * 3);
    r.rotation.x += (-pointer.y * 0.06 - r.rotation.x) * Math.min(1, dt * 3);
    const f = Math.max(0, Math.min(projects.length - 1, progress.current));
    const i = Math.floor(f), t = f - i;
    tmp.copy(colors[i]).lerp(colors[Math.min(colors.length - 1, i + 1)], t);
    if (glow.current) (glow.current.material as THREE.MeshBasicMaterial).color.copy(tmp);
  });

  return (
    <group position={[compact ? 0 : 1.85, compact ? 0.45 : 0, 0]} scale={compact ? 0.7 : 0.86}>
      <mesh ref={glow} position={[0, 0, -1.6]} scale={[9, 7, 1]}>
        <planeGeometry />
        <meshBasicMaterial map={glowTex} transparent opacity={0.32} depthWrite={false} toneMapped={false} />
      </mesh>
      <group ref={root}>
        {projects.map((p, i) => (
          <Device key={p.slug} p={p} index={i} progress={progress} radius={5.2} />
        ))}
      </group>
    </group>
  );
}

export default function ProjectsScene({ projects, progress, active, compact }: Props) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      frameloop={active ? "always" : "never"}
      camera={{ position: [0, 0, 9.5], fov: 30 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      aria-hidden
    >
      <ambientLight intensity={0.55} />
      <directionalLight position={[3, 4, 5]} intensity={1.4} />
      <directionalLight position={[-4, -2, 3]} intensity={0.5} color="#8ea2ff" />
      <Rig projects={projects} progress={progress} compact={compact} />
    </Canvas>
  );
}
