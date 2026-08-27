# 🔔 Task Completion Notification System

**Automatic sound alert when tasks complete!**

---

## 🚀 QUICK START

### Windows (PowerShell / CMD)

**Option 1: Single notification**
```bash
# After any command
git push origin main && notify.bat "Push complete!"

# Or standalone
notify.bat "My Task"
```

**Option 2: Make it default**
```bash
# Add alias to PowerShell profile
notepad $PROFILE

# Add these lines:
function Notify-Task { & 'C:\Users\mosto\Desktop\HERBORATECH\notify.bat' $args }
Set-Alias -Name notify -Value Notify-Task

# Then use:
git push origin main && notify "Upload complete"
```

### Linux / macOS (Bash)

**Make script executable**
```bash
chmod +x /path/to/notify.sh
```

**Use in commands**
```bash
# After command
git push origin main && ./notify.sh "Push complete!"

# Or add to ~/.bashrc for global use
echo "alias notify='/path/to/notify.sh'" >> ~/.bashrc
source ~/.bashrc

# Then use:
git push origin main && notify "Upload done"
```

---

## 📝 USAGE EXAMPLES

### Git Operations
```bash
# Commit and notify
git commit -m "New feature" && notify "Commit done"

# Push and notify
git push origin main && notify "Pushed to GitHub"

# Full workflow
git add . && git commit -m "Update" && git push origin main && notify "All pushed!"
```

### Build & Test
```bash
# Build with notification
pio run -e esp32-s3-devkitc-1 && notify "Build complete!"

# Run tests
npm test && notify "Tests passed!"

# Docker build
docker build . && notify "Docker image built"
```

### Long-Running Tasks
```bash
# OCR processing
python ocr_vademekum_batch13a.py && notify "OCR finished - 200 pages processed"

# Data sync
firebase deploy && notify "Firebase deployment complete"

# Overnight processes
long_running_script.sh && notify "Overnight batch finished"
```

---

## 🎵 Sound Options

### Windows Notification Features

**Current Sounds:**
- ✅ PowerShell beep (1000Hz, 500ms, 3x)
- ✅ Windows toast notification (if Windows 10+)
- ✅ System bell

**Customize sound frequency:**
Edit `notify.bat`:
```batch
REM Change frequency and duration
powershell -Command "[Console]::Beep(2000, 300)"  REM 2000Hz, 300ms

REM Beep patterns:
REM Success: 1000Hz (low-mid tone)
REM Alert: 2000Hz (high tone)
REM Complete: 3000Hz (very high)
```

### Linux/macOS Options

**Available sound systems:**
1. **Terminal bell** (default, works everywhere) `printf '\a'`
2. **speaker-test** (Linux) - generates sine wave
3. **paplay** (PulseAudio Linux) - plays audio files
4. **osascript** (macOS) - system notification
5. **notify-send** (Linux) - desktop notification

---

## 🔧 ADVANCED USAGE

### Create Custom Notifications

**Windows - High-priority alert**
```batch
@echo off
REM 3-beep critical alert
for /L %%i in (1,1,3) do (
    powershell -Command "[Console]::Beep(3000, 800)"
    timeout /t 1 /nobreak >nul
)
echo ⚠️  CRITICAL: %1
```

**Linux - Desktop notification**
```bash
#!/bin/bash
# Show desktop notification
notify-send -u critical "✅ Complete" "$1"

# Add sound
if command -v paplay &> /dev/null; then
    paplay /usr/share/sounds/freedesktop/stereo/complete.oga
fi
```

### Chain Multiple Tasks with Notifications

```bash
# Sequential with notifications after each
task1.sh && notify "Task 1 done" && \
task2.sh && notify "Task 2 done" && \
task3.sh && notify "All tasks complete!"
```

### Background Process Monitoring

```bash
# Run in background, notify when done
(git push origin main & notify "Push done") &

# Or with process tracking
long_task.sh &
TASK_PID=$!
wait $TASK_PID && notify "Background task finished"
```

---

## 📍 INTEGRATION POINTS

