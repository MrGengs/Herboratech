/**
 * @file lv_port_disp.cpp
 * Display driver port for LVGL on ESP32-S3 using Arduino_GFX
 * Maps LVGL display operations to Arduino_GFX ST7789 driver
 */

#include <lvgl.h>
#include <Arduino_GFX_Library.h>

// Extern gfx object declared in main.cpp
extern Arduino_GFX *gfx;

// Buffer for double-buffering
static lv_disp_draw_buf_t draw_buf;
static lv_color_t buf1[172 * 40];  // Primary buffer: 172×40 pixels (~13KB)
static lv_color_t buf2[172 * 40];  // Secondary buffer for double-buffering

/**
 * Flush display content from LVGL buffer to physical display
 * Called by LVGL whenever a screen region needs to be updated
 */
static void my_disp_flush(lv_disp_drv_t *disp, const lv_area_t *area, lv_color_t *color_p)
{
  // Calculate dimensions of the area to update
  uint32_t w = area->x2 - area->x1 + 1;
  uint32_t h = area->y2 - area->y1 + 1;

  // Cast LVGL color buffer (RGB565) to uint16_t and push to display
  // Arduino_GFX expects uint16_t* for 16-bit color data
  gfx->draw16bitRGBBitmap(area->x1, area->y1, (uint16_t *)color_p, w, h);

  // Signal LVGL that flushing is complete
  lv_disp_flush_ready(disp);
}

/**
 * Initialize LVGL display driver
 * Sets up buffer and display configuration
 */
void lv_port_disp_init(void)
{
  // Initialize the display buffer
  lv_disp_draw_buf_init(&draw_buf, buf1, buf2, 172 * 40);

  // Create display driver
  static lv_disp_drv_t disp_drv;
  lv_disp_drv_init(&disp_drv);

  // Set resolution
  disp_drv.hor_res = 172;
  disp_drv.ver_res = 320;

  // Set buffer
  disp_drv.draw_buf = &draw_buf;

  // Set flush callback
  disp_drv.flush_cb = my_disp_flush;

  // Register display driver
  lv_disp_drv_register(&disp_drv);
}
