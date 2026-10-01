'use client'

import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
import { ArrowRight, Check, CheckCircle2, Globe2, Loader2, LockKeyhole, Phone, RefreshCw, ShieldCheck, Smartphone } from 'lucide-react'
import { DOMAIN_QUOTE, PAYMENT_TEST_AMOUNT, type DomainPaymentSummary } from '@/lib/domain-quote'
import styles from './payment.module.css'

export default function DomainPayment({ testMode = false }: { testMode?: boolean }) {
  const amount = testMode ? PAYMENT_TEST_AMOUNT : DOMAIN_QUOTE.amount
  const endpoint = testMode ? '/api/payment-test' : '/api/domain-payment'
  const recoveryKey = testMode ? 'rieng-payment-test-attempt' : 'rieng-domain-payment-attempt'
  const money = new Intl.NumberFormat('en-KE').format(amount)
  const [payment, setPayment] = useState<DomainPaymentSummary>(() => ({ status: 'unpaid', amount, reference: null, receipt: null, phoneLast4: null, note: '' }))
  const [phone, setPhone] = useState('')
  const [ready, setReady] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [autoCheckEnded, setAutoCheckEnded] = useState(false)
  const csrf = useRef('')
  const checking = useRef(false)
  const submittingRef = useRef(false)
  const field = useRef<HTMLInputElement>(null)
  const waiting = ['pending', 'uncertain'].includes(payment.status)
  const paid = payment.status === 'paid'

  const apply = useCallback((data: { payment: DomainPaymentSummary; csrfToken: string }) => {
    csrf.current = data.csrfToken
    let recovered = data.payment
    // A lost POST response must not turn a page reload into a second debit.
    if (data.payment.status === 'unpaid' && sessionStorage.getItem(recoveryKey)) {
      recovered = { ...data.payment, status: 'uncertain', note: 'An earlier payment request could not be confirmed. Check your M-Pesa messages and contact the Rieng team before requesting another payment.' }
    }
    if (['paid', 'failed'].includes(data.payment.status)) sessionStorage.removeItem(recoveryKey)
    setPayment(recovered)
    setReady(true)
  }, [recoveryKey])

  const checkStatus = useCallback(async (manual = false) => {
    if (checking.current || submittingRef.current) return
    checking.current = true
    if (manual) setRefreshing(true)
    try {
      const response = await fetch(endpoint, { cache: 'no-store', signal: AbortSignal.timeout(12000) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Payment status is temporarily unavailable.')
      apply(data)
      setError('')
    } catch (failure) {
      if (manual || !csrf.current) setError(failure instanceof Error ? failure.message : 'Payment status is temporarily unavailable. Please check again.')
    } finally { checking.current = false; setRefreshing(false) }
  }, [apply, endpoint])

  useEffect(() => { void checkStatus() }, [checkStatus])
  useEffect(() => {
    if (!waiting || !payment.reference) return
    setAutoCheckEnded(false)
    const started = Date.now()
    const timer = setInterval(() => {
      if (Date.now() - started >= 5 * 60 * 1000) { clearInterval(timer); setAutoCheckEnded(true); return }
      void checkStatus()
    }, 10000)
    return () => clearInterval(timer)
  }, [waiting, payment.reference, checkStatus])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!ready || submittingRef.current || waiting || paid) return
    const normalized = phone.replace(/[\s()-]/g, '').replace(/^\+?254/, '0')
    if (!/^0[17]\d{8}$/.test(normalized)) {
      setError('Enter a valid M-Pesa number, such as 0712 345 678.')
      field.current?.focus()
      return
    }
    const attempt = crypto.randomUUID()
    submittingRef.current = true
    setSubmitting(true)
    setError('')
    sessionStorage.setItem(recoveryKey, attempt)
    try {
      const response = await fetch(endpoint, {
        method: 'POST', signal: AbortSignal.timeout(25000),
        headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrf.current, 'Idempotency-Key': attempt },
        body: JSON.stringify({ phone: normalized }),
      })
      const data = await response.json()
      if (!response.ok) {
        if ([400, 401, 403, 413, 415, 429].includes(response.status)) sessionStorage.removeItem(recoveryKey)
        throw new Error(data.error || 'The request could not be confirmed. Check payment status before retrying.')
      }
      apply(data)
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'The connection was interrupted. Check your phone and payment status.')
      if (sessionStorage.getItem(recoveryKey)) setPayment(previous => ({ ...previous, status: 'uncertain', note: 'Your request may have reached M-Pesa. Check your phone and payment status before making another request.' }))
    } finally { submittingRef.current = false; setSubmitting(false) }
  }

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.header}>
          <a href="https://truehost.co.ke/" target="_blank" rel="noreferrer" className={styles.brand} aria-label="TrueHost, domain registrar">
            {/* The original logo supplied by TrueHost, stored locally. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/truehost-logo.svg" width="219" height="32" alt="TrueHost" />
            <span>DOMAIN REGISTRAR</span>
          </a>
          <span className={styles.requestTag}><span /> RIENG · {testMode ? 'PAYMENT TEST' : 'DOMAIN REQUEST'}</span>
        </header>

        <div className={`${styles.intro} ${testMode ? styles.testIntro : ''}`}>
          <p className={styles.eyebrow}>{testMode ? 'KSH 1 PAYMENT TEST' : 'A NEW ADDRESS. SAME RIENG.'}</p>
          <h1>{testMode ? 'Test M-Pesa.' : 'Let’s make the switch.'}</h1>
          <p>{testMode ? 'Send one bob to check the Swifta payment flow.' : 'One simple payment to move Rieng to its new .com domain.'}</p>
        </div>

        <section className={`${styles.card} ${testMode ? styles.testCard : ''}`} aria-label={testMode ? 'KSh 1 M-Pesa test payment' : 'Rieng domain payment request'}>
          {!testMode && <div className={styles.details}>
            <div className={styles.sectionLabel}><Globe2 size={17} aria-hidden="true" /> DOMAIN SWITCH</div>
            <div className={styles.domains}>
              <div className={styles.oldDomain}><span>CURRENT DOMAIN</span><strong>{DOMAIN_QUOTE.currentDomain}</strong></div>
              <div className={styles.domainArrow}><ArrowRight size={20} aria-hidden="true" /></div>
              <div className={styles.newDomain}><div><span>NEW DOMAIN</span><span className={styles.comTag}>.COM</span></div><strong>{DOMAIN_QUOTE.newDomain}</strong><p>A shorter address for what comes next.</p></div>
            </div>

            <div className={styles.quote}>
              <div className={styles.quoteRow}><span>Domain registration &amp; switch</span><strong>KSh {money}</strong></div>
              <div className={styles.quoteTotal}><span>Total amount</span><strong><small>KSh</small> {money}</strong></div>
              <p>One-off domain payment request</p>
            </div>

            <div className={styles.registrarDetails}>
              <ShieldCheck size={20} aria-hidden="true" />
              <div><strong>Domain registrar: TrueHost</strong><a href="https://truehost.co.ke/contact-us/" target="_blank" rel="noreferrer">truehost.co.ke · +254 20 790 3111</a><span>Ryanada Place, Highpoint, Juja, Kenya</span></div>
            </div>
          </div>}

          <div className={styles.checkout}>
            <div className={`${styles.statusBadge} ${paid ? styles.badgePaid : ''}`}><span />{paid ? 'Payment confirmed' : waiting ? 'Awaiting confirmation' : 'Awaiting payment'}</div>

            {paid ? (
              <div className={styles.result} role="status">
                <div className={`${styles.resultIcon} ${styles.successIcon}`}><CheckCircle2 size={34} aria-hidden="true" /></div>
                <h2>{testMode ? 'Test payment received.' : 'Payment received.'}</h2>
                <p>{testMode ? <>Your KSh {money} M-Pesa test payment is confirmed.</> : <>Your KSh {money} payment for the switch to <strong>{DOMAIN_QUOTE.newDomain}</strong> is confirmed.</>}</p>
                <dl className={styles.receipt}><div><dt>M-Pesa receipt</dt><dd>{payment.receipt}</dd></div><div><dt>Request reference</dt><dd>{payment.reference}</dd></div><div><dt>Amount paid</dt><dd>KSh {money}</dd></div></dl>
                <p className={styles.smallNote}>{testMode ? 'The payment flow worked. The domain request remains KSh 2,800.' : 'The Rieng team can now arrange the domain registration and switch with TrueHost.'}</p>
              </div>
            ) : waiting ? (
              <div className={styles.result} role="status" aria-live="polite">
                <div className={styles.resultIcon}><Smartphone size={34} aria-hidden="true" /><span className={styles.phonePulse} /></div>
                <h2>{payment.status === 'pending' ? 'Check your phone.' : 'Let’s check that payment.'}</h2>
                <p>{payment.note}</p>
                {payment.phoneLast4 && <span className={styles.phoneHint}>M-Pesa number ending in <strong>{payment.phoneLast4}</strong></span>}
                {payment.reference && <div className={styles.reference}><span>REQUEST REFERENCE</span><strong>{payment.reference}</strong></div>}
                <button className={styles.secondaryButton} onClick={() => void checkStatus(true)} disabled={refreshing}>{refreshing ? <Loader2 className={styles.spin} size={16} /> : <RefreshCw size={16} />} Check payment status</button>
                <p className={styles.smallNote}>{autoCheckEnded ? 'Automatic checks have paused. You can still check the status above.' : 'Confirmation can take a moment. Please keep this page open.'}</p>
              </div>
            ) : (
              <>
                <div className={styles.paymentHeading}><div className={styles.mpesaMark}><Smartphone size={21} aria-hidden="true" /></div><div><h2>Pay with M-Pesa</h2><p>Approve the payment on your phone.</p></div></div>
                <form onSubmit={submit} className={styles.form}>
                  <label htmlFor="mpesa-phone">M-Pesa phone number</label>
                  <div className={styles.phoneInput}><Phone size={18} aria-hidden="true" /><input ref={field} id="mpesa-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="0712 345 678" maxLength={40} value={phone} onChange={event => { setPhone(event.target.value); setError('') }} disabled={submitting} aria-describedby="phone-help payment-error" required /></div>
                  <p id="phone-help" className={styles.inputHelp}>Use the number you want to pay from.</p>
                  <div className={styles.instructions}><Smartphone size={21} aria-hidden="true" /><p>You’ll receive an M-Pesa prompt. Enter your PIN <strong>on your phone</strong> to approve KSh {money}.</p></div>
                  {payment.status === 'failed' && <p className={styles.failedNote} role="status">{payment.note}</p>}
                  <button type="submit" className={styles.payButton} disabled={!ready || submitting}>{submitting ? <><Loader2 className={styles.spin} size={19} /> Sending M-Pesa prompt…</> : <><span>{payment.status === 'failed' ? 'Try again · ' : 'Pay '}KSh {money}</span><ArrowRight size={20} aria-hidden="true" /></>}</button>
                  {!ready && !error && <p className={styles.smallNote}><Loader2 className={styles.spin} size={13} /> Preparing your payment…</p>}
                  <div className={styles.security}><LockKeyhole size={13} aria-hidden="true" /><span>Processed securely through Swifta</span></div>
                </form>
              </>
            )}
            {error && <div id="payment-error" className={styles.error} role="alert"><p>{error}</p>{!ready && <button onClick={() => void checkStatus(true)} disabled={refreshing}>Try reconnecting</button>}</div>}
            <div className={styles.collectionNote}><Check size={14} aria-hidden="true" /><p>{testMode ? <>This is a real KSh 1 test payment collected by <strong>Rieng</strong>.</> : <>Payment collected by <strong>Rieng</strong> for domain registration with <strong>TrueHost</strong>.</>}</p></div>
          </div>
        </section>

        <footer className={styles.footer}><span>RIENG <span className={styles.footerDot}>/</span> {testMode ? 'PAYMENT TEST' : 'DOMAIN SERVICES'}</span><span><LockKeyhole size={12} aria-hidden="true" /> Your M-Pesa PIN stays on your phone.</span></footer>
      </div>
    </main>
  )
}
