'use client';
import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { Clock, ShoppingCart } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then(res => res.json());

function interpolatePrice(decaySchedule: any[], minutesRemaining: number, basePrice: number, minPrice: number) {
  if (!decaySchedule || decaySchedule.length === 0) return basePrice;
  
  // Sort schedule strictly descending by minutes_before_close
  const sorted = [...decaySchedule].sort((a, b) => b.minutes_before_close - a.minutes_before_close);
  
  if (minutesRemaining >= sorted[0].minutes_before_close) return sorted[0].price;
  if (minutesRemaining <= sorted[sorted.length - 1].minutes_before_close) return sorted[sorted.length - 1].price;

  for (let i = 0; i < sorted.length - 1; i++) {
    const upper = sorted[i];
    const lower = sorted[i + 1];
    
    if (minutesRemaining <= upper.minutes_before_close && minutesRemaining >= lower.minutes_before_close) {
      const range = upper.minutes_before_close - lower.minutes_before_close;
      const progress = (upper.minutes_before_close - minutesRemaining) / range;
      const priceDiff = upper.price - lower.price;
      return Math.round(upper.price - (priceDiff * progress));
    }
  }
  return minPrice;
}

function ItemCard({ item, simulatedOffsetMinutes }: { item: any, simulatedOffsetMinutes: number }) {
  const [currentPrice, setCurrentPrice] = useState(item.currentPrice);
  const [prevPrice, setPrevPrice] = useState(item.currentPrice);

  useEffect(() => {
    const interval = setInterval(() => {
      const expiresAt = new Date(item.expiresAt).getTime();
      const now = Date.now() + (simulatedOffsetMinutes * 60 * 1000);
      const minutesRemaining = Math.max(0, (expiresAt - now) / 60000);
      
      const strategy = item.aiPricingStrategy ? JSON.parse(item.aiPricingStrategy) : null;
      if (strategy && strategy.decay_schedule) {
        const newPrice = interpolatePrice(strategy.decay_schedule, minutesRemaining, item.originalPrice, 0);
        if (newPrice !== currentPrice) {
          setPrevPrice(currentPrice);
          setCurrentPrice(newPrice);
        }
      }
    }, 1000); // Compute every second for smooth UI
    return () => clearInterval(interval);
  }, [item, simulatedOffsetMinutes, currentPrice]);

  const priceChanged = currentPrice !== prevPrice;

  return (
    <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{item.name}</h3>
        <span style={{ background: 'var(--color-primary-dark)', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)', fontSize: '0.8rem' }}>
          Còn {item.currentQuantity}
        </span>
      </div>
      
      <div style={{ margin: '1rem 0' }}>
        <p style={{ color: 'var(--color-text-muted)', textDecoration: 'line-through', fontSize: '0.9rem' }}>
          Giá gốc: {item.originalPrice.toLocaleString('vi-VN')}đ
        </p>
        <div 
          className={priceChanged ? 'price-updating' : ''} 
          style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--color-primary-light)' }}
        >
          {currentPrice.toLocaleString('vi-VN')}đ
        </div>
      </div>

      <button className="btn-primary" style={{ marginTop: 'auto', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
        <ShoppingCart size={18} /> Giữ chỗ ngay
      </button>
    </div>
  );
}

export default function StorefrontPage() {
  const { data, isLoading } = useSWR('/api/items', fetcher, { refreshInterval: 5000 });
  const [simulatedOffsetMinutes, setSimulatedOffsetMinutes] = useState(0);

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '100px' }}>
      <header style={{ padding: '2rem 1rem', textAlign: 'center', borderBottom: '1px solid var(--color-border)', marginBottom: '2rem' }}>
        <h1 style={{ color: 'var(--color-primary)', display: 'inline-block', position: 'relative' }}>
          Clearance Sale
          <span className="pulse-glow" style={{ position: 'absolute', top: -5, right: -15, width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }}></span>
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', marginTop: '0.5rem' }}>Giá giảm từng phút. Chốt deal trước khi hết hàng!</p>
      </header>

      <main className="container">
        {isLoading ? (
          <p style={{ textAlign: 'center' }}>Đang tải hàng...</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {data?.data?.map((item: any) => (
              <ItemCard key={item.id} item={item} simulatedOffsetMinutes={simulatedOffsetMinutes} />
            ))}
            {!data?.data?.length && (
              <p style={{ textAlign: 'center', gridColumn: '1 / -1', color: 'var(--color-text-muted)' }}>Chưa có món hàng nào xả kho hôm nay.</p>
            )}
          </div>
        )}
      </main>

      {/* FOOTER: TIME SIMULATOR SLIDER (FOR HACKATHON DEMO) */}
      <div style={{ 
        position: 'fixed', bottom: 0, left: 0, right: 0, 
        background: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(10px)',
        borderTop: '1px solid var(--color-border)', padding: '1rem', zIndex: 50
      }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Clock size={24} color="var(--color-warning)" />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--color-warning)' }}>[Hackathon Demo] Time Simulator</span>
              <span>+{simulatedOffsetMinutes} Phút Tương Lai</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="120" 
              value={simulatedOffsetMinutes} 
              onChange={(e) => setSimulatedOffsetMinutes(parseInt(e.target.value))}
              style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--color-warning)' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
