#include <Arduino_GFX_Library.h>
#include "esp_lcd_touch_axs5106l.h"
#include <LovyanGFX.hpp>
#include "NotoSansBold15.h"
#include "Latin_Hiragana_24.h"

#define Touch_I2C_SDA 42
#define Touch_I2C_SCL 41
#define Touch_RST     47
#define Touch_INT     48

#define GFX_BL 46
#define LCD_RST 40
#define BAT_PIN 12

float voltage=0;
char vol_buffer[20];
int batLevel=0;

//boot button used to change mode
#define RIGHT 0

LGFX_Sprite sprite; 

// needed for touch
touch_data_t touch_data;
uint8_t touchpad_cnt = 0;
bool deb=0;

//brightness data
int b=2;  //starting brightnes 
int bri[6]={40,80,120,160,200,240};

//position and size of graph
int gw=204;
int gh=78;
int gx=110;
int gy=122;
int curent=0;

int values[24]={0};
int values2[24]={0};
char timeHour[3]="00";
char timeMin[3]="00";
char timeSec[3]="00";

//time
int h=0; int m=0; int s=0;

int Min=gh/2;
int Max=gh/2;
int average=0;
String minT="";
String maxT="";


//gpio switches
int pin1=7;
int pin2=10;
int analogPin=11;
String pinT1="00:00:00";
String pinT2="00:00:00";
bool pinState1=0;
bool pinState2=0;
String states[2]={"LOW","HIGHT"};

unsigned long lastTime = 0;
unsigned long lastMillis=0;
unsigned long lastRead=0;
int readPeriod=1;
int fps=0;

#define gray 0x6B6D
#define blue 0x0967
#define lightblue TFT_ORANGE
#define purple 0x2025
#define green 0x00A3
unsigned short grays[13];
unsigned short onOffCol[2]={TFT_RED,0x2D61};

bool Mode=1;



Arduino_DataBus *bus = new Arduino_ESP32SPI(45 /* DC */, 21 /* CS */, 38 /* SCK */, 39 /* MOSI */);

Arduino_GFX *gfx = new Arduino_ST7789(
  bus, 47 /* RST */, 0 /* rotation */, false /* IPS */,
  172 /* width */, 320 /* height */,
  34 /*col_offset1*/, 0 /*uint8_t row_offset1*/,
  34 /*col_offset2*/, 0 /*row_offset2*/);

