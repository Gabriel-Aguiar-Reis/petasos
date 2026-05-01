package com.gabriel_aguiar.petasos.utils

import android.animation.ValueAnimator
import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.ColorMatrixColorFilter
import android.graphics.PixelFormat
import android.graphics.Typeface
import android.graphics.drawable.BitmapDrawable
import android.graphics.drawable.GradientDrawable
import android.net.Uri
import android.os.Build
import android.util.Log
import android.view.Gravity
import android.view.MotionEvent
import android.view.View
import android.view.ViewGroup
import android.view.WindowInsets
import android.view.WindowManager
import android.view.animation.DecelerateInterpolator
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.ScrollView
import android.widget.TextView
import com.caverock.androidsvg.SVG
import com.gabriel_aguiar.petasos.MainActivity

class OverlayActionSheet(private val context: Context) {

  val actionSheetBackgroundColor = Color.parseColor("#0C1417")
  val actionSheetOverlayColor = Color.parseColor("#80000000")
  val actionSheetPrimaryColor = Color.parseColor("#7ccf00")
  val actionSheetHandleBarColor = Color.parseColor("#4d4d4d")
  val actionSheetTextColor = Color.parseColor("#f5f5f5")
  val actionSheetButtonBorderColor = Color.parseColor("#2d3d40")
  val navBarColor = Color.parseColor("#0C1417")

  private val windowManager = context.getSystemService(Context.WINDOW_SERVICE)
    as WindowManager

  private var overlayView: View? = null
  private var sheetView: View? = null
  private var slideAnimator: ValueAnimator? = null

  data class ActionItem(
    val key: String,
    val label: String,
    val svgAsset: String
  )

  private val primaryActions = listOf(
    ActionItem("trip", "Corrida", "icons/ic_car.svg"),
    ActionItem("fuel-log", "Abastecimento", "icons/ic_fuel.svg"),
    ActionItem("cost", "Custo", "icons/ic_dollar.svg"),
    ActionItem("reminder", "Lembrete", "icons/ic_bell.svg"),
    ActionItem("work-session", "Sessão de Trabalho", "icons/ic_timer.svg"),
    ActionItem("more", "Mais Opções", "icons/ic_more_horizontal.svg"),
  )

  private val secondaryActions = listOf(
    ActionItem("mileage-record", "Quilometragem", "icons/ic_gauge.svg"),
    ActionItem("goal", "Meta", "icons/ic_target.svg"),
    ActionItem("maintenance", "Manutenção", "icons/ic_wrench.svg"),
    ActionItem("planned-absence", "Ausência Planejada", "icons/ic_calendar_minus.svg"),
    ActionItem("special-day", "Dia Especial", "icons/ic_calendar_plus.svg"),
    ActionItem("back", "Voltar", "icons/ic_arrow_left.svg"),
  )

  private var showingMore = false

  fun show() {
    if (overlayView != null) return
    showingMore = false
    buildAndShow(primaryActions, "Adicionar")
  }

  fun dismiss() {
    slideAnimator?.cancel()
    try {
      overlayView?.let { windowManager.removeView(it) }
    } catch (e: IllegalArgumentException) {
      Log.w(TAG, "Overlay already removed", e)
    }
    overlayView = null
    sheetView = null
  }

  fun isShowing(): Boolean = overlayView != null

