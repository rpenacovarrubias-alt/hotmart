import { useState } from 'react';
import { Copy, Check, Download, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatForPlatform, type ExportPlatform } from '../utils/exportFormatters';
import html2canvas from 'html2canvas';
import type { AirbnbReview } from '../types';

const PLATFORMS: {
  id: ExportPlatform;
  label: string;
  color: string;
  isImage: boolean;
  link?: string;
}[] = [
  { id: 'facebook',  label: 'Facebook',       color: '#1877f2', isImage: false },
  { id: 'instagram', label: 'Instagram',       color: '#e1306c', isImage: true  },
  { id: 'google',    label: 'Google Business', color: '#4285f4', isImage: false, link: 'https://business.google.com/' },
  { id: 'tiktok',    label: 'TikTok',          color: '#000000', isImage: true  },
  { id: 'hotmart',   label: 'Hotmart',         color: '#f04e23', isImage: false },
  { id: 'web',       label: 'Mi Sitio Web',    color: '#1F3A5F', isImage: false },
];

interface ExportModuleProps {
  reviews: AirbnbReview[];
}

export default function ExportModule({ reviews }: ExportModuleProps) {
  const { currentUser } = useAuth();
  const [copiedPlatform, setCopiedPlatform] = useState<ExportPlatform | null>(null);
  const [generatingImage, setGeneratingImage] = useState<ExportPlatform | null>(null);

  if (!currentUser || reviews.length === 0) return null;

  const handleCopy = async (platform: ExportPlatform) => {
    const text = formatForPlatform(reviews, platform);
    await navigator.clipboard.writeText(text);
    setCopiedPlatform(platform);
    setTimeout(() => setCopiedPlatform(null), 2000);
  };

  const handleGenerateImage = async (platform: ExportPlatform) => {
    const review = reviews[0];
    if (!review) return;
    setGeneratingImage(platform);
    try {
      const container = document.createElement('div');
      container.style.cssText = [
        'position:absolute', 'left:-9999px', 'top:0',
        'width:1080px', 'height:1080px',
        'background:linear-gradient(135deg,#1F3A5F 0%,#2a4f82 100%)',
        'display:flex', 'flex-direction:column',
        'align-items:center', 'justify-content:center',
        'padding:80px', 'box-sizing:border-box',
        'font-family:Georgia,serif',
      ].join(';');
      container.innerHTML = `
        <div style="font-size:52px;margin-bottom:36px;letter-spacing:10px">⭐⭐⭐⭐⭐</div>
        <p style="color:white;font-size:34px;line-height:1.65;text-align:center;font-style:italic;margin-bottom:52px;max-width:840px">
          "${review.comments.length > 220 ? review.comments.slice(0, 220) + '...' : review.comments}"
        </p>
        <p style="color:#F97316;font-size:28px;font-weight:700;margin:0">— ${review.reviewerName}</p>
        <div style="margin-top:52px;padding-top:32px;border-top:1px solid rgba(249,115,22,0.35);text-align:center;width:100%">
          <p style="color:rgba(255,255,255,0.75);font-size:22px;margin:0;font-family:sans-serif">Coanfitriones México · Hospitalidad Digital</p>
          <p style="color:rgba(255,255,255,0.45);font-size:18px;margin:10px 0 0;font-family:sans-serif">coanfitrionesmexico.com.mx</p>
        </div>
      `;
      document.body.appendChild(container);
      const canvas = await html2canvas(container, { scale: 2, useCORS: true, backgroundColor: '#1F3A5F' });
      document.body.removeChild(container);
      const link = document.createElement('a');
      link.download = `coanfitriones-review-${platform}-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } finally {
      setGeneratingImage(null);
    }
  };

  return (
    <div style={{
      background: '#FFF8F2',
      borderTop: '1px solid rgba(249,115,22,0.15)',
      padding: '24px 40px',
    }}>
      <p style={{
        fontSize: '11px', fontWeight: 700, color: '#9ca3af',
        textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '14px',
      }}>
        Exportar {reviews.length} reseña{reviews.length !== 1 ? 's' : ''} a:
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
        {PLATFORMS.map((platform) => (
          <div key={platform.id} style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={() => handleCopy(platform.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '7px',
                padding: '9px 16px', borderRadius: '10px', cursor: 'pointer',
                background: platform.color, color: 'white',
                border: 'none', fontSize: '12px', fontWeight: 700,
                transition: 'transform 160ms ease-out, opacity 160ms ease-out',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
              onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.97)')}
              onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              title={`Copiar texto para ${platform.label}`}
            >
              {copiedPlatform === platform.id ? <Check size={13} /> : <Copy size={13} />}
              {platform.label}
            </button>

            {platform.isImage && (
              <button
                onClick={() => handleGenerateImage(platform.id)}
                disabled={generatingImage === platform.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: '4px',
                  padding: '9px 12px', borderRadius: '10px', cursor: 'pointer',
                  background: 'white', color: platform.color,
                  border: `1.5px solid ${platform.color}`,
                  fontSize: '11px', fontWeight: 700,
                  opacity: generatingImage === platform.id ? 0.5 : 1,
                  transition: 'opacity 150ms ease',
                }}
                title={`Descargar PNG para ${platform.label}`}
              >
                <Download size={12} />
                {generatingImage === platform.id ? '...' : 'PNG'}
              </button>
            )}

            {platform.link && (
              <a
                href={platform.link}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', gap: '4px',
                  padding: '9px 12px', borderRadius: '10px',
                  background: 'white', color: platform.color,
                  border: `1.5px solid ${platform.color}`,
                  fontSize: '11px', fontWeight: 700, textDecoration: 'none',
                }}
                title="Abrir Google Business"
              >
                <ExternalLink size={12} />
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
