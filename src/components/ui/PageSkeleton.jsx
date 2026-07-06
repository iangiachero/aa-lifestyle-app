import React from 'react';

function SkeletonBox({ className = '', style = {} }) {
  return <div className={`skeleton-pulse ${className}`} style={style} />;
}

function CardRow({ lines = 2, hasIcon = true, hasRight = true }) {
  return (
    <div
      className="rounded-2xl p-4 flex items-center gap-3"
      style={{ backgroundColor: 'var(--app-surface)', border: '1px solid rgba(226,186,139,0.08)' }}
    >
      {hasIcon && <SkeletonBox className="w-10 h-10 rounded-xl flex-shrink-0" />}
      <div className="flex-1 space-y-2 min-w-0">
        <SkeletonBox className="h-4 rounded" style={{ width: '55%' }} />
        {lines >= 2 && <SkeletonBox className="h-3 rounded" style={{ width: '80%' }} />}
        {lines >= 3 && <SkeletonBox className="h-3 rounded" style={{ width: '40%' }} />}
      </div>
      {hasRight && <SkeletonBox className="w-8 h-8 rounded-xl flex-shrink-0" />}
    </div>
  );
}

function SectionHeader() {
  return (
    <div className="flex items-center justify-between px-1 mb-2">
      <SkeletonBox className="h-4 rounded" style={{ width: 90 }} />
      <SkeletonBox className="h-3 rounded" style={{ width: 50 }} />
    </div>
  );
}

export function TasksSkeleton() {
  return (
    <div className="page-safe-x pt-4 space-y-5 pb-32">
      <div className="rounded-2xl p-4 space-y-2" style={{ backgroundColor: 'var(--app-surface)', border: '1px solid rgba(226,186,139,0.08)' }}>
        <SkeletonBox className="h-12 rounded-xl" />
      </div>
      <div className="space-y-2">
        <SectionHeader />
        {[...Array(3)].map((_, i) => <CardRow key={i} lines={2} hasIcon={false} />)}
      </div>
      <div className="space-y-2">
        <SectionHeader />
        {[...Array(2)].map((_, i) => <CardRow key={i} lines={2} hasIcon={false} />)}
      </div>
    </div>
  );
}

export function NotesSkeleton() {
  return (
    <div className="page-safe-x pt-4 space-y-4 pb-32">
      <SkeletonBox className="h-12 rounded-xl" />
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="rounded-2xl p-4 space-y-2"
            style={{ backgroundColor: 'var(--app-surface)', border: '1px solid rgba(226,186,139,0.08)' }}
          >
            <SkeletonBox className="h-4 rounded" style={{ width: `${50 + (i % 3) * 15}%` }} />
            <SkeletonBox className="h-3 rounded" style={{ width: '90%' }} />
            <SkeletonBox className="h-3 rounded" style={{ width: '60%' }} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function FitnessSkeleton() {
  return (
    <div className="page-safe-x pt-4 space-y-4 pb-32">
      <div className="flex gap-2">
        <SkeletonBox className="h-10 flex-1 rounded-xl" />
        <SkeletonBox className="h-10 flex-1 rounded-xl" />
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[...Array(6)].map((_, i) => <SkeletonBox key={i} className="h-16 rounded-xl" />)}
      </div>
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => <CardRow key={i} lines={2} hasIcon hasRight />)}
      </div>
    </div>
  );
}

export function MealPlanningSkeleton() {
  return (
    <div className="page-safe-x pt-4 space-y-4 pb-32">
      <div className="flex gap-2">
        <SkeletonBox className="h-10 flex-1 rounded-xl" />
        <SkeletonBox className="h-10 flex-1 rounded-xl" />
        <SkeletonBox className="h-10 flex-1 rounded-xl" />
      </div>
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="rounded-2xl p-5 space-y-3"
            style={{ backgroundColor: 'var(--app-surface)', border: '1px solid rgba(226,186,139,0.08)' }}
          >
            <div className="flex items-center gap-3">
              <SkeletonBox className="w-10 h-10 rounded-xl flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <SkeletonBox className="h-4 rounded" style={{ width: '45%' }} />
                <SkeletonBox className="h-3 rounded" style={{ width: '65%' }} />
              </div>
              <SkeletonBox className="w-8 h-8 rounded-xl flex-shrink-0" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CalendarSkeleton() {
  return (
    <div className="pt-4 pb-32 space-y-4">
      <div className="page-safe-x space-y-3">
        <div className="flex items-center justify-between">
          <SkeletonBox className="h-6 rounded" style={{ width: 140 }} />
          <div className="flex gap-2">
            <SkeletonBox className="w-8 h-8 rounded-xl" />
            <SkeletonBox className="w-8 h-8 rounded-xl" />
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {[...Array(7)].map((_, i) => <SkeletonBox key={i} className="h-6 rounded" />)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {[...Array(35)].map((_, i) => <SkeletonBox key={i} className="h-12 rounded-xl" />)}
        </div>
      </div>
    </div>
  );
}

export function HomeSkeleton() {
  return (
    <div className="page-safe-x pt-4 space-y-4 pb-32">
      <div className="rounded-2xl p-5 space-y-3" style={{ backgroundColor: 'var(--app-surface)', border: '1px solid rgba(226,186,139,0.08)' }}>
        <SkeletonBox className="h-5 rounded" style={{ width: '50%' }} />
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <SkeletonBox className="w-8 h-8 rounded-lg flex-shrink-0" />
              <div className="flex-1 space-y-1.5">
                <SkeletonBox className="h-3 rounded" style={{ width: '70%' }} />
                <SkeletonBox className="h-3 rounded" style={{ width: '45%' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-2xl p-5 space-y-3" style={{ backgroundColor: 'var(--app-surface)', border: '1px solid rgba(226,186,139,0.08)' }}>
        <SkeletonBox className="h-5 rounded" style={{ width: '40%' }} />
        <div className="space-y-2">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <SkeletonBox className="w-5 h-5 rounded-full flex-shrink-0" />
              <SkeletonBox className="h-3 rounded flex-1" />
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-2xl p-4 space-y-2" style={{ backgroundColor: 'var(--app-surface)', border: '1px solid rgba(226,186,139,0.08)' }}>
            <SkeletonBox className="w-9 h-9 rounded-xl" />
            <SkeletonBox className="h-5 rounded" style={{ width: '50%' }} />
            <SkeletonBox className="h-3 rounded" style={{ width: '80%' }} />
          </div>
        ))}
      </div>
    </div>
  );
}