void lcd_reg_init(void) {

  static const uint8_t init_operations[] = {
    BEGIN_WRITE,
    WRITE_COMMAND_8, 0x11,  // 2: Out of sleep mode, no args, w/delay
    END_WRITE,
    DELAY, 120,

    BEGIN_WRITE,
    WRITE_C8_D16, 0xDF, 0x98, 0x53,
    WRITE_C8_D8, 0xB2, 0x23, 

    WRITE_COMMAND_8, 0xB7,
    WRITE_BYTES, 4,
    0x00, 0x47, 0x00, 0x6F,

    WRITE_COMMAND_8, 0xBB,
    WRITE_BYTES, 6,
    0x1C, 0x1A, 0x55, 0x73, 0x63, 0xF0,

    WRITE_C8_D16, 0xC0, 0x44, 0xA4,
    WRITE_C8_D8, 0xC1, 0x16, 

    WRITE_COMMAND_8, 0xC3,
    WRITE_BYTES, 8,
    0x7D, 0x07, 0x14, 0x06, 0xCF, 0x71, 0x72, 0x77,

    WRITE_COMMAND_8, 0xC4,
    WRITE_BYTES, 12,
    0x00, 0x00, 0xA0, 0x79, 0x0B, 0x0A, 0x16, 0x79, 0x0B, 0x0A, 0x16, 0x82,

    WRITE_COMMAND_8, 0xC8,
    WRITE_BYTES, 32,
    0x3F, 0x32, 0x29, 0x29, 0x27, 0x2B, 0x27, 0x28, 0x28, 0x26, 0x25, 0x17, 0x12, 0x0D, 0x04, 0x00, 0x3F, 0x32, 0x29, 0x29, 0x27, 0x2B, 0x27, 0x28, 0x28, 0x26, 0x25, 0x17, 0x12, 0x0D, 0x04, 0x00,

    WRITE_COMMAND_8, 0xD0,
    WRITE_BYTES, 5,
    0x04, 0x06, 0x6B, 0x0F, 0x00,

    WRITE_C8_D16, 0xD7, 0x00, 0x30,
    WRITE_C8_D8, 0xE6, 0x14, 
    WRITE_C8_D8, 0xDE, 0x01, 

    WRITE_COMMAND_8, 0xB7,
    WRITE_BYTES, 5,
    0x03, 0x13, 0xEF, 0x35, 0x35,

    WRITE_COMMAND_8, 0xC1,
    WRITE_BYTES, 3,
    0x14, 0x15, 0xC0,

    WRITE_C8_D16, 0xC2, 0x06, 0x3A,
    WRITE_C8_D16, 0xC4, 0x72, 0x12,
    WRITE_C8_D8, 0xBE, 0x00, 
    WRITE_C8_D8, 0xDE, 0x02, 

    WRITE_COMMAND_8, 0xE5,
    WRITE_BYTES, 3,
    0x00, 0x02, 0x00,

    WRITE_COMMAND_8, 0xE5,
    WRITE_BYTES, 3,
    0x01, 0x02, 0x00,

    WRITE_C8_D8, 0xDE, 0x00, 
    WRITE_C8_D8, 0x35, 0x00, 
    WRITE_C8_D8, 0x3A, 0x05, 

    WRITE_COMMAND_8, 0x2A,
    WRITE_BYTES, 4,
    0x00, 0x22, 0x00, 0xCD,

    WRITE_COMMAND_8, 0x2B,
    WRITE_BYTES, 4,
    0x00, 0x00, 0x01, 0x3F,

    WRITE_C8_D8, 0xDE, 0x02, 

    WRITE_COMMAND_8, 0xE5,
    WRITE_BYTES, 3,
    0x00, 0x02, 0x00,
    
    WRITE_C8_D8, 0xDE, 0x00, 
    WRITE_C8_D8, 0x36, 0x00,
    WRITE_COMMAND_8, 0x21,
    END_WRITE,
    
    DELAY, 10,

    BEGIN_WRITE,
    WRITE_COMMAND_8, 0x29,  // 5: Main screen turn on, no args, w/delay
    END_WRITE
  };
  bus->batchOperation(init_operations, sizeof(init_operations));
}





void setup(void) {

  Serial.begin(115200);
  Serial.println("Arduino_GFX Hello World example");

  pinMode(pin1, OUTPUT);
  pinMode(pin2, OUTPUT);
  digitalWrite(pin1,pinState1);
  digitalWrite(pin2,pinState2);


  pinMode(LCD_RST, OUTPUT);
  digitalWrite(LCD_RST,0);
  delay(10);
  digitalWrite(LCD_RST,1);

  analogWrite(GFX_BL, bri[b]);

  pinMode(RIGHT,INPUT_PULLUP);

  // Init Display
  gfx->begin();
  lcd_reg_init();
  gfx->setRotation(1);

  sprite.setColorDepth(16);     // RGB565
  sprite.createSprite(320, 172); 

  Wire.begin(Touch_I2C_SDA, Touch_I2C_SCL);
  bsp_touch_init(&Wire, Touch_RST, Touch_INT, gfx->getRotation(), gfx->width(), gfx->height());

  int co = 240;
  for (int i = 0; i < 13; i++) {
    grays[i] = sprite.color565(co, co, co);
    co = co - 18;
  }
}

