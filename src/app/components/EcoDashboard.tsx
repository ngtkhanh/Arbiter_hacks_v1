"use client";

import { useEffect, useState } from "react";

interface AnalyticsData {
  impact: {
    kgFoodSaved: string;
    kgCO2Reduced: string;
  };
  topWastedItems: { name: string; quantity: number }[];
  avgClearanceSpeedMinutes: number;
}

export default function EcoDashboard({ view = "storefront" }: { view?: "storefront" | "merchant" }) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Polling every 5 seconds for real-time demo effect
    const fetchData = () => {
      fetch("/api/analytics")
        .then(res => res.json())
        .then(d => {
          setData(d);
          setLoading(false);
        })
        .catch(e => console.error(e));
    };
    
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="p-4 rounded-xl animate-pulse bg-[var(--color-surface)] border border-[var(--color-border)] h-32 mb-8"></div>;
  if (!data) return null;

  return (
    <div className="glass-card mb-8" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>
        
        {/* Eco Impact (Common for both) */}
        <div style={{ flex: '1 1 300px' }}>
          <h3 style={{ color: 'var(--color-success)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>🌍</span> Tác Động Môi Trường
          </h3>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1, background: 'var(--color-surface)', padding: '1rem', borderRadius: 'var(--radius-md)', textAlign: 'center', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--color-success)' }}>
                {data.impact.kgFoodSaved} <span style={{ fontSize: '1rem', fontWeight: 'normal', color: 'var(--color-text-muted)' }}>kg</span>
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: '0.2rem' }}>Thức ăn được cứu</div>
            </div>
            <div style={{ flex: 1, background: 'var(--color-surface)', padding: '1rem', borderRadius: 'var(--radius-md)', textAlign: 'center', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: '900', color: '#0ea5e9' }}>
                {data.impact.kgCO2Reduced} <span style={{ fontSize: '1rem', fontWeight: 'normal', color: 'var(--color-text-muted)' }}>kg</span>
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: '0.2rem' }}>CO₂ giảm thiểu</div>
            </div>
          </div>
        </div>

        {/* Merchant specific stats */}
        {view === "merchant" && (
          <div style={{ flex: '2 1 500px', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <h3 style={{ color: 'var(--color-error)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>⚠️</span> Điểm Mù (Top Ế)
              </h3>
              <div style={{ background: 'var(--color-surface)', padding: '1rem', borderRadius: 'var(--radius-md)', height: 'calc(100% - 2.5rem)' }}>
                {data.topWastedItems.length === 0 ? (
                  <div style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', textAlign: 'center', marginTop: '1rem' }}>Tuyệt vời! Không có rác thải.</div>
                ) : (
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {data.topWastedItems.map((item, i) => (
                      <li key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid var(--color-border)' }}>
                        <span style={{ color: 'var(--color-text-primary)' }}>{item.name}</span>
                        <span style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '0.1rem 0.4rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                          {item.quantity} tồn
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div style={{ flex: 1, minWidth: '200px' }}>
              <h3 style={{ color: 'var(--color-warning)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>⚡</span> Tốc Độ Giải Cứu
              </h3>
              <div style={{ background: 'var(--color-surface)', padding: '1.5rem', borderRadius: 'var(--radius-md)', height: 'calc(100% - 2.5rem)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                {data.avgClearanceSpeedMinutes === 0 ? (
                  <div style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Chưa có đơn hoàn thành</div>
                ) : (
                  <>
                    <div style={{ fontSize: '3rem', fontWeight: '900', color: 'var(--color-warning)' }}>{data.avgClearanceSpeedMinutes}</div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginTop: '0.2rem' }}>Phút / Món Hàng</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-success)', fontWeight: 'bold', marginTop: '0.5rem', background: 'rgba(16, 185, 129, 0.1)', padding: '0.2rem 0.5rem', borderRadius: '1rem' }}>
                      Nhanh gấp 5 lần thủ công!
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
