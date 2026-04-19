import { NativeModules, Platform } from 'react-native'

type FloatingServiceNativeModule = {
  startFloatingService: () => Promise<boolean>
  stopFloatingService: () => Promise<boolean>
  checkOverlayPermission: () => Promise<boolean>
  requestOverlayPermission: () => Promise<boolean>
  isServiceRunning: () => Promise<boolean>
}

const floatingServiceModule =
  Platform.OS === 'android'
    ? ((NativeModules.FloatingService as FloatingServiceNativeModule) ?? null)
    : null

function getNativeModule(): FloatingServiceNativeModule | null {
  if (Platform.OS !== 'android') {
    return null
  }

  if (!floatingServiceModule) {
    throw new Error('FloatingService native module is unavailable on Android.')
  }

  return floatingServiceModule
}

export async function startFloatingService() {
  const nativeModule = getNativeModule()
  if (!nativeModule) {
    return false
  }

  return Boolean(await nativeModule.startFloatingService())
}

export async function stopFloatingService() {
  const nativeModule = getNativeModule()
  if (!nativeModule) {
    return false
  }

  return Boolean(await nativeModule.stopFloatingService())
}

export async function checkOverlayPermission() {
  const nativeModule = getNativeModule()
  if (!nativeModule) {
    return false
  }

  return Boolean(await nativeModule.checkOverlayPermission())
}

export async function requestOverlayPermission() {
  const nativeModule = getNativeModule()
  if (!nativeModule) {
    return false
  }

  return Boolean(await nativeModule.requestOverlayPermission())
}

export async function isServiceRunning() {
  const nativeModule = getNativeModule()
  if (!nativeModule) {
    return false
  }

  return Boolean(await nativeModule.isServiceRunning())
}
