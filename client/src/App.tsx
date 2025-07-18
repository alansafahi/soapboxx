import { Suspense, lazy, useState, useEffect } from 'react';
import { Switch, Route, useLocation, Router as WouterRouter } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./components/ui/toaster";
import { TooltipProvider } from "./components/ui/tooltip";
import { useImmediateAuth } from "./lib/immediateAuth";
import { AnimatePresence, motion } from "framer-motion";
import { ThemeProvider } from "./contexts/ThemeContext";

import SidebarFixed from "./components/SidebarFixed";
import TopHeader from "./components/TopHeader";
import ChatWidget from "./components/ChatWidget";

// Lazy-loaded pages
const NotFound = lazy(() => import("./pages/not-found"));
const Landing = lazy(() => import("./pages/landing"));
const SimpleLanding = lazy(() => import("./pages/simple-landing"));
const PrivacyPolicyPage = lazy(() => import("./pages/privacy-policy"));
const TermsOfServicePage = lazy(() => import("./pages/terms-of-service"));
const PrayerWallFeaturePage = lazy(() => import("./pages/prayer-wall-feature"));
const BibleReadingFeaturePage = lazy(() => import("./pages/bible-reading-feature"));
const EventsFeaturePage = lazy(() => import("./pages/events-feature"));
const CommunityChatFeaturePage = lazy(() => import("./pages/community-chat-feature"));
const VolunteerHubFeaturePage = lazy(() => import("./pages/volunteer-hub-feature"));
const AboutUsPage = lazy(() => import("./pages/about-us"));
const ContactUsPage = lazy(() => import("./pages/contact-us"));
const SupportPage = lazy(() => import("./pages/support"));
const HelpDocsPage = lazy(() => import("./pages/help-docs"));
const LoginPage = lazy(() => import("./pages/login"));
const ResetPasswordPage = lazy(() => import("./pages/reset-password"));
const Home = lazy(() => import("./pages/home"));
const BiblePage = lazy(() => import("./pages/bible"));
const Community = lazy(() => import("./pages/community"));
const Churches = lazy(() => import("./pages/churches"));
const Events = lazy(() => import("./pages/events"));
const Prayer = lazy(() => import("./pages/prayer"));
const SoapPage = lazy(() => import("./pages/soap"));
const Messages = lazy(() => import("./pages/messages"));
const Chat = lazy(() => import("./pages/chat"));
const Leaderboard = lazy(() => import("./pages/leaderboard"));
const Profile = lazy(() => import("./pages/profile"));
const SettingsPage = lazy(() => import("./pages/settings"));
const ChurchClaiming = lazy(() => import("./pages/church-claiming"));
const FreshAudioBible = lazy(() => import("./pages/FreshAudioBible"));
const AudioRoutines = lazy(() => import("./pages/AudioRoutines"));
const VideoLibrary = lazy(() => import("./pages/video-library"));
const ImageGallery = lazy(() => import("./pages/ImageGallery"));
const ContactsPage = lazy(() => import("./pages/contacts"));
const EmailVerificationPage = lazy(() => import("./pages/EmailVerification"));

// Admin Portal Pages
const AdminPage = lazy(() => import("./pages/admin"));
const MembersPage = lazy(() => import("./pages/admin"));
const QrManagementPage = lazy(() => import("./pages/qr-management"));
const SMSGivingPage = lazy(() => import("./pages/SMSGiving_fixed"));
const DonationPage = lazy(() => import("./pages/DonationDemo"));
const DonationAnalyticsPage = lazy(() => import("./pages/DonationAnalytics"));
const CommunicationPage = lazy(() => import("./pages/BulkCommunication"));
const SermonStudioPage = lazy(() => import("./pages/SermonStudioPage"));
const ContentDistributionPage = lazy(() => import("./pages/ContentDistributionPage"));
const EngagementAnalyticsPage = lazy(() => import("./pages/EngagementAnalyticsPage"));
const ChurchManagementPage = lazy(() => import("./pages/church-management"));

const PersonalizedGuidancePage = lazy(() => import("./pages/PersonalizedGuidance"));
const SourceAttributionPage = lazy(() => import("./pages/SourceAttribution"));
const SocialFeedPage = lazy(() => import("./pages/social-feed"));
const BookmarkedPrayersPage = lazy(() => import("./pages/BookmarkedPrayersPage"));
const SavedReflectionsPage = lazy(() => import("./pages/saved-reflections"));

