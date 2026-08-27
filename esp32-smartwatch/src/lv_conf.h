/**
 * @file lv_conf.h
 * LVGL Configuration untuk ESP32-S3 Waveshare 1.47" Touch LCD
 * Resolution: 172×320 pixels, 16-bit color
 */

#ifndef LV_CONF_H
#define LV_CONF_H

#include <stdint.h>
#include <stdbool.h>

/* ========================== Color Depth ========================== */
#define LV_COLOR_DEPTH 16  // 16-bit RGB565 format

/* ========================== Display Resolution ========================== */
#define LV_HOR_RES_MAX 172
#define LV_VER_RES_MAX 320

/* ========================== Memory Configuration ========================== */
/*
 * ESP32-S3: 320KB RAM available
 * Display buffer: 172 × 40 pixels = ~13KB per buffer
 * We'll use 2 buffers (double buffer) for smooth rendering
 * Total: ~26KB + LVGL overhead (~30KB) = ~56KB used, leaving ~260KB for app
 */
#define LV_MEM_SIZE (56 * 1024U)  // 56KB for LVGL memory pool

/* ========================== Display Buffer Configuration ========================== */
#define LV_DISP_DEF_REFR_PERIOD 33  // ~30 FPS (33ms per frame)

/* ========================== Feature Toggles ========================== */
#define LV_USE_LOG 1
#define LV_LOG_LEVEL LV_LOG_LEVEL_WARN

/* Graphics optimization */
#define LV_OPTIMIZED_FONTDRAW_ENABLE 1

/* ========================== Widget Configuration ========================== */
/* Label */
#define LV_USE_LABEL 1
#define LV_LABEL_TEXT_SELECTION 0  /* Save memory: no text selection */

/* Button */
#define LV_USE_BTN 1

/* Arc (untuk temperature display) */
#define LV_USE_ARC 1

/* Slider (untuk brightness) */
#define LV_USE_SLIDER 1

/* Bar (progress bar) */
#define LV_USE_BAR 1

/* Image */
#define LV_USE_IMG 1

/* Container */
#define LV_USE_CONT 1
#define LV_USE_OBJ 1

/* Checkbox, Spinbox, dll — keep minimum for header parsing, optimize later */
#define LV_USE_CHECKBOX 0
#define LV_USE_SWITCH 0
#define LV_USE_MSGBOX 0
#define LV_USE_KEYBOARD 0
#define LV_USE_TEXTAREA 1  /* Required by spinbox */
#define LV_USE_SPINBOX 1   /* Required to parse headers, optimize later */
#define LV_USE_ROLLER 0
#define LV_USE_DROPDOWN 0

/* ========================== Font Configuration ========================== */
#define LV_FONT_MONTSERRAT_12 1
#define LV_FONT_MONTSERRAT_14 1
#define LV_FONT_MONTSERRAT_16 1
#define LV_FONT_MONTSERRAT_20 1
#define LV_FONT_MONTSERRAT_24 1
#define LV_FONT_MONTSERRAT_28 1

#define LV_FONT_DEFAULT &lv_font_montserrat_14

/* ========================== Animation & Transition ========================== */
#define LV_USE_ANIMATION 1
#define LV_ANIM_DEF_TIME 300  // Default animation time: 300ms

/* ========================== Touch Input ========================== */
#define LV_USE_INDEV 1
#define LV_INDEV_DEF_PERIOD 50  // Check touch input every 50ms
#define LV_INDEV_DEF_READ_PERIOD 50

/* ========================== Screen Handling ========================== */
#define LV_SCRL_POS_DEF_X 0
#define LV_SCRL_POS_DEF_Y 0

/* ========================== Extra Module (optional) ========================== */
#define LV_USE_EXTRA 0  /* Disable extra module entirely to save memory */

/* ========================== Other Optimizations ========================== */
#define LV_BUILD_EXAMPLES 0  /* Disable built-in examples to save memory */

#endif /* LV_CONF_H */