### Git Workflow
```bash
# After sensitive operations
git push --force-with-lease origin main && notify "Force push complete - verify!"

# Tag and release
git tag -a v1.0.0 && git push origin v1.0.0 && notify "Release v1.0.0 pushed"
```

### Firebase Deployment
```bash
# Notify when deployment finishes
firebase deploy --only hosting && notify "✅ Firebase deployment live"

# Check before notifying
firebase deploy && echo "Checking status..." && firebase hosting:channel:list && notify "Deployment verified"
```

### Development Workflow
```bash
# PlatformIO build
pio run -e esp32-s3-devkitc-1 -t upload && notify "✅ Firmware uploaded to device"

# Python script execution
python scripts/parse_ocr_batch13b.py && notify "✅ Parsing complete - 287 herbals extracted"

# Docker operations
docker build -t herboratech . && notify "✅ Docker image built"
```

---

## 🎯 USE CASES

### ✅ When to Use Notifications

| Scenario | Command | Notification |
|----------|---------|--------------|
| Long push to GitHub | `git push origin main && notify "Pushed"` | ✓ |
| Large file uploads | `firebase deploy && notify "Live"` | ✓ |
| Batch processing | `python ocr_script.py && notify "Done"` | ✓ |
| Tests running | `npm test && notify "Tests complete"` | ✓ |
| Overnight builds | `docker build . && notify "Ready"` | ✓ |
| Compilation | `pio run && notify "Build done"` | ✓ |

### ❌ Don't Need Notifications

- Quick commands (<5 seconds)
- Commands you're watching
- Interactive processes
- Error-prone operations

---

## 🔊 SOUND LEVELS

### Quiet (office/shared space)
```bash
# Single beep
powershell -Command "[Console]::Beep(500, 200)"
```

### Normal (home/private)
```bash
# Standard 3-beep (current default)
# Frequency: 1000Hz, Duration: 500ms each
```

### Loud (attention-critical)
```bash
# High-frequency alert
powershell -Command "[Console]::Beep(3000, 800)"
```

---

## 🐛 TROUBLESHOOTING

### No sound on Windows
- ✅ Check volume is not muted
- ✅ Verify speakers are connected
- ✅ Try: `powershell -Command "[Console]::Beep(1000, 500)"`

### No sound on Linux
- ✅ Check `pulseaudio` or `alsa` running
- ✅ Test: `speaker-test -t sine -f 1000 -l 1`
- ✅ Install: `sudo apt install alsa-utils`

### macOS notification not showing
- ✅ Allow notifications in System Preferences
- ✅ Check: `osascript -e "display notification \"Test\""`

---

## 📋 INSTALLATION

### Windows
```bash
# Scripts already in HERBORATECH root
# Just use: notify.bat "Message"

# Or add to PATH for global use
setx PATH "%PATH%;C:\Users\mosto\Desktop\HERBORATECH"
```

### Linux/macOS
```bash
# Copy to /usr/local/bin for global access
sudo cp /path/to/notify.sh /usr/local/bin/notify
sudo chmod +x /usr/local/bin/notify

# Then use from anywhere: notify "Done!"
```

---

## 🎨 Customize Appearance

Edit the notification display by modifying notify script:

**Windows (.bat)**
```batch
echo ╔════════════════════════════════════════╗  REM Change borders
echo ║  [OK] %TASK_NAME%                      ║  REM Change icon
echo ╚════════════════════════════════════════╝
```

**Linux/macOS (.sh)**
```bash
echo "✅ ${TASK_NAME}"  REM Change emoji/icon
echo "Completed at: $(date)"
```

---

## ⚡ Quick Reference

| OS | Command | Sound |
|----|---------|-------|
| Windows | `notify.bat "Done"` | PowerShell beep + toast |
| Linux | `./notify.sh "Done"` | System bell + notify-send |
| macOS | `./notify.sh "Done"` | System bell + notification |

---

**Status:** ✅ Ready to use
**Files:** `notify.bat` (Windows), `notify.sh` (Linux/macOS)
**Usage:** Append `&& notify "message"` to any command

🔔 Never miss a completed task again!
