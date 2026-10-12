'use client'

import Image from 'next/image'
import { useState } from 'react'
import { Disc3, Sparkles, Ticket } from 'lucide-react'
import BoBPreorderDialog from './BoBPreorderDialog'
import styles from './BoBReleaseSpotlight.module.css'

export default function BoBReleaseSpotlight() {
  const [preorderOpen, setPreorderOpen] = useState(false)
  return (
    <section id="upcoming-release" aria-labelledby="bob-release-title" className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.topline}>
          <span className={styles.toplineLabel}><span className={styles.liveDot} aria-hidden="true" /> The next RIENG drop</span>
          <span className={styles.issue}>01 / New music alert</span>
        </div>

        <div className={styles.grid}>
          <div className={styles.copy}>
            <p className={styles.eyebrow}><Sparkles size={15} aria-hidden="true" /> Exclusive first look</p>
            <h2 id="bob-release-title" className={styles.heading}>
              SOMETHING<br />
              <span>LOUD</span> IS<br />
              COMING.
            </h2>

            <div className={styles.trackBlock}>
              <span className={styles.smallLabel}>Upcoming release</span>
              <p className={styles.trackName}>BoB<span className={styles.trackPeriod}>.</span></p>
              <p className={styles.artists}>SWAT <span>×</span> UNCO JING JONG</p>
            </div>

            <p className={styles.description}>
              Two voices. One new drop. We&apos;ve got something special cooking for Kenyan music.
              Pre-order BoB now for KSh 150 and receive your unique confirmation code by SMS after payment.
            </p>

            <div className={styles.actions}>
              <button type="button" onClick={() => setPreorderOpen(true)} className={styles.button}>
                <Ticket size={19} aria-hidden="true" /> Pre-Order Now
              </button>
              <span className={styles.preorderPrice}>KSh 150 · M-Pesa</span>
            </div>

            <p className={styles.broughtToYou}><Disc3 size={15} aria-hidden="true" /> Music. Culture. Kenya.</p>
          </div>

          <div className={styles.visual}>
            <div className={styles.orangeGlow} aria-hidden="true" />
            <div className={styles.frame}>
              <Image
                src="/releases/bob-swat-unco-jing-jong.webp"
                alt="BoB coming soon poster featuring SWAT and Unco Jing Jong, presented by Rieng254.com"
                width={1024}
                height={1536}
                sizes="(max-width: 760px) 90vw, (max-width: 1100px) 44vw, 480px"
                className={styles.poster}
              />
            </div>
            <div className={styles.cornerTag}>COMING SOON <span>↗</span></div>
          </div>
        </div>

        <div className={styles.bottomline}>
          <span>RIENG254.COM PRESENTS</span>
          <span className={styles.bottomDot} aria-hidden="true">✳</span>
          <span>SWAT × UNCO JING JONG</span>
          <span className={styles.bottomDot} aria-hidden="true">✳</span>
          <span>BoB — COMING SOON</span>
        </div>
      </div>
      <BoBPreorderDialog open={preorderOpen} onOpenChange={setPreorderOpen} />
    </section>
  )
}
