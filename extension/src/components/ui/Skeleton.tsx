import React from 'react';

/* ─── Base shimmer block ─────────────────────────────────────────────────── */
function Bone({ w, h, r = 6, style }: { w?: string | number; h: number; r?: number; style?: React.CSSProperties }) {
  return (
    <div style={{
      width: w ?? '100%',
      height: h,
      borderRadius: r,
      background: 'linear-gradient(90deg, #F1F5F9 0%, #E8EEF4 50%, #F1F5F9 100%)',
      backgroundSize: '200% 100%',
      animation: 'lb-shimmer 1.4s ease infinite',
      flexShrink: 0,
      ...style,
    }} />
  );
}

/* ─── Divider ────────────────────────────────────────────────────────────── */
const Divider = () => <div style={{ height: 1, background: '#F1F5F9' }} />;

/* ─── Section label skeleton ─────────────────────────────────────────────── */
const LabelBone = () => <Bone w={72} h={8} r={4} />;

/* ─── Contact card skeleton (matches ContactCard / ContactUnlockRow) ─────── */
function ContactCardSkeleton() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '10px 12px', borderRadius: 10,
      background: '#F8FAFF', border: '1.5px solid #E8EEFF',
    }}>
      {/* Icon box */}
      <div style={{ width: 32, height: 32, borderRadius: 8, background: '#EEF3FF', flexShrink: 0 }} />
      {/* Label + status */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
        <Bone w={70} h={8} r={4} />
        <Bone w={110} h={10} r={5} />
      </div>
      {/* Unlock button */}
      <Bone w={52} h={26} r={7} style={{ flexShrink: 0 }} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   PERSON SKELETON  — mirrors PersonCard layout exactly
   ═══════════════════════════════════════════════════════════════════════════ */
function PersonSkeletonCard() {
  return (
    <div style={{ padding: '12px 12px 0' }}>
      <div style={{ background: '#fff', borderRadius: 16, border: '1.5px solid #E8ECF0', boxShadow: '0 2px 16px rgba(0,0,0,0.07)', overflow: 'hidden' }}>

        {/* ── Hero ──────────────────────────────────────────────────────── */}
        <div style={{ padding: '18px 18px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
            {/* Avatar */}
            <div style={{ width: 64, height: 64, borderRadius: 14, flexShrink: 0, background: '#E8EEF4' }} />
            {/* Name / title / company / location */}
            <div style={{ flex: 1, minWidth: 0, paddingTop: 2, display: 'flex', flexDirection: 'column', gap: 7 }}>
              <Bone h={16} w="62%" r={6} />
              <Bone h={12} w="45%" r={5} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 16, height: 16, borderRadius: 3, background: '#E8EEF4', flexShrink: 0 }} />
                <Bone h={12} w="38%" r={5} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#E8EEF4', flexShrink: 0 }} />
                <Bone h={10} w="50%" r={4} />
              </div>
            </div>
          </div>
          {/* Meta chips */}
          <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
            <Bone w={100} h={22} r={20} />
            <Bone w={72} h={22} r={20} />
            <Bone w={84} h={22} r={20} />
          </div>
        </div>

        <Divider />

        {/* ── Contact Information ────────────────────────────────────────── */}
        <div style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <LabelBone />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            <ContactCardSkeleton />
            <ContactCardSkeleton />
            <ContactCardSkeleton />
          </div>
        </div>

        <Divider />

        {/* ── Skills ────────────────────────────────────────────────────── */}
        <div style={{ padding: '13px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <LabelBone />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            <Bone w={52} h={26} r={8} />
            <Bone w={68} h={26} r={8} />
            <Bone w={44} h={26} r={8} />
            <Bone w={76} h={26} r={8} />
          </div>
        </div>

        <Divider />

        {/* ── Company summary ────────────────────────────────────────────── */}
        <div style={{ padding: '13px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <LabelBone />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, background: '#FAFBFF', border: '1.5px solid #E8EEFF' }}>
            <div style={{ width: 32, height: 32, borderRadius: 6, background: '#E8EEF4', flexShrink: 0 }} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
              <Bone w="55%" h={13} r={5} />
              <Bone w="75%" h={10} r={4} />
            </div>
          </div>
        </div>

        <Divider />

        {/* ── Action bar ────────────────────────────────────────────────── */}
        <div style={{ padding: '10px 18px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Bone w={80} h={32} r={8} />
          <Bone w={80} h={32} r={8} />
          <div style={{ marginLeft: 'auto' }}>
            <Bone w={72} h={32} r={8} />
          </div>
        </div>

      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   COMPANY SKELETON  — mirrors CompanyCard layout exactly
   ═══════════════════════════════════════════════════════════════════════════ */
function CompanySkeletonCard() {
  return (
    <div style={{ padding: '12px 12px 0' }}>
      <div style={{ background: '#fff', borderRadius: 16, border: '1.5px solid #E8ECF0', boxShadow: '0 2px 16px rgba(0,0,0,0.07)', overflow: 'hidden' }}>

        {/* ── Header ────────────────────────────────────────────────────── */}
        <div style={{ padding: '18px 18px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
            {/* Logo */}
            <div style={{ width: 56, height: 56, borderRadius: 12, flexShrink: 0, background: '#E8EEF4' }} />
            {/* Name / industry / badges */}
            <div style={{ flex: 1, minWidth: 0, paddingTop: 2, display: 'flex', flexDirection: 'column', gap: 7 }}>
              <Bone h={16} w="60%" r={6} />
              <Bone h={12} w="42%" r={5} />
              <div style={{ display: 'flex', gap: 5, marginTop: 2 }}>
                <Bone w={52} h={20} r={20} />
                <Bone w={44} h={20} r={20} />
                <Bone w={48} h={20} r={20} />
              </div>
            </div>
          </div>
        </div>

        <Divider />

        {/* ── Info rows ─────────────────────────────────────────────────── */}
        <div style={{ padding: '12px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[75, 85, 65, 70, 90].map((w, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#E8EEF4', flexShrink: 0 }} />
              <Bone w={`${w}%`} h={12} r={4} />
            </div>
          ))}
        </div>

        <Divider />

        {/* ── About ─────────────────────────────────────────────────────── */}
        <div style={{ padding: '13px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <LabelBone />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <Bone h={12} r={4} />
            <Bone h={12} w="90%" r={4} />
            <Bone h={12} w="70%" r={4} />
          </div>
        </div>

        <Divider />

        {/* ── Tech Stack ────────────────────────────────────────────────── */}
        <div style={{ padding: '13px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <LabelBone />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            <Bone w={48} h={26} r={8} />
            <Bone w={36} h={26} r={8} />
            <Bone w={64} h={26} r={8} />
            <Bone w={52} h={26} r={8} />
            <Bone w={44} h={26} r={8} />
          </div>
        </div>

        <Divider />

        {/* ── Action bar ────────────────────────────────────────────────── */}
        <div style={{ padding: '10px 18px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Bone w={80} h={32} r={8} />
          <Bone w={90} h={32} r={8} />
          <Bone w={80} h={32} r={8} />
          <div style={{ marginLeft: 'auto' }}>
            <Bone w={72} h={32} r={8} />
          </div>
        </div>

      </div>
    </div>
  );
}

/* ─── Public exports ─────────────────────────────────────────────────────── */
export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-100 rounded ${className}`} />;
}

export function SkeletonCard({ type = 'person' }: { type?: 'person' | 'company' }) {
  return type === 'company' ? <CompanySkeletonCard /> : <PersonSkeletonCard />;
}
