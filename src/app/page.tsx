'use client';
import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { Clock, ShoppingCart } from 'lucide-react';
import EcoDashboard from './components/EcoDashboard';

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

function ItemCard({ item, simulatedOffsetMinutes, onReserveSuccess }: { item: any, simulatedOffsetMinutes: number, onReserveSuccess: (receipt: any) => void }) {
  const [currentPrice, setCurrentPrice] = useState(item.currentPrice);
  const [prevPrice, setPrevPrice] = useState(item.currentPrice);
  const [isReserving, setIsReserving] = useState(false);

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
      {item.imageUrl && (
        <div style={{ height: '200px', width: '100%', overflow: 'hidden', borderRadius: 'var(--radius-md)' }}>
          <img src={item.imageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      )}
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

      <button 
        className="btn-primary" 
        onClick={async () => {
          setIsReserving(true);
          try {
            const res = await fetch('/api/reserve', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ itemId: item.id, quantity: 1, lockedPrice: currentPrice })
            });
            if (res.ok) {
              const resData = await res.json();
              onReserveSuccess(resData.data);
            } else {
              alert('Lỗi: Không thể giữ chỗ (có thể đã hết hàng).');
            }
          } catch (e) {
            alert('Lỗi kết nối.');
          } finally {
            setIsReserving(false);
          }
        }}
        disabled={isReserving}
        style={{ marginTop: 'auto', display: 'flex', justifyContent: 'center', gap: '0.5rem', opacity: isReserving ? 0.7 : 1 }}
      >
        <ShoppingCart size={18} /> {isReserving ? 'Đang xử lý...' : 'Giữ chỗ ngay'}
      </button>
    </div>
  );
}

export default function StorefrontPage() {
  const { data, isLoading, mutate } = useSWR('/api/items', fetcher, { refreshInterval: 5000 });
  const [simulatedOffsetMinutes, setSimulatedOffsetMinutes] = useState(0);
  const [activeReceipt, setActiveReceipt] = useState<any>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptTimeLeft, setReceiptTimeLeft] = useState<number>(0);

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('activeReceipt');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (new Date(parsed.expiresAt).getTime() > Date.now()) {
          setActiveReceipt(parsed);
        } else {
          localStorage.removeItem('activeReceipt');
        }
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    if (!activeReceipt) return;
    const interval = setInterval(() => {
      const expiresAt = new Date(activeReceipt.expiresAt).getTime();
      const left = Math.max(0, Math.floor((expiresAt - Date.now()) / 60000));
      setReceiptTimeLeft(left);
      if (left === 0) {
        alert("Đã hết thời gian giữ chỗ!");
        setActiveReceipt(null);
        setShowReceipt(false);
        localStorage.removeItem('activeReceipt');
        mutate();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [activeReceipt, mutate]);

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '100px' }}>
      <header style={{ padding: '2rem 1rem', textAlign: 'center', borderBottom: '1px solid var(--color-border)', marginBottom: '2rem', position: 'relative' }}>
        <h1 style={{ color: 'var(--color-primary)', display: 'inline-block', position: 'relative' }}>
          Clearance Sale
          <span className="pulse-glow" style={{ position: 'absolute', top: -5, right: -15, width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }}></span>
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', marginTop: '0.5rem' }}>Giá giảm từng phút. Chốt deal trước khi hết hàng!</p>
        
        {activeReceipt && !showReceipt && (
          <button 
            onClick={() => setShowReceipt(true)} 
            className="btn-primary" 
            style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--color-success)' }}
          >
            🎫 Xem mã: {activeReceipt.pickupCode}
          </button>
        )}
      </header>

      <main className="container">
        <EcoDashboard view="storefront" />
        {showReceipt && activeReceipt ? (
          <div className="glass-card" style={{ padding: '2rem', maxWidth: '400px', margin: '0 auto', textAlign: 'center', border: '2px solid var(--color-primary)' }}>
            <h2 style={{ color: 'var(--color-primary-light)', marginBottom: '1rem' }}>🎉 Đặt chỗ thành công</h2>
            <div style={{ background: 'var(--color-surface)', padding: '1.5rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
              <p style={{ color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Mã nhận hàng của bạn</p>
              <h1 style={{ fontSize: '3rem', margin: '0', color: 'var(--color-primary)' }}>{activeReceipt.pickupCode}</h1>
            </div>
            
            <div style={{ textAlign: 'left', marginBottom: '1.5rem', padding: '1rem', background: 'var(--color-surface-elevated)', borderRadius: 'var(--radius-sm)' }}>
              <p><strong>Món:</strong> Lô hàng #{activeReceipt.clearanceItemId} (x{activeReceipt.quantity})</p>
              <p><strong>Giá chốt:</strong> {activeReceipt.lockedPrice.toLocaleString('vi-VN')}đ</p>
              <p><strong>Địa chỉ:</strong> Tiệm bánh Arbiter, 123 Hackathon St.</p>
            </div>

            <div style={{ padding: '1rem', background: receiptTimeLeft > 5 ? 'var(--color-warning)' : 'var(--color-error)', color: '#000', borderRadius: 'var(--radius-md)', fontWeight: 'bold' }}>
              ⏳ Vui lòng đến nhận hàng trong: {receiptTimeLeft} phút
            </div>
            
            <button onClick={() => setShowReceipt(false)} className="btn-primary" style={{ marginTop: '1.5rem', width: '100%' }}>
              Trở về trang chủ
            </button>
          </div>
        ) : isLoading ? (
          <p style={{ textAlign: 'center' }}>Đang tải hàng...</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {data?.data?.map((item: any) => (
              <ItemCard key={item.id} item={item} simulatedOffsetMinutes={simulatedOffsetMinutes} onReserveSuccess={(r) => { 
                setActiveReceipt(r); 
                setShowReceipt(true); 
                localStorage.setItem('activeReceipt', JSON.stringify(r));
                mutate(); 
              }} />
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
