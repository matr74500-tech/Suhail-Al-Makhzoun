import React, { useState, useRef, useEffect } from 'react';
import BarcodeScanner from './BarcodeScanner';

export default function InventoryManager() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const searchInputRef = useRef(null);

  // تركيز تلقائي على حقل البحث فور تحميل الصفحة
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  // معالجة القراءة من الكاميرا أو الماسح الخارجي
  const handleBarcodeScanned = (code) => {
    setSearchQuery(code);
    setShowScanner(false);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif', direction: 'rtl' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#2c3e50' }}>
        إدارة المخزون والبحث السريع
      </h2>

      {/* شريط البحث الذكي وزر الكاميرا */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
        <input
          ref={searchInputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="امسح الباركود أو اكتب اسم الصنف/الرمز..."
          style={{
            flex: 1,
            padding: '12px',
            fontSize: '16px',
            borderRadius: '6px',
            border: '1px solid #ccc',
            outline: 'none'
          }}
        />
        <button
          onClick={() => setShowScanner(!showScanner)}
          style={{
            padding: '12px 20px',
            backgroundColor: '#27ae60',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '15px',
            fontWeight: 'bold'
          }}
        >
          {showScanner ? 'إغلاق الكاميرا' : '📷 مسح باركود'}
        </button>
      </div>

      {/* نافذة كاميرا الباركود المنبثقة */}
      {showScanner && (
        <div style={{
          marginBottom: '20px',
          padding: '15px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          border: '1px dashed #27ae60'
        }}>
          <BarcodeScanner onScanSuccess={handleBarcodeScanned} />
        </div>
      )}

      {/* أزرار اختصار الكمية السريعة */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <span style={{ fontWeight: 'bold' }}>الكمية المطلوبة:</span>
        <button 
          onClick={() => setQuantity(Math.max(1, quantity - 1))}
          style={{ padding: '5px 15px', fontSize: '18px', cursor: 'pointer' }}
        >-</button>
        <input 
          type="number" 
          value={quantity} 
          onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
          style={{ width: '60px', textAlign: 'center', padding: '5px', fontSize: '16px' }}
        />
        <button 
          onClick={() => setQuantity(quantity + 1)}
          style={{ padding: '5px 15px', fontSize: '18px', cursor: 'pointer' }}
        >+</button>
        
        {/* أزرار اختصارات إضافة سريعة */}
        <div style={{ marginRight: '15px', display: 'flex', gap: '5px' }}>
          {[5, 10, 20].map((num) => (
            <button
              key={num}
              onClick={() => setQuantity(num)}
              style={{
                padding: '4px 8px',
                backgroundColor: '#e2e8f0',
                border: '1px solid #cbd5e1',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              +{num}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
