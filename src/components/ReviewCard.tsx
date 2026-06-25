import type { AirbnbReview } from '../types';

interface ReviewCardProps {
  review: AirbnbReview;
  index: number;
}

export default function ReviewCard({ review, index }: ReviewCardProps) {
  const formattedDate = new Date(review.createdAt).toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
  });

  return (
    <article
      style={{
        background: 'white',
        borderRadius: '20px',
        padding: '28px',
        boxShadow: '0 2px 16px rgba(31,58,95,0.07)',
        border: '1px solid rgba(249,115,22,0.1)',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        opacity: 0,
        animation: `fadeSlideIn 0.5s cubic-bezier(0.23,1,0.32,1) ${index * 60}ms forwards`,
      }}
    >
      {/* Stars */}
      <div style={{ display: 'flex', gap: '3px' }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="#F97316">
            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
          </svg>
        ))}
      </div>

      {/* Review text */}
      <blockquote
        style={{
          margin: 0,
          fontSize: '15px',
          lineHeight: 1.75,
          color: '#374151',
          fontStyle: 'italic',
          fontFamily: 'Georgia, serif',
          flexGrow: 1,
        }}
      >
        "{review.comments}"
      </blockquote>

      {/* Reviewer + date */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '14px', fontWeight: 700, color: '#1F3A5F' }}>
          — {review.reviewerName}
        </span>
        <span style={{ fontSize: '11px', color: '#9ca3af' }}>{formattedDate}</span>
      </div>

      {/* Property badge */}
      {review.propertyName && (
        <div
          style={{
            fontSize: '11px',
            color: '#F97316',
            fontWeight: 600,
            background: 'rgba(249,115,22,0.08)',
            borderRadius: '8px',
            padding: '4px 12px',
            alignSelf: 'flex-start',
          }}
        >
          {review.propertyName}
        </div>
      )}
    </article>
  );
}
