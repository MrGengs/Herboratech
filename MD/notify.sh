#!/bin/bash
# 🔔 Task Completion Notification with Sound
# Usage: ./notify.sh "Task Name" or append to commands: && ./notify.sh "Done!"

TASK_NAME="${1:-Task Completed}"
DURATION="${2:-2}"  # Beep duration in seconds

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Clear screen and show notification
clear
echo -e "${BLUE}"
echo "╔════════════════════════════════════════╗"
echo "║                                        ║"
echo "║  ✅  ${TASK_NAME}"
echo "║                                        ║"
echo "║  Completed at: $(date '+%Y-%m-%d %H:%M:%S')"
echo "║                                        ║"
echo "╚════════════════════════════════════════╝"
echo -e "${GREEN}"
echo "🔔 DING! DING! DING!"
echo -e "${NC}"

# Play system beep sound (multiple times for attention)
for i in {1..3}; do
    # Option 1: Terminal bell (works everywhere)
    printf '\a'

    # Option 2: Windows - use PowerShell beep
    if command -v powershell &> /dev/null; then
        powershell -Command "[Console]::Beep(1000, 500)"  # 1000Hz, 500ms
    fi

    # Option 3: Linux - use speaker-test or paplay
    if command -v speaker-test &> /dev/null; then
        speaker-test -t sine -f 1000 -l 1 2>/dev/null &
        sleep 0.5
        killall speaker-test 2>/dev/null
    fi

    sleep 0.3
done

# Alternative: Use system notification (macOS)
if command -v osascript &> /dev/null; then
    osascript -e "display notification \"$TASK_NAME\" with title \"✅ Task Complete\""
fi

# Alternative: Use notify-send (Linux)
if command -v notify-send &> /dev/null; then
    notify-send "✅ Task Complete" "$TASK_NAME" --urgency=critical
fi

echo -e "\n${GREEN}Ready for next task!${NC}\n"
