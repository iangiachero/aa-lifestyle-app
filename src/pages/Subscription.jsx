import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft, Check, Lock, Crown, Loader2, AlertCircle, CheckCircle2, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { STRIPE_PRODUCTS } from '../stripe-config';

const MONTHLY_PRICE_ID = STRIPE_PRODUCTS.pro.priceId;
const YEARLY_PRICE_ID = STRIPE_PRODUCTS.proYearly.priceId;

const PLANS = [
  {
    id: 'monthly',
    name: 'Monthly',
    price: '$2.99',
    period: '/month',
    priceId: MONTHLY_PRICE_ID,
    savings: null,
    popular: false,
    features: [
      'Password Vault (PIN-protected)',
      'Full Meal Planning & Recipes',
      'Home Organization Checklists',
      'Custom Workout Routines',
      'Lifestyle Section (Self-Care Routines)',
      'Student Dashboard',
    ],
  },
  {
    id: 'yearly',
    name: 'Annual',
    price: '$29.99',
    period: '/year',
    priceId: YEARLY_PRICE_ID,
    savings: 'Save $6/year',
    popular: true,
    features: [
      'Password Vault (PIN-protected)',
      'Full Meal Planning & Recipes',
      'Home Organization Checklists',
      'Custom Workout Routines',
      'Lifestyle Section (Self-Care Routines)',
      'Student Dashboard',
    ],
  },
];

const FREE_FEATURES = [
  'Home Dashboard',
  'Calendar & Events',
  'Tasks & Checklists',
  'Notes',
  'Basic Grocery Lists',
];

const ALL_FEATURES = [
  { label: 'Home Dashboard', free: true, pro: true },
  { label: 'Calendar & Events', free: true, pro: true },
  { label: 'Tasks & Checklists', free: true, pro: true },
  { label: 'Notes', free: true, pro: true },
  { label: 'Basic Grocery Lists', free: true, pro: true },
  { label: 'Password Vault (PIN-protected)', free: false, pro: true },
  { label: 'Full Meal Planning & Recipes', free: false, pro: true },
  { label: 'Home Organization Checklists', free: false, pro: true },
  { label: 'Custom Workout Routines', free: false, pro: true },
  { label: 'Lifestyle Section (Self-Care Routines)', free: false, pro: true },
  { label: 'Student Dashboard', free: false, pro: true },
];

