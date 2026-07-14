export default function AccountSuspended() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          font-family: 'Inter', sans-serif;
          background: #f5f5f5;
          color: #333;
          min-height: 100dvh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem 1rem;
        }

        .th-wrap {
          width: 100%;
          max-width: 640px;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        /* ── Truehost header bar ── */
        .th-topbar {
          background: #f97316;
          border-radius: 10px 10px 0 0;
          padding: 1rem 1.5rem;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .th-topbar__cloud {
          width: 32px; height: 32px;
          fill: #fff;
        }
        .th-topbar__name {
          font-size: 1.1rem;
          font-weight: 700;
          color: #fff;
          letter-spacing: 0.02em;
        }

        /* ── main card ── */
        .th-card {
          background: #fff;
          border-radius: 0 0 10px 10px;
          box-shadow: 0 2px 16px rgba(0,0,0,0.08);
          overflow: hidden;
        }

        /* red alert banner */
        .th-alert {
          background: #fff3cd;
          border-left: 4px solid #f97316;
          padding: 1rem 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.92rem;
          font-weight: 600;
          color: #92400e;
        }
        .th-alert svg {
          width: 20px; height: 20px;
          color: #f97316;
          flex-shrink: 0;
        }

        .th-body {
          padding: 2rem 1.75rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        /* icon + headline */
        .th-heading {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 1rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid #eee;
        }
        .th-heading__icon {
          width: 64px; height: 64px;
          border-radius: 50%;
          background: #fff7ed;
          border: 2px solid #fed7aa;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .th-heading__icon svg {
          width: 30px; height: 30px;
          color: #f97316;
        }
        .th-heading h1 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #111;
        }
        .th-heading p {
          font-size: 0.9rem;
          color: #666;
          line-height: 1.6;
          max-width: 440px;
        }

        /* info rows */
        .th-info {
          background: #fafafa;
          border: 1px solid #eee;
          border-radius: 8px;
          overflow: hidden;
        }
        .th-info__row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 1.1rem;
          font-size: 0.88rem;
          border-bottom: 1px solid #eee;
        }
        .th-info__row:last-child { border-bottom: none; }
        .th-info__label { color: #888; font-weight: 500; }
        .th-info__value { color: #111; font-weight: 600; }
        .th-info__value--red { color: #dc2626; }
        .th-info__value--orange { color: #f97316; }

        /* notice box */
        .th-notice {
          background: #fff7ed;
          border: 1px solid #fed7aa;
          border-radius: 8px;
          padding: 1rem 1.2rem;
          font-size: 0.88rem;
          color: #78350f;
          line-height: 1.65;
        }
        .th-notice strong {
          display: block;
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #f97316;
          margin-bottom: 0.4rem;
        }

        /* action button */
        .th-btn {
          display: block;
          width: 100%;
          text-align: center;
          background: #f97316;
          color: #fff;
          font-family: 'Inter', sans-serif;
          font-size: 0.92rem;
          font-weight: 600;
          padding: 0.85rem;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          text-decoration: none;
          transition: background 0.2s;
        }
        .th-btn:hover { background: #ea6c0a; }

        .th-btn--outline {
          background: transparent;
          border: 1px solid #e5e7eb;
          color: #555;
        }
        .th-btn--outline:hover { background: #f5f5f5; }

        .th-actions {
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
        }

        /* footer */
        .th-footer {
          text-align: center;
          font-size: 0.75rem;
          color: #aaa;
          margin-top: 0.5rem;
        }
        .th-footer a {
          color: #f97316;
          text-decoration: none;
        }
        .th-footer a:hover { text-decoration: underline; }
      `}</style>

      <div className="th-wrap">

        {/* Truehost top bar */}
        <div className="th-topbar">
          {/* Truehost cloud SVG */}
          <svg className="th-topbar__cloud" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
            <path d="M52 28.2A14 14 0 0 0 38.5 16a14 14 0 0 0-13.1 9A10 10 0 0 0 12 34a10 10 0 0 0 10 10h29a9 9 0 0 0 1-17.8z"/>
          </svg>
          <span className="th-topbar__name">TRUEHOST</span>
        </div>

        {/* Main card */}
        <div className="th-card">

          {/* Alert banner */}
          <div className="th-alert">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            Account Suspended — Immediate Action Required
          </div>

          <div className="th-body">

            {/* Heading */}
            <div className="th-heading">
              <div className="th-heading__icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </div>
              <h1>This Account Has Been Suspended</h1>
              <p>
                Access to this hosting account has been temporarily suspended
                due to an <strong>outstanding invoice</strong> that has not been settled.
                The website associated with this account is currently offline.
              </p>
            </div>

            {/* Account details */}
            <div className="th-info">
              <div className="th-info__row">
                <span className="th-info__label">Account Status</span>
                <span className="th-info__value th-info__value--red">⛔ Suspended</span>
              </div>
              <div className="th-info__row">
                <span className="th-info__label">Reason</span>
                <span className="th-info__value th-info__value--orange">Unpaid Invoice</span>
              </div>
              <div className="th-info__row">
                <span className="th-info__label">Service</span>
                <span className="th-info__value">Web Hosting — Server</span>
              </div>
              <div className="th-info__row">
                <span className="th-info__label">Invoice Reference</span>
                <span className="th-info__value">#602362</span>
              </div>
              <div className="th-info__row">
                <span className="th-info__label">Due Date</span>
                <span className="th-info__value th-info__value--red">13th July 2026 (Overdue)</span>
              </div>
            </div>

            {/* Notice */}
            <div className="th-notice">
              <strong>⚠ Important Notice</strong>
              To restore access to this account and bring your website back online,
              please log in to the Truehost client portal and settle the outstanding
              invoice at your earliest convenience. Failure to do so may result in
              permanent data loss after the grace period expires.
            </div>

            {/* Actions */}
            <div className="th-actions">
              <a
                id="th-portal-btn"
                href="https://truehost.co.ke/"
                target="_blank"
                rel="noopener noreferrer"
                className="th-btn"
              >
                Log In to Client Portal &rarr;
              </a>
              <a
                id="th-support-btn"
                href="https://truehost.co.ke/"
                target="_blank"
                rel="noopener noreferrer"
                className="th-btn th-btn--outline"
              >
                Contact Truehost Support
              </a>
            </div>

          </div>
        </div>

        {/* Footer */}
        <p className="th-footer">
          This page was generated automatically by <a href="https://truehost.co.ke/" target="_blank" rel="noopener noreferrer">Truehost</a>.
          &nbsp;If you believe this is an error, please <a href="https://truehost.co.ke/" target="_blank" rel="noopener noreferrer">contact support</a>.
        </p>

      </div>
    </>
  )
}
