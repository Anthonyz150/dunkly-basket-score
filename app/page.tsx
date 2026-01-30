"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getFromLocal } from "../lib/store";

type Stats = {
  compets: number;
  equipes: number;
  matchs: number;
  arbitres: number;
};

type Match = {
  id?: string;
  competition?: string;
  equipeA?: string;
  equipeB?: string;
  scoreA?: number;
  scoreB?: number;
};

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    compets: 0,
    equipes: 0,
    matchs: 0,
    arbitres: 0,
  });

  const [liveMatch, setLiveMatch] = useState<Match | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const c = getFromLocal<any[]>("competitions") || [];
    const e = getFromLocal<any[]>("equipes") || [];
    const m = getFromLocal<Match[]>("matchs") || [];
    const a = getFromLocal<any[]>("arbitres") || [];

    setStats({
      compets: c.length,
      equipes: e.length,
      matchs: m.length,
      arbitres: a.length,
    });

    if (m.length > 0) {
      setLiveMatch(m[0]);
    }
  }, []);

  return (
    <main className="main-content">
      <header style={{ marginBottom: "40px" }}>
        <h1>
          🏀 BasketManager{" "}
          <span style={{ fontSize: "1rem", color: "#999" }}>v1.0</span>
        </h1>
        <p>Bienvenue, Anthony. Voici l'état actuel de tes championnats.</p>
      </header>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: "20px",
          marginBottom: "40px",
        }}
      >
        <StatCard title="Compétitions" value={stats.compets} color="#e65100" />
        <StatCard title="Équipes" value={stats.equipes} color="#0277bd" />
        <StatCard title="Matchs" value={stats.matchs} color="#2e7d32" />
        <StatCard title="Arbitres" value={stats.arbitres} color="#ef6c00" />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.5fr 1fr",
          gap: "30px",
          alignItems: "start",
        }}
      >
        <section className="card">
          <h2 style={{ marginBottom: "25px" }}>ACTIONS RAPIDES</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            <ActionLink href="/matchs" icon="➕" text="Enregistrer un résultat" />
            <ActionLink href="/equipes" icon="👥" text="Inscrire une équipe" />
            <ActionLink href="/competitions" icon="🏆" text="Créer un tournoi" />
          </div>
        </section>

        {liveMatch ? (
          <section style={liveMatchContainerStyle}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <h2 style={{ color: "#ff9800", fontSize: "1.2rem", margin: 0 }}>
                DIRECT 🔴
              </h2>
              <Link
                href={`/matchs/${liveMatch.id ?? ""}`}
                style={{ color: "white", fontSize: "0.8rem" }}
              >
                Ouvrir l'e-marque
              </Link>
            </div>

            <div style={scoreBoardStyle}>
              <p style={{ fontSize: "0.8rem", color: "#ff9800" }}>
                {liveMatch.competition}
              </p>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={teamNameStyle}>{liveMatch.equipeA}</span>
                <span style={liveScoreStyle}>
                  {liveMatch.scoreA} - {liveMatch.scoreB}
                </span>
                <span style={teamNameStyle}>{liveMatch.equipeB}</span>
              </div>
            </div>
          </section>
        ) : (
          <div className="card" style={{ textAlign: "center", color: "#999", padding: "40px" }}>
            <p>Aucun match en cours actuellement.</p>
          </div>
        )}
      </div>
    </main>
  );
}

function StatCard({
  title,
  value,
  color,
}: {
  title: string;
  value: number;
  color: string;
}) {
  return (
    <div className="card" style={{ borderLeft: `6px solid ${color}` }}>
      <p style={{ fontSize: "0.9rem", color: "#666", fontWeight: 600 }}>
        {title}
      </p>
      <h3 style={{ fontSize: "2rem" }}>{value}</h3>
    </div>
  );
}

function ActionLink({
  href,
  icon,
  text,
}: {
  href: string;
  icon: string;
  text: string;
}) {
  return (
    <Link
      href={href}
      className="nav-link"
      style={{
        background: "#f8f9fa",
        color: "#333",
        border: "1px solid #eee",
        display: "flex",
        alignItems: "center",
        gap: "10px",
      }}
    >
      <span>{icon}</span> {text}
    </Link>
  );
}

const liveMatchContainerStyle = {
  background: "#111",
  padding: "25px",
  borderRadius: "20px",
  color: "white",
};

const scoreBoardStyle = { marginTop: "20px", textAlign: "center" as const };

const liveScoreStyle = {
  fontSize: "2.5rem",
  fontWeight: "900",
  color: "white",
  margin: "0 15px",
};

const teamNameStyle = { fontSize: "1rem", fontWeight: "bold", flex: 1 };