void draw()
{
  sprite.fillSprite(TFT_BLACK);
  sprite.setTextDatum(4);
  
  //draw battery
  sprite.drawRect(270,3,40,16,grays[2]);
  sprite.fillRect(310,8,4,6,grays[2]);

  sprite.fillRect(274,7,batLevel,8,0x2D61);

  sprite.fillRoundRect(6,0,38,36,4,blue);
  sprite.fillRoundRect(50,0,38,36,4,blue);
  sprite.fillCircle(46,16,2,grays[3]);
   sprite.fillCircle(46,23,2,grays[3]);
  
  sprite.fillRoundRect(94,0,36,22,4,lightblue);

  sprite.fillRoundRect(6,42,80,18,4,blue);
  
  sprite.fillRoundRect(6,121,80,50,4,purple);
  sprite.fillRoundRect(6,66,80,50,4,green);

  sprite.fillCircle(12,75,3,onOffCol[pinState1]);
  sprite.fillCircle(12,131,3,onOffCol[pinState2]);

  sprite.loadFont(Latin_Hiragana_24);
  sprite.setTextColor(grays[2],blue);
  sprite.drawString(String(timeHour),12,22);
  sprite.drawString(String(timeMin),54,22);
  sprite.unloadFont();
  sprite.setTextColor(grays[4],blue);
  sprite.drawString("LIGHT",12,51);

  //battery
  for(int i=0;i<6;i++)
  sprite.fillRect(48+(i*6),46,4,10,TFT_BLACK);

   for(int i=0;i<b+1;i++)
  sprite.fillRect(48+(i*6),46,4,10,TFT_ORANGE);

  sprite.setTextColor(0x7CD4,TFT_BLACK);
  sprite.drawString("CURR: "+String(average),256,148,2);
  sprite.drawString("MIN: "+String(Min),96,148,2);
  sprite.drawString("MAX: "+String(Max),170,148,2);
  
  sprite.setTextColor(grays[8],TFT_BLACK);
  sprite.drawString(maxT,170,162);
  sprite.drawString(minT,96,162);
  sprite.drawString("AVG:"+String(average),256,162);
  sprite.setTextColor(grays[7],TFT_BLACK);
  sprite.drawString(String(fps)+" FPS",94,31);
  

  sprite.loadFont(NotoSansBold15);
  sprite.setTextColor(TFT_ORANGE,TFT_BLACK);
  sprite.drawString("ANALOG READ",gx+30,10);
  sprite.drawString("GPIO "+String(analogPin),gx+30,26);
  sprite.setTextColor(TFT_BLACK,lightblue);
  sprite.drawString(String(timeSec),gx-8,13);


  sprite.setTextColor(grays[5],green);
  sprite.drawString("GPIO "+String(pin1),20,79);
  sprite.setTextColor(grays[5],purple);
  sprite.drawString("GPIO "+String(pin2),20,134);

  sprite.setTextColor(grays[2],green);
  sprite.drawString(states[pinState1],20,96);
  sprite.setTextColor(grays[7],green);
  sprite.drawString(pinT1,20,110,1);

  sprite.setTextColor(grays[2],purple);
  sprite.drawString(states[pinState2],20,151);
  sprite.setTextColor(grays[7],purple);
  sprite.drawString(pinT2,20,165,1);
  sprite.unloadFont();


  sprite.setTextColor(grays[2],TFT_BLACK);

  for(int i=1;i<12;i++){
  sprite.drawLine(gx+(i*17),gy,gx+(i*17),gy-gh,grays[10]);
  if(i*17%34==0)
  if(i*2<10)
  sprite.drawString("0"+String(i*2),gx+(i*17)-3,gy+8);
  else
  sprite.drawString(String(i*2),gx+(i*17)-4,gy+8);
  }

  
  for(int i=1;i<6;i++){
  sprite.drawLine(gx,gy-(i*(gh/6)),gx+gw,gy-(i*(gh/6)),grays[10]);
  sprite.drawString(String(i*(100/6)),gx-16,gy-(i*(gh/6)));
  }

    sprite.drawLine(gx,gy,gx+gw,gy,grays[3]);
    sprite.drawLine(gx,gy,gx,gy-gh,grays[3]);

   for(int i=0;i<23;i++){
 sprite.drawLine(gx+(i*17),gy-values[i],gx+((i+1)*17),gy-values[i+1],TFT_RED);
 sprite.drawLine(gx+(i*17),gy-values[i]-1,gx+((i+1)*17),gy-values[i+1]-1,TFT_RED);}

  sprite.setTextColor(grays[2],TFT_BLACK);
  sprite.drawString("BAT:"+String(voltage),gx+160,28); 
  sprite.setTextColor(grays[8],TFT_BLACK);
  sprite.drawString("MOD:"+String(Mode),gx+160,38); 
  sprite.setTextColor(grays[8],TFT_BLACK);
  sprite.drawString("VOLOS",gx+96,24); 
  sprite.setTextColor(grays[10],TFT_BLACK);
  sprite.drawString("PROJECTS",gx+96,34); 
 


uint16_t *buf = (uint16_t*)sprite.getBuffer();
int total = 320 * 172;

for (int i = 0; i < total; i++) {
    buf[i] = __builtin_bswap16(buf[i]);
}

gfx->draw16bitRGBBitmap(0, 0, buf, 320, 172);
}

