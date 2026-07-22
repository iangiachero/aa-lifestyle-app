//src/App.tsx
import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Layout from './components/Layout';
import SplashScreen from './components/SplashScreen';
import ErrorBoundary from './components/ErrorBoundary';
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

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  // Instant exit: with mode="wait" a timed exit leaves a blank frame between
  // pages; dropping the old page immediately lets the new one fade in with
  // no visible gap.
  exit: { opacity: 0, transition: { duration: 0 } },
};

const pageTransition = {
  duration: 0.15,
  ease: 'easeOut',
};

function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={pageTransition}
      style={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}
    >
      {children}
    </motion.div>
  );
}

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

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={<GuestOnly><Layout currentPageName="Login"><PageTransition><Login /></PageTransition></Layout></GuestOnly>} />
        <Route path="/splash" element={<Layout currentPageName="Splash"><PageTransition><Splash /></PageTransition></Layout>} />
        <Route path="/welcome" element={<RequireAuth><WelcomeScreen /></RequireAuth>} />
        <Route path="/onboarding" element={<RequireAuth><Layout currentPageName="Onboarding"><PageTransition><OnboardingFlow /></PageTransition></Layout></RequireAuth>} />

        <Route path="/" element={<RequireAuth><Layout currentPageName="Home"><PageTransition><Home /></PageTransition></Layout></RequireAuth>} />
        <Route path="/calendar" element={<RequireAuth><Layout currentPageName="CalendarPage"><PageTransition><CalendarPage /></PageTransition></Layout></RequireAuth>} />
        <Route path="/tasks" element={<RequireAuth><Layout currentPageName="Tasks"><PageTransition><Tasks /></PageTransition></Layout></RequireAuth>} />
        <Route path="/lifestyle" element={<RequireAuth><RequirePro><Layout currentPageName="Lifestyle"><PageTransition><Lifestyle /></PageTransition></Layout></RequirePro></RequireAuth>} />
        <Route path="/profile" element={<RequireAuth><Layout currentPageName="Profile"><PageTransition><Profile /></PageTransition></Layout></RequireAuth>} />
        <Route path="/settings" element={<RequireAuth><Layout currentPageName="Settings"><PageTransition><Settings /></PageTransition></Layout></RequireAuth>} />
        <Route path="/subscription" element={<RequireAuth><Layout currentPageName="Subscription"><PageTransition><Subscription /></PageTransition></Layout></RequireAuth>} />
        <Route path="/habits" element={<RequireAuth><Layout currentPageName="Habits"><PageTransition><Habits /></PageTransition></Layout></RequireAuth>} />
        <Route path="/sleep" element={<RequireAuth><Layout currentPageName="Sleep"><PageTransition><Sleep /></PageTransition></Layout></RequireAuth>} />
        <Route path="/birthdays" element={<RequireAuth><Layout currentPageName="Birthdays"><PageTransition><Birthdays /></PageTransition></Layout></RequireAuth>} />
        <Route path="/goals" element={<RequireAuth><Layout currentPageName="Goals"><PageTransition><Goals /></PageTransition></Layout></RequireAuth>} />
        <Route path="/journal" element={<RequireAuth><Layout currentPageName="Journal"><PageTransition><Journal /></PageTransition></Layout></RequireAuth>} />
        <Route path="/finance" element={<RequireAuth><Layout currentPageName="Finance"><PageTransition><Finance /></PageTransition></Layout></RequireAuth>} />
        <Route path="/workout" element={<RequireAuth><RequirePro><Layout currentPageName="Fitness"><PageTransition><Fitness /></PageTransition></Layout></RequirePro></RequireAuth>} />
        <Route path="/nutrition" element={<RequireAuth><Layout currentPageName="Nutrition"><PageTransition><Nutrition /></PageTransition></Layout></RequireAuth>} />
        <Route path="/reading" element={<RequireAuth><Layout currentPageName="Reading"><PageTransition><Reading /></PageTransition></Layout></RequireAuth>} />
        <Route path="/travel" element={<RequireAuth><Layout currentPageName="Travel"><PageTransition><Travel /></PageTransition></Layout></RequireAuth>} />
        <Route path="/projects" element={<RequireAuth><Layout currentPageName="Projects"><PageTransition><Projects /></PageTransition></Layout></RequireAuth>} />
        <Route path="/notes" element={<RequireAuth><Layout currentPageName="Notes"><PageTransition><Notes /></PageTransition></Layout></RequireAuth>} />
        <Route path="/contacts" element={<RequireAuth><Layout currentPageName="Contacts"><PageTransition><Contacts /></PageTransition></Layout></RequireAuth>} />
        <Route path="/reminders" element={<RequireAuth><Layout currentPageName="Reminders"><PageTransition><Reminders /></PageTransition></Layout></RequireAuth>} />
        <Route path="/shopping" element={<RequireAuth><Layout currentPageName="Shopping"><PageTransition><Shopping /></PageTransition></Layout></RequireAuth>} />
        <Route path="/shop" element={<RequireAuth><Layout currentPageName="Shop"><PageTransition><Shop /></PageTransition></Layout></RequireAuth>} />
        <Route path="/grocery" element={<RequireAuth><Layout currentPageName="GroceryList"><PageTransition><GroceryList /></PageTransition></Layout></RequireAuth>} />
        <Route path="/routines" element={<RequireAuth><Layout currentPageName="Routines"><PageTransition><Routines /></PageTransition></Layout></RequireAuth>} />
        <Route path="/student" element={<RequireAuth><RequirePro><Layout currentPageName="Student"><PageTransition><Student /></PageTransition></Layout></RequirePro></RequireAuth>} />
        <Route path="/meals" element={<RequireAuth><RequirePro><Layout currentPageName="MealPlanning"><PageTransition><MealPlanning /></PageTransition></Layout></RequirePro></RequireAuth>} />
        <Route path="/checklists" element={<RequireAuth><RequirePro><Layout currentPageName="Checklists"><PageTransition><Checklists /></PageTransition></Layout></RequirePro></RequireAuth>} />
        <Route path="/home-organization" element={<RequireAuth><RequirePro><Layout currentPageName="HomeOrganization"><PageTransition><HomeOrganization /></PageTransition></Layout></RequirePro></RequireAuth>} />
        <Route path="/pwa-tutorial" element={<RequireAuth><Layout currentPageName="PWATutorial"><PageTransition><PWATutorial /></PageTransition></Layout></RequireAuth>} />
        <Route path="/vault" element={<RequireAuth><Layout currentPageName="PasswordVault"><PageTransition><PasswordVault /></PageTransition></Layout></RequireAuth>} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  useCapacitor();

  return (
    <ErrorBoundary>
      <Router>
        <Suspense fallback={null}>
          <AnimatedRoutes />
        </Suspense>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
