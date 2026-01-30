"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getFromLocal } from "@/lib/store";

type Stats = {
  compets: number;
  equipes: number;
  matchs: number;
  arbitres: number;
};

type Match = {
  status?: string;
  scoreA?: number;
  scoreB?: number;
  equipeA?: string;
  equipeB?: string;
  competition?: string;
};

type User = {
  username?: string;
};

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    compets: 0,
    equipes: 0,
    matchs: 0,
    arbitres: 0,
  });

  const [liveMatch, setLiveMatch] = useState<Match | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) setUser(JSON.parse(storedUser));

    const c = getFromLocal("competitions") || [];
    const e = getFromLocal("equipes") || [];
    const m = getFromLocal("matchs") || [];
    const a = getFromLocal("arbitres") || [];

    setStats({
      compets: c.length,
      equipes: e.length,
      matchs: m.length,
      arbitres: a.length,
    });

    const matchActif = m.find(
      (match: Match) =>
        match.status === "en_cours" ||
        (Number(match.scoreA) + Number(match.scoreB)) > 0
    );

    if (matchActif) setLiveMatch(matchActif);
  }, []);

  const exportData = () => {
    if (typeof window === "undefined") return;

    const date = new Date().toISOString().split("T")[0];

    const data = {
      matchs: getFromLocal("matchs") || [],
      equipes: getFromLocal("equipes") || [],
      arbitres: getFromLocal("arbitres") || [],
      exportDate: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `dunkly_backup_${date}.json`;
    link.click();
  };

  const isAdmin = user?.username === "admin";

  return (
    <div style={{ padding: 20, maxWidth: 1200, margin: "0 auto", fontFamily: "sans-serif" }}>
      <header style={{ marginBottom: 30 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: "2rem" }}>🏀</span>
          <h1 style={{ margin: 0, fontSize: "1.8rem", fontWeight: 800 }}>
            DUNKLY{" "}
            <span style={{ fontSize: "0.8rem", background: "#eee", padding: "2px 8px", borderRadius: 4 }}>
              v1.0
            </span>
          </h1>
        </div>

        <div style={{ marginTop: 20 }}>
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              padding: "14px 20px",
              borderRadius: 12,
              border: "1px solid #ddd",
              fontSize: "1rem",
            }}
          />
        </div>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 15 }}>
        <StatCard title="Compétitions" value={stats.compets} color="#e65100" />
        <StatCard title="Équipes" value={stats.equipes} color="#0277bd" />
        <StatCard title="Matchs" value={stats.matchs} color="#2e7d32" />
        <StatCard title="Arbitres" value={stats.arbitres} color="#ef6c00" />
      </div>

      <section style={{ background: "#1a1a1a", color: "white", padding: 20, borderRadius: 16, marginTop: 20 }}>
        <h2 style={{ color: "#f39c12" }}>LIVE DIRECT 🏀</h2>

        {liveMatch ? (
          <div style={{ textAlign: "center" }}>
            <p style={{ color: "#aaa" }}>{liveMatch.competition}</p>
            <h3 style={{ fontSize: "2rem", color: "#f39c12" }}>
              {liveMatch.scoreA} - {liveMatch.scoreB}
            </h3>
            <p>
              {liveMatch.equipeA} vs {liveMatch.equipeB}
            </p>
          </div>
        ) : (
          <div style={{ textAlign: "center", color: "#666" }}>
            Aucun match en cours
          </div>
        )}
      </section>

      {isAdmin && (
        <button
          onClick={exportData}
          style={{
            marginTop: 20,
            padding: 15,
            background: "#fdf2f2",
            border: "1px dashed #f87171",
            borderRadius: 10,
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          📥 Export Backup
        </button>
      )}
    </div>
  );
}

function StatCard({ title, value, color }: { title: string; value: number; color: string }) {
  return (
    <div style={{ borderLeft: `6px solid ${color}`, background: "white", padding: 15, borderRadius: 12 }}>
      <p style={{ margin: 0, color: "#888", fontSize: "0.8rem", fontWeight: "bold" }}>{title}</p>
      <h3 style={{ margin: "5px 0 0", fontSize: "1.8rem", fontWeight: 800 }}>{value}</h3>
    </div>
  );
}