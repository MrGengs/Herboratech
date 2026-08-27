/**
 * @file lv_port_indev.cpp
 * Input device driver port for LVGL on ESP32-S3 using FT6206 touch
 * Maps FT6206 touch input to LVGL input events
 */

#include <lvgl.h>
#include <Adafruit_FT6206.h>

// Extern touch sensor object declared in main.cpp
extern Adafruit_FT6206 ts;

/**
 * Read touch input and report to LVGL
 * Called by LVGL periodically (every 50ms by default)
 */
static void touchpad_read(lv_indev_drv_t *indev_drv, lv_indev_data_t *data)
{
  // Check if touch is detected
  if (ts.touched()) {
    // Get touch point
    TS_Point p = ts.getPoint();

    // Report touch pressed state
    data->state = LV_INDEV_STATE_PR;

    // Set touch coordinates
    data->point.x = p.x;
    data->point.y = p.y;

    Serial.print("[LVGL Touch] X=");
    Serial.print(p.x);
    Serial.print(" Y=");
    Serial.println(p.y);
  } else {
    // No touch detected
    data->state = LV_INDEV_STATE_REL;
  }
}

/**
 * Initialize LVGL input device driver
 * Sets up touchpad driver for FT6206
 */
void lv_port_indev_init(void)
{
  // Create input device driver for touchpad
  static lv_indev_drv_t indev_drv;
  lv_indev_drv_init(&indev_drv);

  // Set driver type to touchpad
  indev_drv.type = LV_INDEV_TYPE_POINTER;

  // Set read callback
  indev_drv.read_cb = touchpad_read;

  // Register input device driver
  lv_indev_drv_register(&indev_drv);
}