export default function Subscription() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isPro, session, refreshUserProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState('yearly');

  useEffect(() => {
    const success = searchParams.get('success');
    const cancelled = searchParams.get('cancelled');
    const portalReturn = searchParams.get('portal_return');

    if (success === 'true') {
      setSuccessMsg('Payment successful! Your Pro plan is now active.');
      refreshUserProfile();
    } else if (cancelled === 'true') {
      setError('Checkout was not completed. No payment was made.');
    } else if (portalReturn === 'true') {
      setSuccessMsg('Your billing settings have been updated.');
      refreshUserProfile();
    }
  }, []);

  const handleUpgrade = async (priceId) => {
    if (!priceId) {
      setError('No product configured yet. Please check back soon.');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const origin = window.location.origin;
      const { data: { session: authSession }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !authSession?.access_token) {
        setError('Session expired. Please sign in again.');
        setLoading(false);
        return;
      }

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authSession.access_token}`,
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({
            price_id: priceId,
            success_url: `${origin}/subscription?success=true`,
            cancel_url: `${origin}/subscription?cancelled=true`,
            mode: 'subscription',
          }),
        }
      );

      const data = await res.json();

      if (!res.ok || data.error) {
        const stripeMsg = data.error || 'Failed to create checkout session';
        console.error('Stripe checkout error:', { status: res.status, error: stripeMsg, stripeType: data.stripeType, stripeCode: data.stripeCode, price_id: priceId });
        const detail = data.stripeCode ? ` (${data.stripeCode})` : '';
        throw new Error(stripeMsg + detail);
      }

      window.location.href = data.url;
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  const handleManage = async () => {
    setLoading(true);
    setError(null);

    try {
      const origin = window.location.origin;
      const { data: { session: authSession }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !authSession?.access_token) {
        setError('Session expired. Please sign in again.');
        setLoading(false);
        return;
      }

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-portal`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authSession.access_token}`,
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({
            return_url: `${origin}/subscription?portal_return=true`,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to open billing portal');
      }

      window.location.href = data.url;
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  const activePlan = PLANS.find(p => p.id === selectedPlan);

  return (
    <div className="min-h-full pb-32">
      <div className="relative border-b-2 border-[rgba(201,169,98,0.25)] page-safe-x py-6">
        <button onClick={() => navigate(-1)} className="absolute left-4 top-1/2 -translate-y-1/2 hover:opacity-70 transition-opacity">
          <ChevronLeft className="w-6 h-6 text-[color:var(--app-gold)]" strokeWidth={1.5} />
        </button>
        <div className="w-full text-center">
          <h1 className="text-3xl text-[color:var(--app-gold)] font-light tracking-wide" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Subscription
          </h1>
        </div>
      </div>

      <div className="page-safe-x pt-6 space-y-5">
        {successMsg && (
          <div className="flex items-start gap-3 rounded-xl px-4 py-3" style={{ background: 'rgba(201,169,98,0.12)', border: '1px solid rgba(201,169,98,0.3)' }}>
            <CheckCircle2 className="w-4 h-4 text-[color:var(--app-gold)] mt-0.5 flex-shrink-0" strokeWidth={2} />
            <p className="text-sm text-[color:var(--app-gold)]">{successMsg}</p>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-3 rounded-xl px-4 py-3" style={{ background: 'rgba(220,60,60,0.1)', border: '1px solid rgba(220,60,60,0.3)' }}>
            <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" strokeWidth={2} />
            <div>
              <p className="text-sm text-red-400">{error}</p>
              {(error.toLowerCase().includes('no such price') || error.toLowerCase().includes('no such product') || error.toLowerCase().includes('invalid api key')) && (
                <p className="text-xs text-red-300 mt-1 opacity-70">Make sure your Stripe Secret Key and Price ID are from the same account and mode (test vs. live).</p>
              )}
            </div>
          </div>
        )}

        <div className="text-center py-4">
          <p className="text-2xl text-[color:var(--app-gold)] font-light" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            {isPro ? "You're on Pro" : "You're on Free"}
          </p>
          <p className="text-sm text-[#8A7E72] mt-1">Thank you for supporting AA Lifestyle</p>
          <div className="w-12 h-px mx-auto mt-3" style={{ background: 'linear-gradient(90deg, transparent, #C9A962, transparent)' }} />
        </div>

        {!isPro ? (
          <>
            <div className="flex flex-col gap-3">
              <div className="rounded-2xl p-4" style={{ background: 'var(--app-surface)', border: '1px solid rgba(201,169,98,0.2)' }}>
                <p className="text-base text-[color:var(--app-text)] font-light mb-0.5" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Free</p>
                <p className="text-xs text-[#8A7E72] mb-3">Basic features</p>
                <p className="text-2xl text-[color:var(--app-gold)] mb-4" style={{ fontFamily: "'Cormorant Garamond', serif" }}>$0</p>
                <div className="space-y-2">
                  {FREE_FEATURES.map(f => (
                    <div key={f} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-[color:var(--app-gold)] mt-0.5 flex-shrink-0" strokeWidth={2} />
                      <span className="text-xs text-[color:var(--app-text-2)]">{f}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 w-full py-2.5 rounded-xl text-sm text-center" style={{ background: 'rgba(201,169,98,0.1)', color: 'var(--app-gold)', fontFamily: "'Cormorant Garamond', serif", fontSize: '15px', border: '1px solid rgba(201,169,98,0.3)' }}>
                  Current Plan
                </div>
              </div>

              <p className="text-center text-xs text-[#8A7E72] pt-1">Select a Pro plan to unlock all features</p>

              <div className="grid grid-cols-2 gap-3">
                {PLANS.map(plan => (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan.id)}
                    className="rounded-2xl p-4 cursor-pointer transition-all relative"
                    style={{
                      background: selectedPlan === plan.id ? 'rgba(0,0,0,0.9)' : 'rgba(0,0,0,0.5)',
                      border: selectedPlan === plan.id ? '1.5px solid rgba(201,169,98,0.6)' : '1px solid rgba(201,169,98,0.18)',
                      boxShadow: selectedPlan === plan.id ? '0 0 18px rgba(201,169,98,0.1)' : 'none',
                    }}
                  >
                    {plan.popular && (
                      <div
                        className="absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full flex items-center gap-1 whitespace-nowrap"
                        style={{ background: '#C9A962', color: '#0A0A0A' }}
                      >
                        <Star className="w-2.5 h-2.5 fill-current" strokeWidth={0} />
                        <span className="text-[10px] font-semibold">Most Popular</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1.5">
                        <Crown className="w-3.5 h-3.5 text-[color:var(--app-gold)]" strokeWidth={1.5} />
                        <p className="text-sm text-[color:var(--app-text)] font-light" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{plan.name}</p>
                      </div>
                      <div
                        className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all"
                        style={{
                          borderColor: selectedPlan === plan.id ? '#C9A962' : 'rgba(201,169,98,0.25)',
                          background: selectedPlan === plan.id ? '#C9A962' : 'transparent',
                        }}
                      >
                        {selectedPlan === plan.id && (
                          <div className="w-2 h-2 rounded-full" style={{ background: '#0A0A0A' }} />
                        )}
                      </div>
                    </div>

                    <div className="flex items-baseline gap-0.5 mb-0.5">
                      <span className="text-2xl text-[color:var(--app-gold)] font-light" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                        {plan.price}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#8A7E72] mb-2">{plan.period}</p>

                    {plan.savings && (
                      <p className="text-[11px] font-medium mb-3" style={{ color: 'var(--app-gold)' }}>
                        {plan.savings}
                      </p>
                    )}

                    <div className="space-y-1.5">
                      {plan.features.map((feature, i) => (
                        <div key={i} className="flex items-start gap-1.5">
                          <Check className="w-3 h-3 text-[color:var(--app-gold)] mt-0.5 flex-shrink-0" strokeWidth={2.5} />
                          <span className="text-[11px] text-[color:var(--app-text-2)] leading-snug">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleUpgrade(activePlan?.priceId)}
                disabled={loading}
                className="w-full py-3.5 rounded-xl text-base transition-all flex items-center justify-center gap-2 disabled:opacity-60 mt-1"
                style={{ background: 'linear-gradient(135deg, #B8955A 0%, #C9A962 100%)', color: 'white', fontFamily: "'Cormorant Garamond', serif", fontSize: '16px' }}
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Subscribe · {activePlan?.price}{activePlan?.period}
              </button>

              <p className="text-center text-xs text-[#8A7E72]">Cancel anytime. No commitments.</p>
            </div>
          </>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="rounded-2xl p-4 relative" style={{ background: 'var(--app-surface)', border: '1.5px solid rgba(201,169,98,0.5)' }}>
              <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full flex items-center gap-1" style={{ background: 'rgba(201,169,98,0.2)', border: '1px solid rgba(201,169,98,0.4)' }}>
                <Check className="w-3 h-3 text-[color:var(--app-gold)]" strokeWidth={2.5} />
                <span className="text-[10px] text-[color:var(--app-gold)]">Active</span>
              </div>
              <div className="flex items-center gap-1.5 mb-0.5">
                <Crown className="w-4 h-4 text-[color:var(--app-gold)]" strokeWidth={1.5} />
                <p className="text-base text-[color:var(--app-text)] font-light" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Pro</p>
              </div>
              <p className="text-xs text-[#8A7E72] mb-3">Everything unlocked</p>
              <p className="text-[10px] uppercase tracking-widest text-[#8A7E72] mb-3">What you have access to</p>
              <div className="space-y-2">
                {PLANS[0].features.map(f => (
                  <div key={f} className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-[color:var(--app-gold)] mt-0.5 flex-shrink-0" strokeWidth={2} />
                    <span className="text-xs text-[color:var(--app-text-2)]">{f}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={handleManage}
                disabled={loading}
                className="w-full mt-4 py-2.5 rounded-xl text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #B8955A 0%, #C9A962 100%)', color: 'white', fontFamily: "'Cormorant Garamond', serif", fontSize: '15px' }}
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Manage Plan
              </button>
            </div>
          </div>
        )}

        <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(201,169,98,0.2)' }}>
          <div className="px-4 py-3" style={{ background: 'var(--app-surface)', borderBottom: '1px solid rgba(201,169,98,0.15)' }}>
            <p className="text-center text-sm text-[color:var(--app-gold)]" style={{ fontFamily: "'Cormorant Garamond', serif", letterSpacing: '0.1em' }}>
              Feature Comparison
            </p>
          </div>

          <div className="grid grid-cols-3 px-4 py-2" style={{ background: 'var(--app-surface)', borderBottom: '1px solid rgba(201,169,98,0.1)' }}>
            <span className="text-xs text-[#8A7E72]">Features</span>
            <span className="text-xs text-[#8A7E72] text-center">Free</span>
            <span className="text-xs text-[color:var(--app-gold)] text-center">Pro</span>
          </div>

          {ALL_FEATURES.map((f, i) => (
            <div
              key={f.label}
              className="grid grid-cols-3 px-4 py-3 items-center"
              style={{
                background: i % 2 === 0 ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.4)',
                borderBottom: i < ALL_FEATURES.length - 1 ? '1px solid rgba(201,169,98,0.08)' : 'none'
              }}
            >
              <span className="text-xs text-[color:var(--app-text-2)] pr-2">{f.label}</span>
              <div className="flex justify-center">
                {f.free
                  ? <Check className="w-3.5 h-3.5 text-[color:var(--app-gold)]" strokeWidth={2.5} />
                  : <Lock className="w-3 h-3 text-[#555]" strokeWidth={1.5} />
                }
              </div>
              <div className="flex justify-center">
                <Check className="w-3.5 h-3.5 text-[color:var(--app-gold)]" strokeWidth={2.5} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
