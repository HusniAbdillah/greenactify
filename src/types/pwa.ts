export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

export interface PWAState {
  isInstalled: boolean
  isInstallable: boolean
  isOnline: boolean
  isStandalone: boolean
}

export interface ServiceWorkerState {
  isSupported: boolean
  isRegistered: boolean
  isUpdating: boolean
  hasUpdate: boolean
}

declare global {
  interface WindowEventMap {
    'beforeinstallprompt': BeforeInstallPromptEvent
  }
  
  interface Navigator {
    standalone?: boolean
  }
}