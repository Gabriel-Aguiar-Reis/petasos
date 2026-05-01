package com.gabriel_aguiar.petasos.utils

import android.animation.ValueAnimator
import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.graphics.PixelFormat
import android.graphics.Typeface
import android.graphics.drawable.GradientDrawable
import android.os.Build
import android.util.Log
import android.view.Gravity
import android.view.MotionEvent
import android.view.View
import android.view.WindowManager
import android.view.animation.DecelerateInterpolator
import android.widget.ImageView
import android.widget.TextView
import com.gabriel_aguiar.petasos.R
import com.gabriel_aguiar.petasos.service.FloatingBubbleService
import kotlin.math.abs
import kotlin.math.hypot

class FloatingBubbleManager(private val context: Context) {
  private val windowManager = context.getSystemService(Context.WINDOW_SERVICE)
    as WindowManager

  private var bubbleView: View? = null
  private var bubbleParams: WindowManager.LayoutParams? = null

  private var trashView: View? = null
  private var trashParams: WindowManager.LayoutParams? = null
  private var isOverTrash = false
  private var snapAnimator: ValueAnimator? = null
  private val actionSheet = OverlayActionSheet(context)

  fun showBubble() {
    if (bubbleView != null) {
      Log.d(TAG, "Bubble already visible")
      return
    }

    val bubbleSize = dp(BUBBLE_SIZE_DP)
    val params = createLayoutParams(bubbleSize)

    val bubble = ImageView(context).apply {
      setImageResource(R.mipmap.ic_launcher)
      scaleType = ImageView.ScaleType.CENTER_CROP
      contentDescription = "Abrir acesso rapido do Petasos"
      background = GradientDrawable().apply {
        shape = GradientDrawable.OVAL
        setStroke(dp(2), Color.parseColor("#7ccf00"))
      }
      clipToOutline = true
      elevation = dp(10).toFloat()
      setOnTouchListener(createTouchListener())
    }

    windowManager.addView(bubble, params)
    bubbleView = bubble
    bubbleParams = params
    Log.d(TAG, "Bubble added to window")
  }

  fun removeBubble() {
    snapAnimator?.cancel()
    actionSheet.dismiss()
    val currentBubble = bubbleView ?: return

    try {
      windowManager.removeView(currentBubble)
      Log.d(TAG, "Bubble removed from window")
    } catch (exception: IllegalArgumentException) {
      Log.w(TAG, "Bubble was already removed", exception)
    } finally {
      bubbleView = null
      bubbleParams = null
    }
  }

  private fun showTrash() {
    if (trashView != null) return

    val trashSize = dp(TRASH_SIZE_DP)
    val screenWidth = getScreenWidth()
    val screenHeight = getScreenHeight()

    val params = WindowManager.LayoutParams(
      trashSize,
      trashSize,
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
      } else {
        @Suppress("DEPRECATION")
        WindowManager.LayoutParams.TYPE_PHONE
      },
      WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or
        WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN,
      PixelFormat.TRANSLUCENT
    ).apply {
      gravity = Gravity.TOP or Gravity.START
      x = (screenWidth - trashSize) / 2
      y = screenHeight - trashSize - dp(TRASH_BOTTOM_MARGIN_DP)
    }

    val trash = TextView(context).apply {
      text = "\u2715"
      setTextColor(Color.WHITE)
      textSize = 22f
      gravity = Gravity.CENTER
      typeface = Typeface.DEFAULT_BOLD
      contentDescription = "Descartar bubble"
      background = GradientDrawable().apply {
        shape = GradientDrawable.OVAL
        setColor(Color.parseColor("#cc2222"))
        setStroke(dp(2), Color.parseColor("#ff6666"))
      }
      elevation = dp(8).toFloat()
    }