  private fun buildAndShow(actions: List<ActionItem>, title: String) {
    dismiss()

    val screenWidth = getScreenWidth()
    val screenHeight = getScreenHeight()

    // Root container (full screen overlay)
    val root = LinearLayout(context).apply {
      orientation = LinearLayout.VERTICAL
      setBackgroundColor(actionSheetOverlayColor)
      gravity = Gravity.BOTTOM

      setOnTouchListener { _, event ->
        if (event.action == MotionEvent.ACTION_UP) {
          dismiss()
        }
        true
      }
    }

    // Bottom sheet card
    val sheet = LinearLayout(context).apply {
      orientation = LinearLayout.VERTICAL
      background = GradientDrawable().apply {
        setColor(actionSheetBackgroundColor)
        cornerRadii = floatArrayOf(
          dp(16f), dp(16f), dp(16f), dp(16f),
          0f, 0f, 0f, 0f
        )
      }
      setPadding(0, dp(16f).toInt(), 0, dp(24f).toInt())
      elevation = dp(16f)

      // Prevent clicks on sheet from dismissing
      setOnTouchListener { _, _ -> true }
    }

    // Handle bar
    val handleBar = View(context).apply {
      background = GradientDrawable().apply {
        setColor(actionSheetHandleBarColor)
        cornerRadius = dp(2f)
      }
    }
    val handleParams = LinearLayout.LayoutParams(dp(40f).toInt(), dp(4f).toInt()).apply {
      gravity = Gravity.CENTER_HORIZONTAL
      bottomMargin = dp(12f).toInt()
    }
    sheet.addView(handleBar, handleParams)

    // Title
    val titleView = TextView(context).apply {
      text = title
      setTextColor(actionSheetTextColor)
      textSize = 18f
      typeface = Typeface.DEFAULT_BOLD
      gravity = Gravity.CENTER
      setPadding(dp(16f).toInt(), 0, dp(16f).toInt(), dp(12f).toInt())
    }
    sheet.addView(titleView)

    // ScrollView for buttons
    val scrollView = ScrollView(context).apply {
      layoutParams = LinearLayout.LayoutParams(
        ViewGroup.LayoutParams.MATCH_PARENT,
        ViewGroup.LayoutParams.WRAP_CONTENT
      )
    }

    val buttonsContainer = LinearLayout(context).apply {
      orientation = LinearLayout.VERTICAL
      setPadding(dp(16f).toInt(), 0, dp(16f).toInt(), 0)
    }

    for (action in actions) {
      val button = createActionButton(action)
      buttonsContainer.addView(button)
    }

    scrollView.addView(buttonsContainer)
    sheet.addView(scrollView)

    root.addView(sheet, LinearLayout.LayoutParams(
      ViewGroup.LayoutParams.MATCH_PARENT,
      ViewGroup.LayoutParams.WRAP_CONTENT
    ))

    // Navigation bar spacer
    val navBarSpacer = View(context).apply {
      setBackgroundColor(navBarColor)
      setOnTouchListener { _, _ -> true }
    }
    root.addView(navBarSpacer, LinearLayout.LayoutParams(
      ViewGroup.LayoutParams.MATCH_PARENT,
      getNavigationBarHeight()
    ))

    val params = WindowManager.LayoutParams(
      screenWidth,
      screenHeight + getNavigationBarHeight(),
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
      } else {
        @Suppress("DEPRECATION")
        WindowManager.LayoutParams.TYPE_PHONE
      },
      WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL or
        WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN or
        WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS,
      PixelFormat.TRANSLUCENT
    ).apply {
      gravity = Gravity.TOP or Gravity.START
      x = 0
      y = 0
    }

    windowManager.addView(root, params)
    overlayView = root
    sheetView = sheet

