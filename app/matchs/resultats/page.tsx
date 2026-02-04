"use client";

import { useState, useEffect } from "react";

// ⚠️ Rappel : Pas d'import de globals.css ici, le layout s'en occupe déjà.

export default function ResultatsPage() {
  const [matchs, setMatchs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulation du chargement des données
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="results-container">
      {/* En-tête de la page */}
      <div className="page-header">
        <h1 className="page-title">✅ RÉSULTATS DES MATCHS</h1>
        <p className="page-subtitle">Consultez les scores et statistiques de la saison.</p>
      </div>

      {/* Zone de contenu principale */}
      <div className="results-content">
        {loading ? (
          <div className="loading-state">Chargement des résultats...</div>
        ) : (
          <div className="empty-state">
            <div className="icon">🏀</div>
            <h3>Aucun résultat récent</h3>
            <p>Les scores s'afficheront ici dès qu'ils seront validés par les arbitres.</p>
          </div>
        )}
      </div>

      <style jsx>{`
        .results-container {
          max-width: 1100px;
          margin: 0 auto;
          padding-top: 10px;
        }

        .page-header {
          margin-bottom: 30px;
        }

        .page-title {
          color: #111827;
          font-size: 1.75rem;
          font-weight: 900;
          margin: 0;
          letter-spacing: -0.5px;
        }

        .page-subtitle {
          color: #64748b;
          margin-top: 5px;
          font-size: 1rem;
        }

        .results-content {
          min-height: 400px;
        }

        .loading-state, .empty-state {
          background: white;
          border-radius: 16px;
          padding: 60px 20px;
          text-align: center;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }

        .empty-state .icon {
          font-size: 3rem;
          margin-bottom: 15px;
        }

        .empty-state h3 {
          margin: 0;
          color: #111827;
          font-size: 1.25rem;
        }

        .empty-state p {
          color: #64748b;
          margin-top: 8px;
        }

        /* Animation d'entrée */
        .results-container {
          animation: slideUp 0.4s ease-out;
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}