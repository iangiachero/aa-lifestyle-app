//src/App.tsx
import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import PwaUpdateBanner from './components/PwaUpdateBanner';
import SplashScreen from './components/SplashScreen';
import { usePwaUpdate } from './hooks/usePwaUpdate';
import { useCapacitor } from './hooks/useCapacitor';
import { useAuth } from './context/AuthContext';

const Home = lazy(() => import('./pages/Home'));
const CalendarPage = lazy(() => import('./pages/CalendarPage'));
const Tasks = lazy(() => import('./pages/Tasks'));
const Lifestyle = lazy(() => import('./pages/Lifestyle'));
const Profile = lazy(() => import('./pages/Profile'));
const Settings = lazy(() => import('./pages/Settings'));
const Subscription = lazy(() => import('./pages/Subscription'));
const OnboardingFlow = lazy(() => import('./pages/onboarding/index'));
const Login = lazy(() => import('./pages/Login'));
const Splash = lazy(() => import('./pages/Splash'));
const WelcomeScreen = lazy(() => import('./pages/WelcomeScreen'));
const Habits = lazy(() => import('./pages/Habits'));
const Sleep = lazy(() => import('./pages/Sleep'));
const Birthdays = lazy(() => import('./pages/Birthdays'));
const Goals = lazy(() => import('./pages/Goals'));
const Journal = lazy(() => import('./pages/Journal'));
const Finance = lazy(() => import('./pages/Finance'));
const Fitness = lazy(() => import('./pages/Fitness'));
const Nutrition = lazy(() => import('./pages/Nutrition'));
const Reading = lazy(() => import('./pages/Reading'));
const Travel = lazy(() => import('./pages/Travel'));
const Projects = lazy(() => import('./pages/Projects'));
const Notes = lazy(() => import('./pages/Notes'));
const Contacts = lazy(() => import('./pages/Contacts'));
const Reminders = lazy(() => import('./pages/Reminders'));
const Shopping = lazy(() => import('./pages/Shopping'));
const Routines = lazy(() => import('./pages/Routines'));
const Student = lazy(() => import('./pages/Student'));
const Shop = lazy(() => import('./pages/Shop'));
const GroceryList = lazy(() => import('./pages/GroceryList'));
const MealPlanning = lazy(() => import('./pages/MealPlanning'));
const Checklists = lazy(() => import('./pages/Checklists'));
const HomeOrganization = lazy(() => import('./pages/HomeOrganization'));
const PWATutorial = lazy(() => import('./pages/PWATutorial'));
const PasswordVault = lazy(() => import('./pages/PasswordVault'));

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { session, loading, userProfile } = useAuth();
  const location = useLocation();

  if (loading) return <SplashScreen />;

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (userProfile && !userProfile.onboarding_complete && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}

