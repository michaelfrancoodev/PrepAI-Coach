import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { ProtectedRoute, OnboardingGuard } from '@/layouts/RouteGuards';

// Public pages
import { LandingPage } from '@/pages/public/LandingPage';
import { FeaturesPage } from '@/pages/public/FeaturesPage';
import { HowItWorksPage } from '@/pages/public/HowItWorksPage';
import { PracticeCategoriesPage } from '@/pages/public/PracticeCategoriesPage';
import { RoadmapPage } from '@/pages/public/RoadmapPage';
import { PricingPage } from '@/pages/public/PricingPage';
import { FAQPage } from '@/pages/public/FAQPage';
import { AboutPage } from '@/pages/public/AboutPage';

// Auth pages
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage';

// Onboarding
import { OnboardingPage } from '@/pages/onboarding/OnboardingPage';

// App pages
import { DashboardPage } from '@/pages/app/DashboardPage';
import { EnglishHomePage } from '@/pages/app/english/EnglishHomePage';
import { ConversationPage } from '@/pages/app/english/ConversationPage';
import { GrammarPage } from '@/pages/app/english/GrammarPage';
import { VocabularyPage } from '@/pages/app/english/VocabularyPage';
import { EnglishReportPage } from '@/pages/app/english/EnglishReportPage';
import { InterviewHomePage } from '@/pages/app/interviews/InterviewHomePage';
import { InterviewRoomPage } from '@/pages/app/interviews/InterviewRoomPage';
import { InterviewResultsPage } from '@/pages/app/interviews/InterviewResultsPage';
import { SystemDesignHomePage } from '@/pages/app/system-design/SystemDesignHomePage';
import { SystemDesignRoomPage } from '@/pages/app/system-design/SystemDesignRoomPage';
import { CoachHomePage } from '@/pages/app/coach/CoachHomePage';
import { AskAiPage } from '@/pages/app/coach/AskAiPage';
import { AnalyticsPage } from '@/pages/app/analytics/AnalyticsPage';
import { LearningCenterPage } from '@/pages/app/learning/LearningCenterPage';
import { TopicLessonPage } from '@/pages/app/learning/TopicLessonPage';
import { SettingsPage } from '@/pages/app/settings/SettingsPage';
import { ProfilePage } from '@/pages/app/settings/ProfilePage';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/features" element={<FeaturesPage />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/practice-categories" element={<PracticeCategoriesPage />} />
            <Route path="/roadmap" element={<RoadmapPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/about" element={<AboutPage />} />

            {/* Auth */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />

            {/* Onboarding */}
            <Route
              path="/onboarding"
              element={
                <ProtectedRoute>
                  <OnboardingGuard>
                    <OnboardingPage />
                  </OnboardingGuard>
                </ProtectedRoute>
              }
            />

            {/* App (protected + onboarding complete) */}
            <Route
              path="/app"
              element={
                <ProtectedRoute>
                  <OnboardingGuard>
                    <Navigate to="/app/dashboard" replace />
                  </OnboardingGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/app/dashboard"
              element={
                <ProtectedRoute>
                  <OnboardingGuard>
                    <DashboardPage />
                  </OnboardingGuard>
                </ProtectedRoute>
              }
            />

            {/* English Speaking */}
            <Route path="/app/english" element={<ProtectedRoute><OnboardingGuard><EnglishHomePage /></OnboardingGuard></ProtectedRoute>} />
            <Route path="/app/english/conversation" element={<ProtectedRoute><OnboardingGuard><ConversationPage /></OnboardingGuard></ProtectedRoute>} />
            <Route path="/app/english/grammar" element={<ProtectedRoute><OnboardingGuard><GrammarPage /></OnboardingGuard></ProtectedRoute>} />
            <Route path="/app/english/vocabulary" element={<ProtectedRoute><OnboardingGuard><VocabularyPage /></OnboardingGuard></ProtectedRoute>} />
            <Route path="/app/english/report" element={<ProtectedRoute><OnboardingGuard><EnglishReportPage /></OnboardingGuard></ProtectedRoute>} />

            {/* Interview Practice */}
            <Route path="/app/interviews" element={<ProtectedRoute><OnboardingGuard><InterviewHomePage /></OnboardingGuard></ProtectedRoute>} />
            <Route path="/app/interviews/results" element={<ProtectedRoute><OnboardingGuard><InterviewResultsPage /></OnboardingGuard></ProtectedRoute>} />
            <Route path="/app/interviews/:type" element={<ProtectedRoute><OnboardingGuard><InterviewRoomPage /></OnboardingGuard></ProtectedRoute>} />

            {/* System Design */}
            <Route path="/app/system-design" element={<ProtectedRoute><OnboardingGuard><SystemDesignHomePage /></OnboardingGuard></ProtectedRoute>} />
            <Route path="/app/system-design/:slug" element={<ProtectedRoute><OnboardingGuard><SystemDesignRoomPage /></OnboardingGuard></ProtectedRoute>} />

            {/* AI Coach */}
            <Route path="/app/coach" element={<ProtectedRoute><OnboardingGuard><CoachHomePage /></OnboardingGuard></ProtectedRoute>} />
            <Route path="/app/coach/ask" element={<ProtectedRoute><OnboardingGuard><AskAiPage /></OnboardingGuard></ProtectedRoute>} />

            {/* Analytics */}
            <Route path="/app/analytics" element={<ProtectedRoute><OnboardingGuard><AnalyticsPage /></OnboardingGuard></ProtectedRoute>} />

            {/* Learning Center */}
            <Route path="/app/learning" element={<ProtectedRoute><OnboardingGuard><LearningCenterPage /></OnboardingGuard></ProtectedRoute>} />
            <Route path="/app/learning/topic/:slug" element={<ProtectedRoute><OnboardingGuard><TopicLessonPage /></OnboardingGuard></ProtectedRoute>} />

            {/* Settings & Profile */}
            <Route path="/app/settings" element={<ProtectedRoute><OnboardingGuard><SettingsPage /></OnboardingGuard></ProtectedRoute>} />
            <Route path="/app/profile" element={<ProtectedRoute><OnboardingGuard><ProfilePage /></OnboardingGuard></ProtectedRoute>} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
