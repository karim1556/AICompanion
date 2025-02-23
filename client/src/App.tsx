import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import Home from "@/pages/home";
import NotFound from "@/pages/not-found";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

let deferredPrompt: any = null;

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('ServiceWorker registration successful:', registration);
      })
      .catch(err => {
        console.error('ServiceWorker registration failed:', err);
      });
  });
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

function InstallPrompt() {
  const [showInstallButton, setShowInstallButton] = useState(false);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      setShowInstallButton(true);
    });

    window.addEventListener('appinstalled', () => {
      deferredPrompt = null;
      setShowInstallButton(false);
      console.log('PWA was installed');
    });
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to install prompt: ${outcome}`);
    deferredPrompt = null;
    setShowInstallButton(false);
  };

  if (!showInstallButton) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <Button onClick={handleInstallClick} className="flex gap-2">
        <Download className="h-4 w-4" />
        Install App
      </Button>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <InstallPrompt />
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;