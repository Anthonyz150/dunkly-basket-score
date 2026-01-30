"use client";

import { useEffect, useState } from "react";
import { getFromLocal } from "../lib/store";

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

  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) setUser(JSON.parse(storedUser));

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

    const matchActif = m.find(
      (match) =>
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
    link.download = `backup_${date}.json`;
    link.click();
  };

  const isAdmin = user?.username === "admin";

  return (
    <div style={{ padding: 20, maxWidth: 1200, margin: "0 auto", fontFamily: "sans-serif" }}>
      <h1>DUNKLY 🏀</h1>

      <p>Compétitions: {stats.compets}</p>
      <p>Équipes: {stats.equipes}</p>
      <p>Matchs: {stats.matchs}</p>
      <p>Arbitres: {stats.arbitres}</p>

      {liveMatch ? (
        <div>
          <h2>LIVE</h2>
          <p>{liveMatch.equipeA} {liveMatch.scoreA} - {liveMatch.scoreB} {liveMatch.equipeB}</p>
        </div>
      ) : (
        <p>Aucun match en cours</p>
      )}

      {isAdmin && (
        <button onClick={exportData}>
          Export Backup
        </button>
      )}
    </div>
  );
}