function GuestOnly({ children }: { children: React.ReactNode }) {
  const { session, loading, userProfile } = useAuth();

  if (loading) return <SplashScreen />;

  if (session) {
    if (userProfile && !userProfile.onboarding_complete) {
      return <Navigate to="/onboarding" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function RequirePro({ children }: { children: React.ReactNode }) {
  const { isPro, loading } = useAuth();

  if (loading) return <SplashScreen />;

  if (!isPro) {
    return <Navigate to="/subscription" replace />;
  }

  return <>{children}</>;
}

function App() {
  useCapacitor();
  const { updateAvailable, applyUpdate } = usePwaUpdate();

  return (
    <>
      {updateAvailable && <PwaUpdateBanner onUpdate={applyUpdate} />}
      <Router>
        <Suspense fallback={<SplashScreen />}>
          <Routes>
            <Route path="/login" element={<GuestOnly><Layout currentPageName="Login"><Login /></Layout></GuestOnly>} />
            <Route path="/splash" element={<Layout currentPageName="Splash"><Splash /></Layout>} />
            <Route path="/welcome" element={<RequireAuth><WelcomeScreen /></RequireAuth>} />
            <Route path="/onboarding" element={<RequireAuth><Layout currentPageName="Onboarding"><OnboardingFlow /></Layout></RequireAuth>} />

            <Route path="/" element={<RequireAuth><Layout currentPageName="Home"><Home /></Layout></RequireAuth>} />
            <Route path="/calendar" element={<RequireAuth><Layout currentPageName="CalendarPage"><CalendarPage /></Layout></RequireAuth>} />
            <Route path="/tasks" element={<RequireAuth><Layout currentPageName="Tasks"><Tasks /></Layout></RequireAuth>} />
            <Route path="/lifestyle" element={<RequireAuth><RequirePro><Layout currentPageName="Lifestyle"><Lifestyle /></Layout></RequirePro></RequireAuth>} />
            <Route path="/profile" element={<RequireAuth><Layout currentPageName="Profile"><Profile /></Layout></RequireAuth>} />
            <Route path="/settings" element={<RequireAuth><Layout currentPageName="Settings"><Settings /></Layout></RequireAuth>} />
            <Route path="/subscription" element={<RequireAuth><Layout currentPageName="Subscription"><Subscription /></Layout></RequireAuth>} />
            <Route path="/habits" element={<RequireAuth><Layout currentPageName="Habits"><Habits /></Layout></RequireAuth>} />
            <Route path="/sleep" element={<RequireAuth><Layout currentPageName="Sleep"><Sleep /></Layout></RequireAuth>} />
            <Route path="/birthdays" element={<RequireAuth><Layout currentPageName="Birthdays"><Birthdays /></Layout></RequireAuth>} />
            <Route path="/goals" element={<RequireAuth><Layout currentPageName="Goals"><Goals /></Layout></RequireAuth>} />
            <Route path="/journal" element={<RequireAuth><Layout currentPageName="Journal"><Journal /></Layout></RequireAuth>} />
            <Route path="/finance" element={<RequireAuth><Layout currentPageName="Finance"><Finance /></Layout></RequireAuth>} />
            <Route path="/workout" element={<RequireAuth><RequirePro><Layout currentPageName="Fitness"><Fitness /></Layout></RequirePro></RequireAuth>} />
            <Route path="/nutrition" element={<RequireAuth><Layout currentPageName="Nutrition"><Nutrition /></Layout></RequireAuth>} />
            <Route path="/reading" element={<RequireAuth><Layout currentPageName="Reading"><Reading /></Layout></RequireAuth>} />
            <Route path="/travel" element={<RequireAuth><Layout currentPageName="Travel"><Travel /></Layout></RequireAuth>} />
            <Route path="/projects" element={<RequireAuth><Layout currentPageName="Projects"><Projects /></Layout></RequireAuth>} />
            <Route path="/notes" element={<RequireAuth><Layout currentPageName="Notes"><Notes /></Layout></RequireAuth>} />
            <Route path="/contacts" element={<RequireAuth><Layout currentPageName="Contacts"><Contacts /></Layout></RequireAuth>} />
            <Route path="/reminders" element={<RequireAuth><Layout currentPageName="Reminders"><Reminders /></Layout></RequireAuth>} />
            <Route path="/shopping" element={<RequireAuth><Layout currentPageName="Shopping"><Shopping /></Layout></RequireAuth>} />
            <Route path="/shop" element={<RequireAuth><Layout currentPageName="Shop"><Shop /></Layout></RequireAuth>} />
            <Route path="/grocery" element={<RequireAuth><Layout currentPageName="GroceryList"><GroceryList /></Layout></RequireAuth>} />
            <Route path="/routines" element={<RequireAuth><Layout currentPageName="Routines"><Routines /></Layout></RequireAuth>} />
            <Route path="/student" element={<RequireAuth><RequirePro><Layout currentPageName="Student"><Student /></Layout></RequirePro></RequireAuth>} />
            <Route path="/meals" element={<RequireAuth><RequirePro><Layout currentPageName="MealPlanning"><MealPlanning /></Layout></RequirePro></RequireAuth>} />
            <Route path="/checklists" element={<RequireAuth><Layout currentPageName="Checklists"><Checklists /></Layout></RequireAuth>} />
            <Route path="/home-organization" element={<RequireAuth><RequirePro><Layout currentPageName="HomeOrganization"><HomeOrganization /></Layout></RequirePro></RequireAuth>} />
            <Route path="/pwa-tutorial" element={<RequireAuth><Layout currentPageName="PWATutorial"><PWATutorial /></Layout></RequireAuth>} />
            <Route path="/vault" element={<RequireAuth><Layout currentPageName="PasswordVault"><PasswordVault /></Layout></RequireAuth>} />
          </Routes>
        </Suspense>
      </Router>
    </>
  );
}

export default App;
