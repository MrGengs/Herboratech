@echo off
REM 🔔 Windows Task Completion Notification with Sound
REM Usage: notify.bat "Task Name" or call notify.bat after command

setlocal enabledelayedexpansion
set TASK_NAME=%1
if "%TASK_NAME%"=="" set TASK_NAME=Task Completed

REM Clear screen
cls

REM Display notification
echo.
echo ╔════════════════════════════════════════╗
echo ║                                        ║
echo ║  [OK] %TASK_NAME%
echo ║                                        ║
echo ║  Completed at: %date% %time%
echo ║                                        ║
echo ╚════════════════════════════════════════╝
echo.
echo 🔔 DING! DING! DING!
echo.

REM Play system beep sound (3 times) — Multiple methods for compatibility
REM Method 1: PowerShell beep (Windows 10/11)
(
  powershell -Command "[Console]::Beep(1000, 500)" 2>nul &
  timeout /t 1 /nobreak >nul
  powershell -Command "[Console]::Beep(1200, 500)" 2>nul &
  timeout /t 1 /nobreak >nul
  powershell -Command "[Console]::Beep(1000, 500)" 2>nul
) || (
  REM Method 2: Fallback - Windows sound file (if available)
  if exist "C:\Windows\Media\tada.wav" (
    powershell -Command "Add-Type -AssemblyName System.IO; (New-Object System.Media.SoundPlayer 'C:\Windows\Media\tada.wav').PlaySync()"
  ) || (
    REM Method 3: Final fallback - System bell character
    echo
  )
)

REM Alternative: Windows notification (Windows 10+)
powershell -Command "Add-Type -AssemblyName System.Windows.Forms; $notifyIcon = New-Object System.Windows.Forms.NotifyIcon; $notifyIcon.Icon = [System.Drawing.SystemIcons]::Information; $notifyIcon.Visible = $true; $notifyIcon.ShowBalloonTip(3000, '✅ Task Complete', '%TASK_NAME%', [System.Windows.Forms.ToolTipIcon]::Info)"

echo Ready for next task!
echo.

endlocal
