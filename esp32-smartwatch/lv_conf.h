/**
 * LVGL Configuration for ESP32-S3 with Waveshare Touch LCD 1.47
 * Minimal config optimized for embedded display
 */

#ifndef LV_CONF_H
#define LV_CONF_H

/* ==================== Display Settings ==================== */
#define LV_HOR_RES_MAX 172      // Waveshare 1.47" horizontal resolution
#define LV_VER_RES_MAX 320      // Waveshare 1.47" vertical resolution
#define LV_COLOR_DEPTH 16       // 16-bit color (RGB565)
#define LV_COLOR_16_SWAP 1      // Swap bytes for TFT_eSPI

/* ==================== Memory Settings ==================== */
#define LV_MEM_CUSTOM 0         // Use default memory allocation
#define LV_MEM_SIZE (64U * 1024U)  // 64KB for LVGL objects

/* ==================== Feature Toggles ==================== */
#define LV_USE_LOG 1            // Enable logging
#define LV_LOG_LEVEL LV_LOG_LEVEL_WARN

#define LV_USE_ASSERT_MEM 1
#define LV_USE_ASSERT_MEM_INTEGRITY 0
#define LV_USE_ASSERT_OBJ 1
#define LV_USE_ASSERT_STYLE 1

/* ==================== Rendering ==================== */
#define LV_VDB_SIZE (LV_HOR_RES_MAX * 40)  // Virtual display buffer
#define LV_ANTIALIAS 1

/* ==================== Widgets ==================== */
#define LV_USE_ARC 1
#define LV_USE_BAR 1
#define LV_USE_BTN 1
#define LV_USE_BTNMATRIX 0
#define LV_USE_CANVAS 0
#define LV_USE_CHECKBOX 0
#define LV_USE_COLORWHEEL 0
#define LV_USE_CONT 0
#define LV_USE_CPICKER 0
#define LV_USE_GAUGE 0          // Disabled for space
#define LV_USE_IMG 0
#define LV_USE_IMGBTN 0
#define LV_USE_KEYBOARD 0
#define LV_USE_LABEL 1
#define LV_USE_LED 0
#define LV_USE_LINE 0
#define LV_USE_LIST 0
#define LV_USE_MENU 0
#define LV_USE_MSGBOX 0
#define LV_USE_OBJX_TEMPLATES 0
#define LV_USE_ROLLER 0
#define LV_USE_SLIDER 1
#define LV_USE_SPINBOX 0
#define LV_USE_SPINNER 0
#define LV_USE_SWITCH 0
#define LV_USE_TEXTAREA 0
#define LV_USE_TABLE 0
#define LV_USE_TABVIEW 0
#define LV_USE_TILEVIEW 0
#define LV_USE_WIN 0

/* ==================== Animations & Effects ==================== */
#define LV_USE_ANIMATION 1
#define LV_USE_GROUP 1
#define LV_USE_THEME_MATERIAL 1
#define LV_USE_THEME_MONO 0

/* ==================== Font Settings ==================== */
#define LV_FONT_MONTSERRAT_10 1
#define LV_FONT_MONTSERRAT_12 1
#define LV_FONT_MONTSERRAT_14 1
#define LV_FONT_MONTSERRAT_16 1
#define LV_FONT_DEFAULT &lv_font_montserrat_14

/* ==================== Input Devices ==================== */
#define LV_USE_INDEV_SIMUL 0
#define LV_INDEV_DEF_PERIOD 30

/* ==================== Touch Input ==================== */
#define LV_USE_TOUCH 1

/* ==================== Others ==================== */
#define LV_ENABLE_GC 0

#endif /* LV_CONF_H */
