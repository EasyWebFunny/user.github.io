import React from "react";
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const C = {
  ink: "#1e293b",
  muted: "#64748b",
  bg: "#f1f5f9",
  card: "#ffffff",
  blue: "#1d4ed8",
  violet: "#7c3aed",
  green: "#16a34a",
  amber: "#d97706",
  red: "#dc2626",
};
const FONT = "'Segoe UI', system-ui, 'DejaVu Sans', sans-serif";

const useIn = (delay = 0) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: { damping: 200 } });
};

const FadeOut: React.FC<{ dur: number; children: React.ReactNode }> = ({ dur, children }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [dur - 12, dur], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return <AbsoluteFill style={{ opacity: o }}>{children}</AbsoluteFill>;
};

const Header: React.FC<{ kicker: string; title: string }> = ({ kicker, title }) => {
  const p = useIn(0);
  return (
    <div style={{ opacity: p, transform: `translateY(${(1 - p) * 30}px)`, marginBottom: 60 }}>
      <div style={{ color: C.violet, fontSize: 30, fontWeight: 700, letterSpacing: 4, textTransform: "uppercase" }}>{kicker}</div>
      <div style={{ color: C.ink, fontSize: 72, fontWeight: 800, marginTop: 8 }}>{title}</div>
    </div>
  );
};

const Page: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ backgroundColor: C.bg, fontFamily: FONT, padding: "0 140px", justifyContent: "center" }}>{children}</AbsoluteFill>
);

// 1. Titre
const Title: React.FC = () => {
  const p = useIn(5);
  const p2 = useIn(25);
  const bar = useIn(15);
  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(135deg, ${C.blue}, ${C.violet})`,
        fontFamily: FONT,
        color: "white",
        justifyContent: "center",
        padding: "0 160px",
      }}
    >
      <div style={{ fontSize: 30, letterSpacing: 6, opacity: p, textTransform: "uppercase" }}>
        Rapport d'auto-évaluation de la performance
      </div>
      <div style={{ height: 8, width: 260 * bar, background: "white", borderRadius: 4, margin: "30px 0" }} />
      <div style={{ fontSize: 120, fontWeight: 800, opacity: p, transform: `translateY(${(1 - p) * 40}px)` }}>
        DRS GAMMA — FOLON
      </div>
      <div style={{ fontSize: 48, marginTop: 20, opacity: p2 }}>T1 2026 · Janvier – Mars 2026</div>
      <div style={{ fontSize: 26, marginTop: 70, opacity: p2 * 0.85 }}>
        FBP / Achat Stratégique en Santé · STASS · Ministère de la Santé, Côte d'Ivoire
      </div>
    </AbsoluteFill>
  );
};

// 2. Chiffres clés
const Stat: React.FC<{ label: string; value: string; sub?: string; delay: number; color: string }> = ({ label, value, sub, delay, color }) => {
  const p = useIn(delay);
  return (
    <div
      style={{
        background: C.card,
        borderRadius: 24,
        padding: "40px 44px",
        flex: 1,
        borderTop: `10px solid ${color}`,
        boxShadow: "0 10px 30px rgba(30,41,59,0.08)",
        opacity: p,
        transform: `translateY(${(1 - p) * 50}px)`,
      }}
    >
      <div style={{ fontSize: 80, fontWeight: 800, color }}>{value}</div>
      <div style={{ fontSize: 32, color: C.ink, fontWeight: 600, marginTop: 6 }}>{label}</div>
      {sub && <div style={{ fontSize: 24, color: C.muted, marginTop: 8 }}>{sub}</div>}
    </div>
  );
};

const KeyInfo: React.FC = () => {
  const frame = useCurrentFrame();
  const pop = Math.round(interpolate(frame, [10, 60], [0, 171162], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  return (
    <Page>
      <Header kicker="Informations générales" title="La région sanitaire de FOLON" />
      <div style={{ display: "flex", gap: 36 }}>
        <Stat label="Habitants" value={pop.toLocaleString("fr-FR").replace(/ | /g, " ")} delay={5} color={C.blue} />
        <Stat label="Districts sanitaires" value="2 / 2" sub="sous FBP" delay={15} color={C.violet} />
        <Stat label="ESPC" value="35 / 49" sub="sous FBP" delay={25} color={C.amber} />
        <Stat label="EPHR / EPHD" value="1 / 1" sub="sous FBP" delay={35} color={C.green} />
      </div>
      <div style={{ fontSize: 30, color: C.muted, marginTop: 50, opacity: useIn(45) }}>
        Évaluation réalisée le 04 juin 2026 à 10h30
      </div>
    </Page>
  );
};

// 3. Ressources
const Ring: React.FC<{ got: number; total: number; label: string; delay: number; color: string; note: string }> = ({ got, total, label, delay, color, note }) => {
  const p = useIn(delay);
  const r = 120;
  const circ = 2 * Math.PI * r;
  const frac = (got / total) * p;
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", opacity: Math.min(1, p * 2) }}>
      <svg width={300} height={300} viewBox="0 0 300 300">
        <circle cx={150} cy={150} r={r} stroke="#e2e8f0" strokeWidth={28} fill="none" />
        <circle
          cx={150}
          cy={150}
          r={r}
          stroke={color}
          strokeWidth={28}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${circ * frac} ${circ}`}
          transform="rotate(-90 150 150)"
        />
        <text x={150} y={168} textAnchor="middle" fontSize={64} fontWeight={800} fill={C.ink} fontFamily={FONT}>
          {got}/{total}
        </text>
      </svg>
      <div style={{ fontSize: 40, fontWeight: 700, color: C.ink, marginTop: 20 }}>{label}</div>
      <div style={{ fontSize: 26, color: C.muted, marginTop: 10, textAlign: "center" }}>{note}</div>
    </div>
  );
};

