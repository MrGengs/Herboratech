/**
 * @file lv_port_indev.h
 * Input device driver port header for LVGL
 */

#ifndef LV_PORT_INDEV_H
#define LV_PORT_INDEV_H

#ifdef __cplusplus
extern "C" {
#endif

/**
 * Initialize LVGL input device driver (touchpad)
 */
void lv_port_indev_init(void);

#ifdef __cplusplus
} /* extern "C" */
#endif

#endif /* LV_PORT_INDEV_H */
