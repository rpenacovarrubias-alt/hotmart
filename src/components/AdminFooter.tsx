import React from 'react';

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const TiktokIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .57.04.84.13V9.5a7.21 7.21 0 0 0-1-.07 6.33 6.33 0 0 0-.25 12.66 6.33 6.33 0 0 0 6.13-5.22h.06V8.71a9.77 9.77 0 0 0 6.13 2.14V7.41a6.39 6.39 0 0 1-1.87-.72z"/>
  </svg>
);

const BlueskyIcon = () => (
  <svg viewBox="0 0 576 512" width="14" height="14" fill="currentColor">
    <path d="M407.8 29.4C379.8 82.5 328.7 182.9 288 249.7 247.3 182.9 196.2 82.5 168.2 29.4 148-9.1 88.5-9.8 61.4 27.7c-26.6 36.9-4.8 112.7 15.6 172.9 23.3 68.7 64.9 143.4 96.9 183.1 27.9 34.7 65.5 50.1 101.9 57.6-56.1 11.3-107.5 14.8-129.2 11.5-63.5-9.6-96.1-47.4-106.3-103.7-1.7-9.4-11.2-14.7-20.1-11.4L4.7 344c-9.1 3.3-13.6 13.4-10.1 22.4C17.6 427.4 67.5 486.2 150.2 505c31 7.1 72.8 8 116.8-5.3 7.8-2.4 13.8-8.2 16.5-15.8L288 471.5l4.6 12.3c2.7 7.6 8.7 13.4 16.5 15.8 44 13.3 85.8 12.4 116.8 5.3 82.7-18.9 132.6-77.7 155.6-138.6 3.5-9 1-19.1-10.1-22.4l-19.5-7.1c-8.9-3.3-18.4 2-20.1 11.4-10.2 56.3-42.8 94.1-106.3 103.7-21.7 3.3-73.1-.2-129.2-11.5 36.4-7.5 74-22.9 101.9-57.6 32-39.7 73.6-114.4 96.9-183.1 20.4-60.2 42.2-136 15.6-172.9-27.1-37.5-86.6-36.8-106.8 1.7z"/>
  </svg>
);

const AdminFooter: React.FC = () => {
  return (
    <footer style={{
      borderTop: '1px solid #E2E8F0',
      padding: '32px 0 24px',
      marginTop: '48px',
      display: 'grid',
      gridTemplateColumns: '1.2fr 0.8fr',
      gap: '16px',
      fontSize: '13px',
      color: '#64748B',
      textAlign: 'left'
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <img src="/images/hospitalidad-digital-logo.png" alt="Hospitalidad Digital Logo" style={{ height: '32px', objectFit: 'contain' }} />
          <div style={{ display: 'flex', gap: '8px' }}>
            <a href="https://facebook.com/coanfitrionesmexico" target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '50%', background: '#F1F5F9', color: '#475569' }}><FacebookIcon /></a>
            <a href="https://instagram.com/coanfitrionesmexico" target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '50%', background: '#F1F5F9', color: '#475569' }}><InstagramIcon /></a>
            <a href="https://tiktok.com/@coanfitrionesmexico" target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '50%', background: '#F1F5F9', color: '#475569' }}><TiktokIcon /></a>
            <a href="https://bluesky.com" target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '50%', background: '#F1F5F9', color: '#475569' }}><BlueskyIcon /></a>
          </div>
        </div>
        <span style={{ fontWeight: 600, color: '#1E293B', fontSize: '13px' }}>coanfitrionesmexico.com.mx</span>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', alignSelf: 'end', alignItems: 'flex-end', gap: '4px', textAlign: 'right' }}>
        <span style={{ fontWeight: 700, color: '#1E293B' }}>Tel: 4421851478</span>
        <span style={{ fontSize: '11px', color: '#64748B' }}>Este panel es confidencial y de uso exclusivo de Coanfitriones México.</span>
      </div>
    </footer>
  );
};

export default AdminFooter;