const Resources: React.FC = () => (
  <Page>
    <Header kicker="Moyens de la DRS" title="Infrastructures, personnel, logistique" />
    <div style={{ display: "flex", gap: 40 }}>
      <Ring got={7} total={9} label="Infrastructures" delay={10} color={C.amber} note="Local logistique et archivage absents" />
      <Ring got={5} total={5} label="Ressources humaines" delay={22} color={C.green} note="Tous les postes clés pourvus" />
      <Ring got={2} total={2} label="Véhicules" delay={34} color={C.green} note="4 et 5 ans · bon état" />
    </div>
  </Page>
);

// 4. Scores par domaine
const domains = [
  { name: "Dom. 7 — Organisation & Réunions", got: 70, total: 80 },
  { name: "Dom. 3 — CMU & Monitorage", got: 40, total: 50 },
  { name: "Dom. 9 — Archivage", got: 20, total: 25 },
  { name: "Dom. 6 — SIS (partiel)", got: 43, total: 100 },
  { name: "Dom. 5 — Supervision & Qualité (partiel)", got: 55, total: 150 },
  { name: "Dom. 4 — Rapport trimestriel", got: 25, total: 75 },
];
const colorFor = (pct: number) => (pct >= 75 ? C.green : pct >= 50 ? C.amber : C.red);

