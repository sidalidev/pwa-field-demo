import { Capacitor } from '@capacitor/core'

export type RuntimePlatform = 'web-browser' | 'web-installed' | 'android-apk' | 'ios-ipa'

export function detectRuntime(): RuntimePlatform {
  if (Capacitor.isNativePlatform()) {
    return Capacitor.getPlatform() === 'ios' ? 'ios-ipa' : 'android-apk'
  }
  const standalone = window.matchMedia('(display-mode: standalone)').matches
  return standalone ? 'web-installed' : 'web-browser'
}

export function getDeviceUA(): 'android' | 'ios' | 'desktop' {
  const ua = navigator.userAgent
  if (/android/i.test(ua)) return 'android'
  if (/iPad|iPhone|iPod/.test(ua)) return 'ios'
  return 'desktop'
}

export function isNativeApp(): boolean {
  return Capacitor.isNativePlatform()
}