    // Animate slide up
    animateSlideUp(sheet)
  }

  private fun createActionButton(action: ActionItem): LinearLayout {
    val primaryColor = actionSheetPrimaryColor
    val cardColor = actionSheetBackgroundColor
    val borderColor = actionSheetButtonBorderColor
    val textColor = actionSheetTextColor

    val button = LinearLayout(context).apply {
      orientation = LinearLayout.HORIZONTAL
      gravity = Gravity.CENTER_VERTICAL
      setPadding(dp(16f).toInt(), dp(12f).toInt(), dp(16f).toInt(), dp(12f).toInt())
      background = GradientDrawable().apply {
        setColor(cardColor)
        cornerRadius = dp(8f)
        setStroke(dp(2f).toInt(), borderColor)
      }

      isClickable = true
      isFocusable = true

      setOnClickListener { handleAction(action.key) }
    }

    val iconSizePx = dp(22f).toInt()
    val icon = ImageView(context).apply {
      setImageDrawable(loadSvgFromAssets(action.svgAsset, iconSizePx, primaryColor))
      layoutParams = LinearLayout.LayoutParams(iconSizePx, iconSizePx).apply {
        marginEnd = dp(12f).toInt()
      }
    }
    button.addView(icon)

    val label = TextView(context).apply {
      text = action.label
      setTextColor(textColor)
      textSize = 16f
      typeface = Typeface.create(Typeface.DEFAULT, Typeface.NORMAL)
    }
    button.addView(label)

    val container = LinearLayout(context).apply {
      orientation = LinearLayout.VERTICAL
      layoutParams = LinearLayout.LayoutParams(
        ViewGroup.LayoutParams.MATCH_PARENT,
        ViewGroup.LayoutParams.WRAP_CONTENT
      ).apply {
        bottomMargin = dp(8f).toInt()
      }
    }
    container.addView(button)
    return container
  }

  private fun handleAction(key: String) {
    when (key) {
      "more" -> {
        showingMore = true
        buildAndShow(secondaryActions, "Adicionar")
      }
      "back" -> {
        showingMore = false
        buildAndShow(primaryActions, "Adicionar")
      }
      else -> {
        dismiss()
        openDeepLink(key)
      }
    }
  }

  private fun openDeepLink(key: String) {
    Log.d(TAG, "Action selected: $key")

    val intent = Intent(
      Intent.ACTION_VIEW,
      Uri.parse("petasos://bubble-entry?action=$key"),
      context,
      MainActivity::class.java
    ).apply {
      addFlags(
        Intent.FLAG_ACTIVITY_NEW_TASK or
          Intent.FLAG_ACTIVITY_SINGLE_TOP or
          Intent.FLAG_ACTIVITY_CLEAR_TOP
      )
    }

    context.startActivity(intent)
  }

  private fun animateSlideUp(sheet: View) {
    sheet.translationY = dp(400f)
    slideAnimator?.cancel()
    slideAnimator = ValueAnimator.ofFloat(dp(400f), 0f).apply {
      duration = 250L
      interpolator = DecelerateInterpolator()
      addUpdateListener { animator ->
        sheet.translationY = animator.animatedValue as Float
      }
      start()
    }
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

  private fun getNavigationBarHeight(): Int {
    return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
      val insets = windowManager.currentWindowMetrics.windowInsets
        .getInsets(WindowInsets.Type.navigationBars())
      insets.bottom
    } else {
      val resourceId = context.resources.getIdentifier(
        "navigation_bar_height", "dimen", "android"
      )
      if (resourceId > 0) context.resources.getDimensionPixelSize(resourceId) else 0
    }
  }

  private fun loadSvgFromAssets(assetPath: String, sizePx: Int, tintColor: Int): BitmapDrawable? {
    return try {
      val svg = SVG.getFromAsset(context.assets, assetPath)
      svg.documentWidth = sizePx.toFloat()
      svg.documentHeight = sizePx.toFloat()

      val bitmap = Bitmap.createBitmap(sizePx, sizePx, Bitmap.Config.ARGB_8888)
      val canvas = Canvas(bitmap)
      svg.renderToCanvas(canvas)

      BitmapDrawable(context.resources, bitmap).apply {
        colorFilter = ColorMatrixColorFilter(floatArrayOf(
          0f, 0f, 0f, 0f, Color.red(tintColor).toFloat(),
          0f, 0f, 0f, 0f, Color.green(tintColor).toFloat(),
          0f, 0f, 0f, 0f, Color.blue(tintColor).toFloat(),
          0f, 0f, 0f, 1f, 0f,
        ))
      }
    } catch (e: Exception) {
      Log.w(TAG, "Failed to load SVG: $assetPath", e)
      null
    }
  }

  private fun dp(value: Float): Float {
    return value * context.resources.displayMetrics.density
  }

  companion object {
    private const val TAG = "OverlayActionSheet"
  }
}
