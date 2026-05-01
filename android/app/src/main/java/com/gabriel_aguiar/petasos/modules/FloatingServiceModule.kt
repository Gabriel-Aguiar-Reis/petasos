package com.gabriel_aguiar.petasos.modules

import android.content.Context
import android.content.Intent
import android.os.Build
import android.util.Log
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.UiThreadUtil
import com.gabriel_aguiar.petasos.service.FloatingBubbleService
import com.gabriel_aguiar.petasos.utils.OverlayActionSheet
import com.gabriel_aguiar.petasos.utils.OverlayPermissionHelper

class FloatingServiceModule(
  reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String = MODULE_NAME

  @ReactMethod
  fun startFloatingService(promise: Promise) {
    Log.d(TAG, "startFloatingService called")

    if (!OverlayPermissionHelper.hasPermission(reactApplicationContext)) {
      promise.resolve(false)
      return
    }

    val intent = Intent(reactApplicationContext, FloatingBubbleService::class.java)
      .apply { action = FloatingBubbleService.ACTION_START }

    try {
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        reactApplicationContext.startForegroundService(intent)
      } else {
        reactApplicationContext.startService(intent)
      }
      promise.resolve(true)
    } catch (exception: Exception) {
      Log.e(TAG, "Failed to start floating service", exception)
      promise.reject("START_FLOATING_SERVICE_ERROR", exception)
    }
  }

  @ReactMethod
  fun stopFloatingService(promise: Promise) {
    Log.d(TAG, "stopFloatingService called")

    try {
      val stopped = reactApplicationContext.stopService(
        Intent(reactApplicationContext, FloatingBubbleService::class.java)
      )
      promise.resolve(stopped)
    } catch (exception: Exception) {
      Log.e(TAG, "Failed to stop floating service", exception)
      promise.reject("STOP_FLOATING_SERVICE_ERROR", exception)
    }
  }

  @ReactMethod
  fun checkOverlayPermission(promise: Promise) {
    promise.resolve(OverlayPermissionHelper.hasPermission(reactApplicationContext))
  }

  @ReactMethod
  fun requestOverlayPermission(promise: Promise) {
    Log.d(TAG, "requestOverlayPermission called")

    try {
      if (OverlayPermissionHelper.hasPermission(reactApplicationContext)) {
        promise.resolve(true)
        return
      }

      OverlayPermissionHelper.request(reactApplicationContext)
      promise.resolve(true)
    } catch (exception: Exception) {
      Log.e(TAG, "Failed to request overlay permission", exception)
      promise.reject("REQUEST_OVERLAY_PERMISSION_ERROR", exception)
    }
  }

  @ReactMethod
  fun isServiceRunning(promise: Promise) {
    promise.resolve(FloatingBubbleService.isRunning())
  }

  @ReactMethod
  fun showActionSheet(promise: Promise) {
    Log.d(TAG, "showActionSheet called")

    val activity = reactApplicationContext.currentActivity
    if (activity == null) {
      promise.reject("NO_ACTIVITY", "No current activity available")
      return
    }

    UiThreadUtil.runOnUiThread {
      try {
        val sheet = OverlayActionSheet(activity as Context)
        sheet.show()
        promise.resolve(true)
      } catch (exception: Exception) {
        Log.e(TAG, "Failed to show action sheet", exception)
        promise.reject("SHOW_ACTION_SHEET_ERROR", exception)
      }
    }
  }

  companion object {
    const val MODULE_NAME = "FloatingService"
    private const val TAG = "FloatingServiceModule"
  }
}