void measureBatt()
{
    uint16_t analogVolts = analogReadMilliVolts(BAT_PIN);
    voltage = analogVolts * 3.0 / 1000;
    sprintf(vol_buffer, "%.1f", voltage);  
    batLevel=map(voltage*100,0,440,0,34);
}

void loop() {



static bool lastPressed = false;

bsp_touch_read();
bool pressed = bsp_touch_get_coordinates(&touch_data);

// activation only once per press
if (pressed && !lastPressed) {

    // changing brightness
    if (touch_data.coords[0].x > 0 && touch_data.coords[0].x < 80 &&
        touch_data.coords[0].y > 0 && touch_data.coords[0].y < 66)
    {
        b++;
        if (b > 5) b = 0;
        analogWrite(GFX_BL, bri[b]);
    }

    // if switcj 1 is pressed
        if (touch_data.coords[0].x > 0 && touch_data.coords[0].x < 80 &&
        touch_data.coords[0].y > 66 && touch_data.coords[0].y < 121)
    {
        pinState1=!pinState1;
         pinT1=String(timeHour)+":"+String(timeMin)+":"+String(timeSec);
          digitalWrite(pin1,pinState1);
    }

       // if switcj 2 is pressed
        if (touch_data.coords[0].x > 0 && touch_data.coords[0].x < 80 &&
        touch_data.coords[0].y > 121 && touch_data.coords[0].y < 170)
    {
        pinState2=!pinState2;
        pinT2=String(timeHour)+":"+String(timeMin)+":"+String(timeSec);
         digitalWrite(pin2,pinState2);
    }

           if (touch_data.coords[0].x > 280 && touch_data.coords[0].x < 320 &&
        touch_data.coords[0].y > 0 && touch_data.coords[0].y < 60)
    {
       Mode=!Mode;
    }
}
lastPressed = pressed;

  if (millis() - lastTime >= 1000) {
    lastTime = millis();

    s++;
    if(s>59) {s=0; m++;}
    if(m>59){m=0; h++;}
    if(h>99){h=0;}

    sprintf(timeSec, "%02d", s);
    sprintf(timeMin, "%02d", m);
    sprintf(timeHour, "%02d", h);
    
  }

   if(digitalRead(RIGHT)==0){
      if(deb==0)
      {
      deb=1;
      Mode=!Mode; 
      }}else{deb=0;}

  fps=1000/(millis()-lastMillis);
  lastMillis=millis();
  
  
/*unsigned long lastRead=0;
int readPeriod=1;*/

if (millis() - lastRead >= readPeriod)
{

lastRead=millis();
average=0;

if(Mode==0){
 if(values[23]>12)
 curent=random(values[23]-12,values[23]+12);
 else
 curent=random(1,values[23]+14);

 if(curent>gh)
 curent=random(gh-10,gh);
}


 if(Mode==1){
 int num=analogRead(analogPin);
 curent=map(num,0,1024,0,gh);
 }

 for(int i=0;i<24;i++)
 values2[i]=values[i];

 for(int i=23;i>0;i--)
 values[i-1]=values2[i];
 
 values[23]=curent;
 if(values[23]>Max){
 Max=values[23];
 maxT=String(timeHour)+":"+String(timeMin)+":"+String(timeSec);}
  if(values[23]<Min){
  Min=values[23];
  minT=String(timeHour)+":"+String(timeMin)+":"+String(timeSec);}
 
  for(int i=0;i<24;i++)
  average=average+values[i];
  average=average/24;
}

measureBatt();
draw();
}
