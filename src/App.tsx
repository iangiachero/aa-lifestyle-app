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
const NotificationSettings = lazy(() => import('./pages/NotificationSettings'));
const OnboardingFlow = lazy(() => import('./pages/onboarding/index'));
const PrivacyPolicy = lazy(() => import('./pages/legal/PrivacyPolicy'));
const Terms = lazy(() => import('./pages/legal/Terms'));
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
        {/* Public on purpose: App Store Connect needs URLs that open without an
            account, and the review team reads them while signed out. */}
        <Route path="/privacy" element={<Layout currentPageName="Privacy"><PageTransition><PrivacyPolicy /></PageTransition></Layout>} />
        <Route path="/terms" element={<Layout currentPageName="Terms"><PageTransition><Terms /></PageTransition></Layout>} />
        <Route path="/welcome" element={<RequireAuth><WelcomeScreen /></RequireAuth>} />
        <Route path="/onboarding" element={<RequireAuth><Layout currentPageName="Onboarding"><PageTransition><OnboardingFlow /></PageTransition></Layout></RequireAuth>} />

        <Route path="/" element={<RequireAuth><Layout currentPageName="Home"><PageTransition><Home /></PageTransition></Layout></RequireAuth>} />
        <Route path="/calendar" element={<RequireAuth><RequirePro><Layout currentPageName="CalendarPage"><PageTransition><CalendarPage /></PageTransition></Layout></RequirePro></RequireAuth>} />
        <Route path="/tasks" element={<RequireAuth><Layout currentPageName="Tasks"><PageTransition><Tasks /></PageTransition></Layout></RequireAuth>} />
        <Route path="/lifestyle" element={<RequireAuth><RequirePro><Layout currentPageName="Lifestyle"><PageTransition><Lifestyle /></PageTransition></Layout></RequirePro></RequireAuth>} />
        <Route path="/profile" element={<RequireAuth><Layout currentPageName="Profile"><PageTransition><Profile /></PageTransition></Layout></RequireAuth>} />
        <Route path="/settings" element={<RequireAuth><Layout currentPageName="Settings"><PageTransition><Settings /></PageTransition></Layout></RequireAuth>} />
        <Route path="/subscription" element={<RequireAuth><Layout currentPageName="Subscription"><PageTransition><Subscription /></PageTransition></Layout></RequireAuth>} />
        <Route path="/notification-settings" element={<RequireAuth><Layout currentPageName="NotificationSettings"><PageTransition><NotificationSettings /></PageTransition></Layout></RequireAuth>} />
        <Route path="/habits" element={<RequireAuth><RequirePro><Layout currentPageName="Habits"><PageTransition><Habits /></PageTransition></Layout></RequirePro></RequireAuth>} />
        <Route path="/sleep" element={<RequireAuth><RequirePro><Layout currentPageName="Sleep"><PageTransition><Sleep /></PageTransition></Layout></RequirePro></RequireAuth>} />
        <Route path="/birthdays" element={<RequireAuth><RequirePro><Layout currentPageName="Birthdays"><PageTransition><Birthdays /></PageTransition></Layout></RequirePro></RequireAuth>} />
        <Route path="/goals" element={<RequireAuth><RequirePro><Layout currentPageName="Goals"><PageTransition><Goals /></PageTransition></Layout></RequirePro></RequireAuth>} />
        <Route path="/journal" element={<RequireAuth><RequirePro><Layout currentPageName="Journal"><PageTransition><Journal /></PageTransition></Layout></RequirePro></RequireAuth>} />
        <Route path="/finance" element={<RequireAuth><RequirePro><Layout currentPageName="Finance"><PageTransition><Finance /></PageTransition></Layout></RequirePro></RequireAuth>} />
        <Route path="/workout" element={<RequireAuth><RequirePro><Layout currentPageName="Fitness"><PageTransition><Fitness /></PageTransition></Layout></RequirePro></RequireAuth>} />
        <Route path="/nutrition" element={<RequireAuth><RequirePro><Layout currentPageName="Nutrition"><PageTransition><Nutrition /></PageTransition></Layout></RequirePro></RequireAuth>} />
        <Route path="/reading" element={<RequireAuth><RequirePro><Layout currentPageName="Reading"><PageTransition><Reading /></PageTransition></Layout></RequirePro></RequireAuth>} />
        <Route path="/travel" element={<RequireAuth><RequirePro><Layout currentPageName="Travel"><PageTransition><Travel /></PageTransition></Layout></RequirePro></RequireAuth>} />
        <Route path="/projects" element={<RequireAuth><RequirePro><Layout currentPageName="Projects"><PageTransition><Projects /></PageTransition></Layout></RequirePro></RequireAuth>} />
        <Route path="/notes" element={<RequireAuth><Layout currentPageName="Notes"><PageTransition><Notes /></PageTransition></Layout></RequireAuth>} />
        <Route path="/contacts" element={<RequireAuth><RequirePro><Layout currentPageName="Contacts"><PageTransition><Contacts /></PageTransition></Layout></RequirePro></RequireAuth>} />
        <Route path="/reminders" element={<RequireAuth><RequirePro><Layout currentPageName="Reminders"><PageTransition><Reminders /></PageTransition></Layout></RequirePro></RequireAuth>} />
        <Route path="/shopping" element={<RequireAuth><RequirePro><Layout currentPageName="Shopping"><PageTransition><Shopping /></PageTransition></Layout></RequirePro></RequireAuth>} />
        <Route path="/shop" element={<RequireAuth><RequirePro><Layout currentPageName="Shop"><PageTransition><Shop /></PageTransition></Layout></RequirePro></RequireAuth>} />
        <Route path="/grocery" element={<RequireAuth><RequirePro><Layout currentPageName="GroceryList"><PageTransition><GroceryList /></PageTransition></Layout></RequirePro></RequireAuth>} />
        <Route path="/routines" element={<RequireAuth><RequirePro><Layout currentPageName="Routines"><PageTransition><Routines /></PageTransition></Layout></RequirePro></RequireAuth>} />
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
