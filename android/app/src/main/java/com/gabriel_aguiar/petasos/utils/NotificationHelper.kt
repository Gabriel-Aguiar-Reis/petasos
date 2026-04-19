package com.gabriel_aguiar.petasos.utils

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.net.Uri
import android.os.Build
import androidx.core.app.NotificationCompat
import com.gabriel_aguiar.petasos.MainActivity

object NotificationHelper {
  const val CHANNEL_ID = "floating_bubble_channel"
  const val NOTIFICATION_ID = 7011
  private const val CHANNEL_NAME = "Bubble flutuante"

  fun ensureChannel(context: Context) {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return

    val manager = context.getSystemService(Context.NOTIFICATION_SERVICE)
      as NotificationManager

    val existingChannel = manager.getNotificationChannel(CHANNEL_ID)
    if (existingChannel != null) return

    val channel = NotificationChannel(
      CHANNEL_ID,
      CHANNEL_NAME,
      NotificationManager.IMPORTANCE_LOW
    ).apply {
      description = "Mantem a bubble flutuante ativa para acesso rapido"
      setShowBadge(false)
      enableLights(false)
      enableVibration(false)
    }

    manager.createNotificationChannel(channel)
  }

  fun buildNotification(context: Context): Notification {
    val manageIntent = Intent(
      Intent.ACTION_VIEW,
      Uri.parse("petasos://floating-bubble"),
      context,
      MainActivity::class.java
    ).apply {
      addFlags(
        Intent.FLAG_ACTIVITY_NEW_TASK or
          Intent.FLAG_ACTIVITY_SINGLE_TOP or
          Intent.FLAG_ACTIVITY_CLEAR_TOP
      )
    }

    val pendingIntent = PendingIntent.getActivity(
      context,
      7012,
      manageIntent,
      PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
    )

    return NotificationCompat.Builder(context, CHANNEL_ID)
      .setContentTitle("Bubble flutuante ativa")
      .setContentText("Toque para abrir os controles da bubble")
      .setSmallIcon(android.R.drawable.ic_dialog_info)
      .setOngoing(true)
      .setOnlyAlertOnce(true)
      .setSilent(true)
      .setColor(Color.parseColor("#0ea5e9"))
      .setContentIntent(pendingIntent)
      .build()
  }
}