import { Suspense, lazy } from 'react';
import { Switch, Route, useLocation, Router as WouterRouter } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useDirectAuth } from "@/lib/directAuth";
import { FORCE_AUTHENTICATED, MOCK_USER } from "@/lib/forceAuth";
import { AnimatePresence, motion } from "framer-motion";

import Sidebar from "@/components/Sidebar";
import TopHeader from "@/components/TopHeader";

// Lazy-loaded pages
const NotFound = lazy(() => import("@/pages/not-found"));
const Landing = lazy(() => import("@/pages/landing"));
const LoginPage = lazy(() => import("@/pages/login"));
const ResetPasswordPage = lazy(() => import("@/pages/reset-password"));
const Home = lazy(() => import("@/pages/home"));
const BiblePage = lazy(() => import("@/pages/bible"));
const Community = lazy(() => import("@/pages/community"));
const Churches = lazy(() => import("@/pages/churches"));
const Events = lazy(() => import("@/pages/events"));
const Prayer = lazy(() => import("@/pages/prayer"));
const SoapPage = lazy(() => import("@/pages/soap"));
const Messages = lazy(() => import("@/pages/messages"));
const Chat = lazy(() => import("@/pages/chat"));
const Leaderboard = lazy(() => import("@/pages/leaderboard"));
const Profile = lazy(() => import("@/pages/profile"));
const SettingsPage = lazy(() => import("@/pages/settings"));
const ChurchClaiming = lazy(() => import("@/pages/church-claiming"));
const FreshAudioBible = lazy(() => import("@/pages/FreshAudioBible"));
const AudioRoutines = lazy(() => import("@/pages/AudioRoutines"));
const VideoLibrary = lazy(() => import("@/pages/video-library"));
const ContactsPage = lazy(() => import("@/pages/contacts"));
const LoginDebugPage = lazy(() => import("@/pages/login-debug"));

function AppRouter() {
    const { user: currentUser, isAuthenticated: currentIsAuthenticated, isLoading: currentIsLoading } = useDirectAuth();
    const finalIsAuthenticated = FORCE_AUTHENTICATED || currentIsAuthenticated;
    const finalUser = FORCE_AUTHENTICATED ? MOCK_USER : currentUser;
    const [location] = useLocation();

    if (currentIsLoading && !FORCE_AUTHENTICATED) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const ProtectedRoute = ({ component: Component, ...rest }) => (
        <Route {...rest}>
            {finalIsAuthenticated ? <Component /> : <LoginPage />}
        </Route>
    );

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
            {finalIsAuthenticated && (
                <div className="hidden md:block">
                    <Sidebar />
                </div>
            )}
            <div className={finalIsAuthenticated ? "flex-1 flex flex-col min-w-0 overflow-hidden" : "flex-1"}>
                {finalIsAuthenticated && <TopHeader />}
                <main className={finalIsAuthenticated ? "flex-1 overflow-y-auto px-2 sm:px-4 md:px-6 py-2 sm:py-4" : "flex-1"}>
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
                                    <Route path="/" component={finalIsAuthenticated ? Home : Landing} />
                                    <Route path="/login-debug" component={LoginDebugPage} />
                                    <ProtectedRoute path="/bible" component={BiblePage} />
                                    <ProtectedRoute path="/audio-bible" component={FreshAudioBible} />
                                    <ProtectedRoute path="/audio-routines" component={AudioRoutines} />
                                    <ProtectedRoute path="/video-library" component={VideoLibrary} />
                                    <ProtectedRoute path="/community" component={Community} />
                                    <ProtectedRoute path="/discussions" component={Community} />
                                    <ProtectedRoute path="/churches" component={Churches} />
                                    <ProtectedRoute path="/church-claiming" component={ChurchClaiming} />
                                    <ProtectedRoute path="/events" component={Events} />
                                    <ProtectedRoute path="/prayer" component={Prayer} />
                                    <ProtectedRoute path="/prayer-wall" component={Prayer} />
                                    <ProtectedRoute path="/soap" component={SoapPage} />
                                    <ProtectedRoute path="/soap-journal" component={SoapPage} />
                                    <ProtectedRoute path="/messages" component={Messages} />
                                    <ProtectedRoute path="/chat" component={Chat} />
                                    <ProtectedRoute path="/leaderboard" component={Leaderboard} />
                                    <ProtectedRoute path="/contacts" component={ContactsPage} />
                                    <ProtectedRoute path="/profile" component={Profile} />
                                    <ProtectedRoute path="/settings" component={SettingsPage} />
                                    <Route path="*" component={NotFound} />
                                </Switch>
                            </Suspense>
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
}

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <TooltipProvider>
                <WouterRouter>
                    <AppRouter />
                    <Toaster />
                </WouterRouter>
            </TooltipProvider>
        </QueryClientProvider>
    );
}

export default App;
