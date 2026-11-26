import { useEffect, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

interface InstallEvent extends Event {
  prompt(): Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const standalone = () => window.matchMedia('(display-mode: standalone)').matches ||
  ('standalone' in navigator && navigator.standalone === true);

export function usePwa() {
  const { offlineReady: [cached], needRefresh: [update], updateServiceWorker } = useRegisterSW();
  const [available, setAvailable] = useState(false);
  const [installed, setInstalled] = useState(standalone);
  const [prompt, setPrompt] = useState<InstallEvent | null>(null);

  useEffect(() => {
    const onInstall = (event: Event) => { event.preventDefault(); setPrompt(event as InstallEvent); };
    const onInstalled = () => { setInstalled(true); setPrompt(null); };
    const sw = navigator.serviceWorker;
    const seeController = () => setAvailable(Boolean(sw?.controller));
    seeController();
    sw?.addEventListener('controllerchange', seeController);
    window.addEventListener('beforeinstallprompt', onInstall);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      sw?.removeEventListener('controllerchange', seeController);
      window.removeEventListener('beforeinstallprompt', onInstall);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  async function install() {
    if (!prompt) return;
    try {
      const choice = await prompt.prompt();
      if (choice.outcome === 'accepted') setInstalled(true);
    } finally {
      setPrompt(null);
    }
  }

  return {
    installed, offline: cached || available, install: prompt ? () => { void install().catch(() => undefined); } : null,
    update, applyUpdate: () => { void updateServiceWorker(true); },
  };
}
