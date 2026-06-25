import { PAGE_SIZES, type PageSize } from '../hooks/usePagination';

interface Props {
  page: number;
  totalPages: number;
  pageSize: PageSize;
  totalItems: number;
  setPage: (p: number) => void;
  setPageSize: (s: PageSize) => void;
}

export default function PaginationBar({ page, totalPages, pageSize, totalItems, setPage, setPageSize }: Props) {
  if (totalItems === 0) return null;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 20px', borderTop: '1px solid var(--border-color)',
      fontSize: '13px', color: 'var(--text-muted)', flexWrap: 'wrap', gap: '12px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span>Mostrar:</span>
        {PAGE_SIZES.map(size => (
          <button
            key={size}
            onClick={() => setPageSize(size)}
            style={{
              padding: '4px 10px', borderRadius: '6px', border: 'none',
              cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit',
              fontWeight: pageSize === size ? 700 : 400,
              background: pageSize === size ? 'var(--primary)' : 'var(--bg-color)',
              color: pageSize === size ? 'white' : 'var(--text-muted)',
            }}
          >{size}</button>
        ))}
        <span style={{ marginLeft: '4px', color: 'var(--text-muted)' }}>{totalItems} en total</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          onClick={() => setPage(page - 1)}
          disabled={page <= 1}
          style={{
            padding: '4px 12px', borderRadius: '6px', border: '1px solid var(--border-color)',
            cursor: page <= 1 ? 'not-allowed' : 'pointer', background: 'none',
            opacity: page <= 1 ? 0.4 : 1, fontFamily: 'inherit', fontSize: '13px',
          }}
        >← Anterior</button>
        <span>Página <strong>{page}</strong> de <strong>{totalPages}</strong></span>
        <button
          onClick={() => setPage(page + 1)}
          disabled={page >= totalPages}
          style={{
            padding: '4px 12px', borderRadius: '6px', border: '1px solid var(--border-color)',
            cursor: page >= totalPages ? 'not-allowed' : 'pointer', background: 'none',
            opacity: page >= totalPages ? 0.4 : 1, fontFamily: 'inherit', fontSize: '13px',
          }}
        >Siguiente →</button>
      </div>
    </div>
  );
}