    windowManager.addView(trash, params)
    trashView = trash
    trashParams = params
  }

  private fun hideTrash() {
    val currentTrash = trashView ?: return
    try {
      windowManager.removeView(currentTrash)
    } catch (exception: IllegalArgumentException) {
      Log.w(TAG, "Trash was already removed", exception)
    } finally {
      trashView = null
      trashParams = null
      isOverTrash = false
    }
  }

  private fun checkOverTrash(bubbleX: Int, bubbleY: Int): Boolean {
    val tParams = trashParams ?: return false
    val bubbleSize = dp(BUBBLE_SIZE_DP)
    val trashSize = dp(TRASH_SIZE_DP)
    val bubbleCenterX = bubbleX + bubbleSize / 2f
    val bubbleCenterY = bubbleY + bubbleSize / 2f
    val trashCenterX = tParams.x + trashSize / 2f
    val trashCenterY = tParams.y + trashSize / 2f
    val distance = hypot(bubbleCenterX - trashCenterX, bubbleCenterY - trashCenterY)
    return distance < (bubbleSize / 2f + trashSize / 2f) * TRASH_HIT_FACTOR
  }

  private fun updateBubbleAppearance(overTrash: Boolean) {
    val bubble = bubbleView as? TextView ?: return
    bubble.background = GradientDrawable().apply {
      shape = GradientDrawable.OVAL
      if (overTrash) {
        setColor(Color.parseColor("#cc2222"))
        setStroke(dp(2), Color.parseColor("#ff6666"))
      } else {
        setColor(Color.parseColor("#22292b"))
        setStroke(dp(2), Color.parseColor("#7ccf00"))
      }
    }
  }

  private fun snapToEdge() {
    val params = bubbleParams ?: return
    val view = bubbleView ?: return
    val bubbleSize = dp(BUBBLE_SIZE_DP)
    val screenWidth = getScreenWidth()
    val edgeMargin = dp(EDGE_MARGIN_DP)
    val targetX = if (params.x + bubbleSize / 2 < screenWidth / 2) edgeMargin
                  else screenWidth - bubbleSize - edgeMargin

    snapAnimator?.cancel()
    snapAnimator = ValueAnimator.ofInt(params.x, targetX).apply {
      duration = SNAP_DURATION_MS
      interpolator = DecelerateInterpolator()
      addUpdateListener { animator ->
        val currentX = animator.animatedValue as Int
        params.x = currentX
        try {
          windowManager.updateViewLayout(view, params)
        } catch (exception: IllegalArgumentException) {
          cancel()
        }
      }
      start()
    }
  }

  private fun createTouchListener(): View.OnTouchListener {
    return object : View.OnTouchListener {
      private var initialX = 0
      private var initialY = 0
      private var initialTouchX = 0f
      private var initialTouchY = 0f
      private var hasMoved = false

      override fun onTouch(view: View, event: MotionEvent): Boolean {
        val params = bubbleParams ?: return false

        when (event.action) {
          MotionEvent.ACTION_DOWN -> {
            snapAnimator?.cancel()
            initialX = params.x
            initialY = params.y
            initialTouchX = event.rawX
            initialTouchY = event.rawY
            hasMoved = false
            return true
          }

          MotionEvent.ACTION_MOVE -> {
            val deltaX = (event.rawX - initialTouchX).toInt()
            val deltaY = (event.rawY - initialTouchY).toInt()

            val wasMoved = hasMoved
            if (abs(deltaX) > TOUCH_SLOP || abs(deltaY) > TOUCH_SLOP) {
              hasMoved = true
            }

            if (hasMoved && !wasMoved) {
              showTrash()
            }

            params.x = clampX(initialX + deltaX)
            params.y = clampY(initialY + deltaY)
            windowManager.updateViewLayout(view, params)

            if (hasMoved) {
              val overTrash = checkOverTrash(params.x, params.y)
              if (overTrash != isOverTrash) {
                isOverTrash = overTrash
                updateBubbleAppearance(overTrash)
              }
            }

            return true
          }

          MotionEvent.ACTION_UP -> {
            if (isOverTrash) {
              hideTrash()
              removeBubble()
              context.stopService(
                Intent(context, FloatingBubbleService::class.java)
              )
            } else if (hasMoved) {
              hideTrash()
              snapToEdge()
            } else {
              if (actionSheet.isShowing()) {
                actionSheet.dismiss()
              } else {
                actionSheet.show()
              }
            }
            return true
          }
        }

        return false
      }
    }
  }

  private fun createLayoutParams(bubbleSize: Int): WindowManager.LayoutParams {
    val screenWidth = getScreenWidth()
    val screenHeight = getScreenHeight()

    return WindowManager.LayoutParams(
      bubbleSize,
      bubbleSize,
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
      } else {
        @Suppress("DEPRECATION")
        WindowManager.LayoutParams.TYPE_PHONE
      },
      WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or
        WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN,
      PixelFormat.TRANSLUCENT
    ).apply {
      gravity = Gravity.TOP or Gravity.START
      x = screenWidth - bubbleSize - dp(EDGE_MARGIN_DP)
      y = (screenHeight * 0.25f).toInt()
    }
  }

  private fun clampX(value: Int): Int {
    val bubbleSize = dp(BUBBLE_SIZE_DP)
    val edgeMargin = dp(EDGE_MARGIN_DP)
    return value.coerceIn(edgeMargin, getScreenWidth() - bubbleSize - edgeMargin)
  }

  private fun clampY(value: Int): Int {
    val bubbleSize = dp(BUBBLE_SIZE_DP)
    val bottomInset = dp(32)
    return value.coerceIn(0, getScreenHeight() - bubbleSize - bottomInset)
  } 

  private fun getScreenWidth(): Int {
    return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
      windowManager.currentWindowMetrics.bounds.width()
    } else {
      @Suppress("DEPRECATION")
      context.resources.displayMetrics.widthPixels
    }
  }

  private fun getScreenHeight(): Int {
    return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
      windowManager.currentWindowMetrics.bounds.height()
    } else {
      @Suppress("DEPRECATION")
      context.resources.displayMetrics.heightPixels
    }
  }

  private fun dp(value: Int): Int {
    val density = context.resources.displayMetrics.density
    return (value * density).toInt()
  }

  companion object {
    private const val TAG = "FloatingBubbleManager"
    private const val BUBBLE_SIZE_DP = 60
    private const val EDGE_MARGIN_DP = 10
    private const val TRASH_SIZE_DP = 56
    private const val TRASH_BOTTOM_MARGIN_DP = 48
    private const val TRASH_HIT_FACTOR = 0.9f
    private const val SNAP_DURATION_MS = 200L
    private const val TOUCH_SLOP = 10
  }
}