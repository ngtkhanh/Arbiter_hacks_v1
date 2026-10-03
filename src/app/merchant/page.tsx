'use client';
import { useState, useRef } from 'react';
import useSWR from 'swr';
import { Camera, UploadCloud, CheckCircle2, Clock, Package, Image as ImageIcon } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function MerchantPage() {
  const [isScanning, setIsScanning] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: itemsData, mutate } = useSWR('/api/items', fetcher);
  const { data: ordersData, mutate: mutateOrders } = useSWR('/api/merchant/orders', fetcher, { refreshInterval: 5000 });

  // Fake base64 for demo backup mode to avoid real upload hassle
  const handleDemoBackup = async (type: 'croissant' | 'baguette') => {
    setIsScanning(true);
    setAiResult(null);
    setUploadedImage(type === 'croissant' 
      ? 'https://images.unsplash.com/photo-1549996647-190b679b33d7?auto=format&fit=crop&w=800&q=80' 
      : 'https://images.unsplash.com/photo-1597075687490-8f673c6c17f6?auto=format&fit=crop&w=800&q=80');

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

  const handleRealUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    setAiResult(null);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      setUploadedImage(base64);

      try {
        const res = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: base64.split(',')[1], mimeType: file.type })
        });
        
        if (res.ok) {
          const data = await res.json();
          if (data.data) {
            setAiResult(data.data);
          } else {
            alert('AI không nhận diện được món hàng.');
          }
        } else {
          alert('Lỗi API Analyze.');
        }
      } catch (error) {
        console.error(error);
        alert('Lỗi kết nối.');
      } finally {
        setIsScanning(false);
      }
    };
    reader.readAsDataURL(file);
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
        imageUrl: uploadedImage,
        aiPricingStrategy: { decay_schedule: aiResult.decay_schedule },
        aiRationale: aiResult.ai_rationale
      })
    });

    setAiResult(null);
    setUploadedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    mutate(); // Refresh list
  };

  const handleStop = async (id: number) => {
    await fetch(`/api/items/${id}`, { method: 'DELETE' });
    mutate(); // Refresh list immediately
  };

  const handleOrderAction = async (id: number, action: 'COMPLETED' | 'CANCELLED') => {
    await fetch(`/api/merchant/orders/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action })
    });
    mutateOrders();
    if (action === 'CANCELLED') {
      mutate(); // Refresh inventory if cancelled
    }
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
          
          <input 
            type="file" 
            accept="image/*" 
            capture="environment" 
            ref={fileInputRef} 
            style={{ display: 'none' }} 
            onChange={handleRealUpload} 
          />

          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
            <button 
              className="btn-primary" 
              onClick={() => fileInputRef.current?.click()}
              style={{ flex: 2, background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
              <Camera size={18} /> Chụp / Tải ảnh thật
            </button>
            <button 
              className="btn-primary" 
              onClick={() => handleDemoBackup('croissant')}
              style={{ flex: 1, background: 'var(--color-surface-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.5rem' }}
            >
              <ImageIcon size={18} /> Demo 1
            </button>
            <button 
              className="btn-primary" 
              onClick={() => handleDemoBackup('baguette')}
              style={{ flex: 1, background: 'var(--color-surface-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.5rem' }}
            >
              <ImageIcon size={18} /> Demo 2
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
              
              {uploadedImage && (
                <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
                  <img src={uploadedImage} alt="Scanned item" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }} />
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.3rem' }}>Tên món hàng</label>
                  <input 
                    type="text" 
                    value={aiResult.item_name} 
                    onChange={e => setAiResult({...aiResult, item_name: e.target.value})}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'white' }}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.3rem' }}>Số lượng</label>
                    <input 
                      type="number" 
                      value={aiResult.quantity} 
                      onChange={e => setAiResult({...aiResult, quantity: parseInt(e.target.value) || 0})}
                      style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'white' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.3rem' }}>Giá gốc (VNĐ)</label>
                    <input 
                      type="number" 
                      value={aiResult.base_price} 
                      onChange={e => setAiResult({...aiResult, base_price: parseInt(e.target.value) || 0})}
                      style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'white' }}
                    />
                  </div>
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

      {/* BOTTOM ROW: ORDERS KANBAN */}
      <section className="glass-card" style={{ padding: '2rem', marginTop: '2rem' }}>
        <h2>Live Orders Kanban</h2>
        <p style={{ marginBottom: '1.5rem', color: 'var(--color-text-secondary)' }}>Manage customer pickups in real-time</p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {ordersData?.data?.filter((o: any) => o.status === 'PENDING').map((order: any) => {
            const timeLeft = order.expiresAt ? Math.max(0, Math.floor((new Date(order.expiresAt).getTime() - Date.now()) / 60000)) : 0;
            return (
              <div key={order.id} style={{ background: 'var(--color-surface)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 'bold', color: 'var(--color-primary)' }}>{order.pickupCode}</span>
                  <span style={{ color: timeLeft > 5 ? 'var(--color-warning)' : 'var(--color-error)', fontSize: '0.9rem' }}>
                    ⏳ Còn {timeLeft} phút
                  </span>
                </div>
                <h3 style={{ margin: '0.5rem 0' }}>{order.customerName}</h3>
                <p style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
                  {order.clearanceItem?.name} (x{order.quantity}) - {order.lockedPrice.toLocaleString('vi-VN')}đ
                </p>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => handleOrderAction(order.id, 'COMPLETED')} className="btn-primary" style={{ flex: 1, background: 'var(--color-success)' }}>✅ Đã thanh toán</button>
                  <button onClick={() => handleOrderAction(order.id, 'CANCELLED')} className="btn-primary" style={{ flex: 1, background: 'var(--color-error)' }}>❌ Khách không đến</button>
                </div>
              </div>
            );
          })}
          {(!ordersData?.data || ordersData.data.filter((o: any) => o.status === 'PENDING').length === 0) && (
            <p style={{ color: 'var(--color-text-muted)' }}>Chưa có đơn đặt chỗ nào.</p>
          )}
        </div>
      </section>
    </div>
  );
}
