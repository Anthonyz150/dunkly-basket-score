"use client";

export default function Loading() {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
        <div className="ball-loader" style={{ fontSize: '4rem', animation: 'bounce 0.6s infinite alternate' }}>🏀</div>
        <h2 style={{ color: '#e65100', marginTop: '20px' }}>DUNKLY CHARGE...</h2>
        <style jsx>{`
          @keyframes bounce {
            from { transform: translateY(0); }
            to { transform: translateY(-40px); }
          }
        `}</style>
      </div>
    );
  }