const Scores: React.FC = () => (
  <Page>
    <Header kicker="Scores confirmés" title="Performance par domaine" />
    <div style={{ display: "flex", flexDirection: "column", gap: 34 }}>
      {domains.map((d, i) => {
        const p = useIn(12 + i * 10);
        const pct = (d.got / d.total) * 100;
        const col = colorFor(pct);
        return (
          <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 30, opacity: Math.min(1, p * 2) }}>
            <div style={{ width: 640, fontSize: 32, color: C.ink, fontWeight: 600 }}>{d.name}</div>
            <div style={{ flex: 1, height: 52, background: "#e2e8f0", borderRadius: 26, overflow: "hidden" }}>
              <div style={{ width: `${pct * p}%`, height: "100%", background: col, borderRadius: 26 }} />
            </div>
            <div style={{ width: 300, textAlign: "right" }}>
              <span style={{ fontSize: 44, fontWeight: 800, color: col }}>{Math.round(pct * p)} %</span>
              <span style={{ fontSize: 26, color: C.muted, marginLeft: 14 }}>
                {d.got}/{d.total}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  </Page>
);

// 5. Points à améliorer
const gaps = [
  "Rapport trimestriel non signé · exécution < 75\u00a0%",
  "Supervision intégrée : 0 / 25 pts",
  "Monitorage des activités ESPC : 0 / 10 pts",
  "Plan d'Action annuel non disponible ni signé dans les délais",
  "Local logistique et espace d'archivage absents · archives non scannées",
];
const strengths = ["TRS-ASS : 60 / 60 pts", "Évaluation qualité ETSA : 35 / 35 pts", "Rapport synthèse CMU : 40 / 40 pts"];

const Gaps: React.FC = () => (
  <Page>
    <Header kicker="Synthèse" title="Points forts et priorités" />
    <div style={{ display: "flex", gap: 50 }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 34, fontWeight: 800, color: C.green, marginBottom: 24 }}>Points forts</div>
        {strengths.map((s, i) => {
          const p = useIn(10 + i * 8);
          return (
            <div key={s} style={{ fontSize: 30, color: C.ink, whiteSpace: "nowrap", background: "#f0fdf4", borderLeft: `8px solid ${C.green}`, padding: "22px 28px", borderRadius: 14, marginBottom: 20, opacity: p, transform: `translateX(${(1 - p) * -40}px)` }}>
              {s}
            </div>
          );
        })}
      </div>
      <div style={{ flex: 1.4 }}>
        <div style={{ fontSize: 34, fontWeight: 800, color: C.red, marginBottom: 24 }}>À améliorer</div>
        {gaps.map((g, i) => {
          const p = useIn(30 + i * 8);
          return (
            <div key={g} style={{ fontSize: 30, color: C.ink, background: "#fef2f2", borderLeft: `8px solid ${C.red}`, padding: "20px 28px", borderRadius: 14, marginBottom: 18, opacity: p, transform: `translateX(${(1 - p) * 40}px)` }}>
              {g}
            </div>
          );
        })}
      </div>
    </div>
  </Page>
);

// 6. Conclusion
const Outro: React.FC = () => {
  const p = useIn(5);
  const p2 = useIn(25);
  return (
    <AbsoluteFill style={{ background: C.ink, fontFamily: FONT, color: "white", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
      <div style={{ fontSize: 34, letterSpacing: 6, textTransform: "uppercase", color: "#c4b5fd", opacity: p }}>Score global</div>
      <div style={{ fontSize: 110, fontWeight: 800, marginTop: 20, opacity: p, transform: `scale(${0.9 + 0.1 * p})` }}>
        — / 1 000 pts
      </div>
      <div style={{ fontSize: 40, marginTop: 30, opacity: p2 }}>Score final en attente · données partielles</div>
      <div style={{ fontSize: 28, marginTop: 80, opacity: p2 * 0.7 }}>DRS GAMMA — Région sanitaire de FOLON · T1 2026</div>
    </AbsoluteFill>
  );
};

const scenes: [React.FC, number][] = [
  [Title, 120],
  [KeyInfo, 150],
  [Resources, 150],
  [Scores, 240],
  [Gaps, 210],
  [Outro, 120],
];
export const RAPPORT_DURATION = scenes.reduce((a, [, d]) => a + d, 0);

export const RapportFolon: React.FC = () => {
  let from = 0;
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      {scenes.map(([Scene, dur], i) => {
        const el = (
          <Sequence key={i} from={from} durationInFrames={dur}>
            <FadeOut dur={i === scenes.length - 1 ? dur + 100 : dur}>
              <Scene />
            </FadeOut>
          </Sequence>
        );
        from += dur;
        return el;
      })}
    </AbsoluteFill>
  );
};
