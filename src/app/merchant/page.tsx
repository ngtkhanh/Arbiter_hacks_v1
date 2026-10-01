'use client';
import { useState } from 'react';
import useSWR from 'swr';
import { Camera, UploadCloud, CheckCircle2, Clock, Package } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function MerchantPage() {
  const [isScanning, setIsScanning] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);
  const { data: itemsData, mutate } = useSWR('/api/items', fetcher);

  // Fake base64 for demo backup mode to avoid real upload hassle
  const handleDemoBackup = async (type: 'croissant' | 'baguette') => {
    setIsScanning(true);
    setAiResult(null);

    // MOCK: In a real app we upload the real base64 image. For the hackathon demo, 
    // we bypass Gemini call sometimes or pass a real prompt to Gemini.
    // To make sure it always works, we can simulate the API call or hit our API.
    try {
      // Fake delay to show "scanning" UI
      await new Promise(r => setTimeout(r, 2000));
      
      const mockAiResult = type === 'croissant' ? {
        item_name: "Bánh Sừng Bò",
        quantity: 10,
        base_price: 25000,
        min_price: 10000,
        decay_schedule: [
          { minutes_before_close: 120, price: 25000 },
          { minutes_before_close: 90, price: 20000 },
          { minutes_before_close: 60, price: 15000 },
          { minutes_before_close: 30, price: 10000 }
        ],
        ai_rationale: "Bánh sừng bò hút ẩm nhanh sau 20h, cộng thêm tồn 10 cái là khá nhiều. Đề xuất hạ giá sâu sớm 30 phút để kích cầu xả sạch kho."
      } : {
        item_name: "Bánh Mì Baguette",
        quantity: 5,
        base_price: 15000,
        min_price: 5000,
        decay_schedule: [
          { minutes_before_close: 120, price: 15000 },
          { minutes_before_close: 60, price: 10000 },
          { minutes_before_close: 15, price: 5000 }
        ],
        ai_rationale: "Baguette tồn ít (5 cái) nhưng kén người mua giờ muộn. Giữ giá tốt tới 60 phút cuối mới giảm để tối ưu lợi nhuận."
      };

      setAiResult(mockAiResult);
    } catch (error) {
      console.error(error);
    } finally {
      setIsScanning(false);
    }
  };

  const handlePublish = async () => {
    if (!aiResult) return;
    
    await fetch('/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: aiResult.item_name,
        quantity: aiResult.quantity,
        originalPrice: aiResult.base_price,
        aiPricingStrategy: { decay_schedule: aiResult.decay_schedule },
        aiRationale: aiResult.ai_rationale
      })
    });

    setAiResult(null);
    mutate(); // Refresh list
  };

  const handleStop = async (id: number) => {
    await fetch(`/api/items/${id}`, { method: 'DELETE' });
    mutate(); // Refresh list immediately
  };

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: 'var(--color-primary)' }}>Merchant Dashboard</h1>
        <p style={{ color: 'var(--color-text-muted)' }}>AI-Powered Clearance System</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* LEFT COL: INPUT */}
        <section className="glass-card" style={{ padding: '2rem' }}>
          <h2>Scanner</h2>
          <p style={{ marginBottom: '1.5rem', color: 'var(--color-text-secondary)' }}>Upload tray photo or use Demo mode</p>
          
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
            <button 
              className="btn-primary" 
              onClick={() => handleDemoBackup('croissant')}
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
              <Camera size={18} /> Ảnh mẫu 1 (Croissant)
            </button>
            <button 
              className="btn-primary" 
              onClick={() => handleDemoBackup('baguette')}
              style={{ flex: 1, background: 'var(--color-surface-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
              <Camera size={18} /> Ảnh mẫu 2 (Baguette)
            </button>
          </div>

          {isScanning && (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--color-primary)' }}>
              <div className="pulse-glow" style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--color-primary-dark)', margin: '0 auto 1rem' }} />
              <p>🤖 AI is scanning and analyzing...</p>
            </div>
          )}

          {aiResult && !isScanning && (
            <div style={{ background: 'var(--color-surface)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
              <h3 style={{ color: 'var(--color-primary-light)', marginBottom: '1rem' }}>✅ AI Phân tích thành công</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Package size={16} /> <strong>{aiResult.item_name}</strong> (x{aiResult.quantity})
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Clock size={16} /> Đề xuất: {aiResult.base_price}đ -> {aiResult.min_price}đ
                </div>
              </div>

              <div style={{ background: 'var(--color-bg)', padding: '1rem', borderRadius: 'var(--radius-sm)', borderLeft: '4px solid var(--color-primary)', marginBottom: '1.5rem' }}>
                <p style={{ fontSize: '0.9rem', fontStyle: 'italic' }}>"{aiResult.ai_rationale}"</p>
              </div>

              <button className="btn-primary" onClick={handlePublish} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <UploadCloud size={18} /> Push to Storefront
              </button>
            </div>
          )}
        </section>

        {/* RIGHT COL: ACTIVE INVENTORY */}
        <section className="glass-card" style={{ padding: '2rem' }}>
          <h2>Active Clearance</h2>
          <p style={{ marginBottom: '1.5rem', color: 'var(--color-text-secondary)' }}>Items currently on the storefront</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {itemsData?.data?.map((item: any) => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--color-surface)', borderRadius: 'var(--radius-md)' }}>
                <div>
                  <h4 style={{ margin: 0 }}>{item.name}</h4>
                  <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Kho: {item.currentQuantity} | Gốc: {item.originalPrice}đ</span>
                </div>
                <button 
                  onClick={() => handleStop(item.id)}
                  style={{ background: 'var(--color-error)', color: 'white', padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}
                >
                  Dừng xả kho
                </button>
              </div>
            ))}
            {!itemsData?.data?.length && <p style={{ color: 'var(--color-text-muted)' }}>Kho trống.</p>}
          </div>
        </section>
      </div>
    </div>
  );
}
