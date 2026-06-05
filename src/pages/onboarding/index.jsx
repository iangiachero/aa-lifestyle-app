import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { seedLifestyleRoutines } from '../../lib/seedLifestyleRoutines';
import { seedChecklists } from '../../lib/seedChecklists';
import { seedHomeOrg } from '../../lib/seedHomeOrg';
import Step1Welcome from './Step1Welcome';
import Step2Focus from './Step2Focus';
import Step3Personalize from './Step3Personalize';
import Step4Schedule from './Step4Schedule';

const DEFAULT_DATA = {
  focus: '',
  gender: undefined,
  is_student: undefined,
  schedule_type: 'standard',
  timezone: 'America/Chicago',
};

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, refreshUserProfile } = useAuth();
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState(DEFAULT_DATA);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const updateData = (patch) => setFormData(prev => ({ ...prev, ...patch }));

  const handleSubmit = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { error: upsertError } = await supabase
        .from('users')
        .upsert({
          user_id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || '',
          gender: formData.gender || null,
          is_student: formData.is_student ?? false,
          focus: formData.focus || null,
          schedule_type: formData.schedule_type,
          timezone: formData.timezone,
          onboarding_complete: true,
        }, { onConflict: 'user_id' });

      if (upsertError) {
        setError('Something went wrong. Please try again.');
        return;
      }

      await refreshUserProfile();

      if (formData.gender) {
        seedLifestyleRoutines(user.id, formData.gender);
      }

      seedChecklists(user.id);
      seedHomeOrg(user.id);

      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  if (step === 0) return <Step1Welcome onNext={() => setStep(1)} />;
  if (step === 1) return <Step2Focus onNext={() => setStep(2)} onBack={() => setStep(0)} data={formData} onChange={updateData} />;
  if (step === 2) return <Step3Personalize onNext={() => setStep(3)} onBack={() => setStep(1)} data={formData} onChange={updateData} />;
  if (step === 3) return (
    <>
      <Step4Schedule onSubmit={handleSubmit} onBack={() => setStep(2)} data={formData} onChange={updateData} loading={loading} />
      {error && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg text-sm"
          style={{ background: '#C0392B', color: 'white', fontFamily: "'Inter', sans-serif" }}>
          {error}
        </div>
      )}
    </>
  );

  return null;
}
