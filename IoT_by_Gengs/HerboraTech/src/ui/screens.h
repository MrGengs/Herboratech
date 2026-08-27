#ifndef EEZ_LVGL_UI_SCREENS_H
#define EEZ_LVGL_UI_SCREENS_H

#include <lvgl.h>

#ifdef __cplusplus
extern "C" {
#endif

// Screens

enum ScreensEnum {
    _SCREEN_ID_FIRST = 1,
    SCREEN_ID_MAIN = 1,
    _SCREEN_ID_LAST = 1
};

typedef struct _objects_t {
    lv_obj_t *main;
    lv_obj_t *tile_03_1;
    lv_obj_t *obj0;
    lv_obj_t *obj1;
    lv_obj_t *steps_text_1;
    lv_obj_t *obj2;
    lv_obj_t *tile_02_1;
    lv_obj_t *suhu_tubuh_text_1;
    lv_obj_t *obj3;
    lv_obj_t *obj4;
    lv_obj_t *tile_01_1;
    lv_obj_t *obj5;
    lv_obj_t *spo2_text_1;
    lv_obj_t *obj6;
    lv_obj_t *obj7;
    lv_obj_t *heart_text_1;
    lv_obj_t *obj8;
    lv_obj_t *screen_main;
    lv_obj_t *hour_text;
    lv_obj_t *day_text;
    lv_obj_t *date_text;
    lv_obj_t *connnect_ble;
    lv_obj_t *obj9;
} objects_t;

extern objects_t objects;

void create_screen_main();
void tick_screen_main();

void tick_screen_by_id(enum ScreensEnum screenId);
void tick_screen(int screen_index);

void create_screens();

#ifdef __cplusplus
}
#endif

#endif /*EEZ_LVGL_UI_SCREENS_H*/