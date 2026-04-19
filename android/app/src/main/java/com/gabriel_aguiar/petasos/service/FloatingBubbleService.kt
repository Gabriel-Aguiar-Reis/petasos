package com.gabriel_aguiar.petasos.service

import android.app.Service
import android.content.Intent
import android.os.Build
import android.os.IBinder
import android.util.Log
import com.gabriel_aguiar.petasos.utils.FloatingBubbleManager
import com.gabriel_aguiar.petasos.utils.NotificationHelper
import com.gabriel_aguiar.petasos.utils.OverlayPermissionHelper

class FloatingBubbleService : Service() {
  private lateinit var bubbleManager: FloatingBubbleManager

  override fun onCreate() {
    super.onCreate()
    bubbleManager = FloatingBubbleManager(this)
    Log.d(TAG, "Service created")
  }

  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    if (intent?.action == ACTION_STOP) {
      Log.d(TAG, "Received stop action")
      stopSelf()
      return START_NOT_STICKY
    }

    if (!OverlayPermissionHelper.hasPermission(this)) {
      Log.w(TAG, "Overlay permission missing, stopping service")
      stopSelf()
      return START_NOT_STICKY
    }

    NotificationHelper.ensureChannel(this)
    startForeground(
      NotificationHelper.NOTIFICATION_ID,
      NotificationHelper.buildNotification(this)
    )

    bubbleManager.showBubble()
    running = true
    Log.d(TAG, "Floating bubble started")

    return START_STICKY
  }

  override fun onDestroy() {
    bubbleManager.removeBubble()
    running = false

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
      stopForeground(STOP_FOREGROUND_REMOVE)
    } else {
      @Suppress("DEPRECATION")
      stopForeground(true)
    }

    Log.d(TAG, "Service destroyed")
    super.onDestroy()
  }

  override fun onBind(intent: Intent?): IBinder? = null

  companion object {
    const val ACTION_START = "com.gabriel_aguiar.petasos.action.START_FLOATING_BUBBLE"
    const val ACTION_STOP = "com.gabriel_aguiar.petasos.action.STOP_FLOATING_BUBBLE"
    private const val TAG = "FloatingBubbleService"

    @Volatile
    private var running = false

    fun isRunning(): Boolean = running
  }
}