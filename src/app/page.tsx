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
  
  // Nếu AI không trả mốc 120 (mốc khởi đầu), ta tự nhét vào để giữ đúng giá gốc lúc mới lên kệ
  if (sorted[0].minutes_before_close < 120) {
    sorted.unshift({ minutes_before_close: 120, price: basePrice });
  }
  
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
              onReserveSuccess({ ...resData.data, itemName: item.name });
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
  
  const [receipts, setReceipts] = useState<any[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [now, setNow] = useState(Date.now());

  // Load from local storage on mount and start timer
  useEffect(() => {
    const saved = localStorage.getItem('receipts');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const valid = parsed.filter((r: any) => new Date(r.expiresAt).getTime() > Date.now());
        setReceipts(valid);
      } catch (e) {}
    }

    // Lắng nghe tín hiệu từ tab Merchant (Real-time effect)
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'forceReset') {
        localStorage.removeItem('receipts');
        setReceipts([]);
        setShowCart(false);
      }
      if (e.key === 'removeReceipt' && e.newValue) {
        try {
          const { id } = JSON.parse(e.newValue);
          setReceipts(prev => {
            const updated = prev.filter(r => r.id !== id);
            localStorage.setItem('receipts', JSON.stringify(updated));
            if (updated.length === 0) setShowCart(false);
            return updated;
          });
        } catch (err) {}
      }
    };
    window.addEventListener('storage', handleStorage);

    const interval = setInterval(() => {
      setNow(Date.now());
      setReceipts(prev => {
        const currentValid = prev.filter(r => new Date(r.expiresAt).getTime() > Date.now());
        if (currentValid.length !== prev.length) {
          localStorage.setItem('receipts', JSON.stringify(currentValid));
          if (currentValid.length === 0) setShowCart(false);
        }
        return currentValid;
      });
    }, 1000);
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const handleReserveSuccess = (r: any) => {
    setReceipts(prev => {
      const updated = [...prev, r];
      localStorage.setItem('receipts', JSON.stringify(updated));
      return updated;
    });
    setShowCart(true);
    mutate(); 
  };

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '100px' }}>
      <header style={{ padding: '2rem 1rem', textAlign: 'center', borderBottom: '1px solid var(--color-border)', marginBottom: '2rem', position: 'relative' }}>
        <h1 style={{ color: 'var(--color-primary)', display: 'inline-block', position: 'relative' }}>
          Clearance Sale
          <span className="pulse-glow" style={{ position: 'absolute', top: -5, right: -15, width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }}></span>
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', marginTop: '0.5rem' }}>Giá giảm từng phút. Chốt deal trước khi hết hàng!</p>
        
        {receipts.length > 0 && !showCart && (
          <button 
            onClick={() => setShowCart(true)} 
            className="btn-primary pulse-glow" 
            style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--color-success)', border: 'none', boxShadow: '0 0 10px rgba(16, 185, 129, 0.5)' }}
          >
            🎫 Giỏ hàng ({receipts.length})
          </button>
        )}
      </header>

      <main className="container">
        <EcoDashboard view="storefront" />
        
        {showCart ? (
          <div className="glass-card" style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto', border: '2px solid var(--color-primary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ color: 'var(--color-primary-light)', margin: 0 }}>🛒 Các mã đang giữ chỗ</h2>
              <button onClick={() => setShowCart(false)} style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '2rem', cursor: 'pointer', lineHeight: 1 }}>×</button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '50vh', overflowY: 'auto', paddingRight: '0.5rem' }}>
              {receipts.map(receipt => {
                const timeLeft = Math.max(0, Math.floor((new Date(receipt.expiresAt).getTime() - now) / 60000));
                return (
                  <div key={receipt.id} style={{ background: 'var(--color-surface)', padding: '1.2rem', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--color-border)' }}>
                    <div>
                      <h3 style={{ margin: '0 0 0.3rem 0', color: 'var(--color-primary)', fontSize: '1.5rem' }}>{receipt.pickupCode}</h3>
                      <p style={{ margin: '0 0 0.2rem 0', fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--color-text-primary)' }}>{receipt.itemName || 'Sản phẩm'}</p>
                      <p style={{ margin: '0 0 0.2rem 0', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>Mã lô: #{receipt.clearanceItemId} (Số lượng: {receipt.quantity})</p>
                      <p style={{ margin: 0, fontWeight: 'bold' }}>Giá chốt: {receipt.lockedPrice.toLocaleString('vi-VN')}đ</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ padding: '0.5rem 0.8rem', background: timeLeft > 5 ? 'var(--color-warning)' : 'var(--color-error)', color: '#000', borderRadius: 'var(--radius-md)', fontWeight: 'bold', fontSize: '0.9rem' }}>
                        ⏳ Còn {timeLeft} phút
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <button onClick={() => setShowCart(false)} className="btn-primary" style={{ marginTop: '2rem', width: '100%' }}>
              Tiếp tục săn mã khác
            </button>
          </div>
        ) : isLoading ? (
          <p style={{ textAlign: 'center' }}>Đang tải hàng...</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {data?.data?.map((item: any) => (
              <ItemCard 
                key={item.id} 
                item={item} 
                simulatedOffsetMinutes={simulatedOffsetMinutes} 
                onReserveSuccess={handleReserveSuccess} 
              />
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