function AppRouter() {
    const { user, isAuthenticated, isLoading, logout } = useImmediateAuth();
    const [location] = useLocation();
    


    // Force render after 3 seconds if stuck in loading state
    const [forceRender, setForceRender] = useState(false);
    
    useEffect(() => {
        const timer = setTimeout(() => {
            if (isLoading) {
                setForceRender(true);
            }
        }, 3000);
        
        return () => clearTimeout(timer);
    }, [isLoading]);

    if (isLoading && !forceRender) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const ProtectedRoute = ({ component: Component, ...rest }: { component: any, [key: string]: any }) => (
        <Route {...rest}>
            {isAuthenticated ? (
                <Component />
            ) : (
                <LoginPage />
            )}
        </Route>
    );

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
            {isAuthenticated && (
                <div className="hidden md:block">
                    <SidebarFixed />
                </div>
            )}
            <div className={isAuthenticated ? "flex-1 flex flex-col min-w-0 overflow-hidden" : "flex-1"}>
                {isAuthenticated && <TopHeader />}
                <main className={isAuthenticated ? "flex-1 overflow-y-auto px-2 sm:px-4 md:px-6 py-2 sm:py-4" : "flex-1"}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Suspense fallback={<div>Loading...</div>}>
                                <Switch>
                                    <Route path="/login" component={LoginPage} />
                                    <Route path="/reset-password" component={ResetPasswordPage} />
                                    <Route path="/email-verification" component={EmailVerificationPage} />
                                    <Route path="/landing" component={SimpleLanding} />
                                    <ProtectedRoute path="/dashboard" component={Home} />
                                    <ProtectedRoute path="/home" component={Home} />
                                    <Route path="/">
                                        {isAuthenticated ? (
                                            <Home />
                                        ) : (
                                            <SimpleLanding />
                                        )}
                                    </Route>

                                    <ProtectedRoute path="/bible" component={BiblePage} />
                                    <ProtectedRoute path="/audio-bible" component={FreshAudioBible} />
                                    <ProtectedRoute path="/fresh-audio-bible" component={FreshAudioBible} />
                                    <ProtectedRoute path="/audio-routines" component={AudioRoutines} />
                                    <ProtectedRoute path="/video-library" component={VideoLibrary} />
                                    <ProtectedRoute path="/image-gallery" component={ImageGallery} />
                                    <ProtectedRoute path="/community" component={Community} />
                                    <ProtectedRoute path="/discussions" component={Community} />
                                    <ProtectedRoute path="/social-feed" component={SocialFeedPage} />
                                    <ProtectedRoute path="/churches" component={Churches} />
                                    <ProtectedRoute path="/church-claiming" component={ChurchClaiming} />
                                    <ProtectedRoute path="/church-management/:churchId" component={ChurchManagementPage} />
                                    <ProtectedRoute path="/events" component={Events} />
                                    <ProtectedRoute path="/prayer" component={Prayer} />
                                    <ProtectedRoute path="/prayer-wall" component={Prayer} />
                                    <ProtectedRoute path="/bookmarked-prayers" component={BookmarkedPrayersPage} />
                                    <ProtectedRoute path="/soap" component={SoapPage} />
                                    <ProtectedRoute path="/soap-journal" component={SoapPage} />
                                    <ProtectedRoute path="/saved-reflections" component={SavedReflectionsPage} />
                                    <ProtectedRoute path="/messages" component={Messages} />
                                    <ProtectedRoute path="/chat" component={Chat} />
                                    <ProtectedRoute path="/leaderboard" component={Leaderboard} />
                                    <ProtectedRoute path="/contacts" component={ContactsPage} />
                                    <ProtectedRoute path="/profile" component={Profile} />
                                    <ProtectedRoute path="/settings" component={SettingsPage} />
                                    
                                    {/* Admin Portal Routes */}
                                    <ProtectedRoute path="/admin" component={AdminPage} />
                                    <ProtectedRoute path="/members" component={MembersPage} />
                                    <ProtectedRoute path="/qr-management" component={QrManagementPage} />
                                    <ProtectedRoute path="/donation" component={DonationPage} />
                                    <ProtectedRoute path="/sms-giving" component={SMSGivingPage} />
                                    <ProtectedRoute path="/donation-analytics" component={DonationAnalyticsPage} />
                                    <ProtectedRoute path="/communication" component={CommunicationPage} />
                                    <ProtectedRoute path="/sermon-studio" component={SermonStudioPage} />
                                    <ProtectedRoute path="/content-distribution" component={ContentDistributionPage} />
                                    <ProtectedRoute path="/engagement-analytics" component={EngagementAnalyticsPage} />

                                    <ProtectedRoute path="/ai-guidance" component={PersonalizedGuidancePage} />
                                    <ProtectedRoute path="/source-attribution" component={SourceAttributionPage} />
                                    
                                    <Route path="/privacy-policy" component={PrivacyPolicyPage} />
                                    <Route path="/terms-of-service" component={TermsOfServicePage} />
                                    <Route path="/features/prayer-wall" component={PrayerWallFeaturePage} />
                                    <Route path="/features/bible-reading" component={BibleReadingFeaturePage} />
                                    <Route path="/features/events" component={EventsFeaturePage} />
                                    <Route path="/features/community-chat" component={CommunityChatFeaturePage} />
                                    <Route path="/features/volunteer-hub" component={VolunteerHubFeaturePage} />
                                    <Route path="/about-us" component={AboutUsPage} />
                                    <Route path="/contact-us" component={ContactUsPage} />
                                    <Route path="/support" component={SupportPage} />
                                    <Route path="/help-docs" component={HelpDocsPage} />
                                    <Route path="*" component={NotFound} />
                                </Switch>
                            </Suspense>
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
            {/* Global Chat Widget - Enhanced with comprehensive knowledge base */}
            <ChatWidget position="bottom-right" />
        </div>
    );
}

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider>
                <TooltipProvider>
                    <WouterRouter>
                        <AppRouter />
                        <Toaster />
                    </WouterRouter>
                </TooltipProvider>
            </ThemeProvider>
        </QueryClientProvider>
    );
}

export default App;
