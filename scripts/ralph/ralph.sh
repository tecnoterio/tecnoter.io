#bash
# Ralph Wiggum - Long-running AI agent loop
# Usage: ./ralph.sh [--tool amp|claude] [max_iterations]

set -e

# Parse arguments
TOOL="amp" # Default to amp for backwards compatibility
MAX_ITERATIONS=10

while [[ $# -gt 0 ]]; do
  case $1 in
  --tool)
    TOOL="$2"
    shift 2
    ;;
  --tool=*)
    TOOL="${1#*=}"
    shift
    ;;
  *)
    # Assume it's max_iterations if it's a number
    if [[ "$1" =~ ^[0-9]+$ ]]; then
      MAX_ITERATIONS="$1"
    fi
    shift
    ;;
  esac
done

# Validate tool choice
if [[ "$TOOL" != "amp" && "$TOOL" != "claude" ]]; then
  echo "Error: Invalid tool '$TOOL'. Must be 'amp' or 'claude'."
  exit 1
fi
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PRD_FILE="$SCRIPT_DIR/prd.json"
PROGRESS_FILE="$SCRIPT_DIR/progress.txt"
ARCHIVE_DIR="$SCRIPT_DIR/archive"
LAST_BRANCH_FILE="$SCRIPT_DIR/.last-branch"

# Archive previous run if branch changed
if [ -f "$PRD_FILE" ] && [ -f "$LAST_BRANCH_FILE" ]; then
  CURRENT_BRANCH=$(jq -r '.branchName // empty' "$PRD_FILE" 2>/dev/null || echo "")
  LAST_BRANCH=$(cat "$LAST_BRANCH_FILE" 2>/dev/null || echo "")

  if [ -n "$CURRENT_BRANCH" ] && [ -n "$LAST_BRANCH" ] && [ "$CURRENT_BRANCH" != "$LAST_BRANCH" ]; then
    # Archive the previous run
    DATE=$(date +%Y-%m-%d)
    # Strip "ralph/" prefix from branch name for folder
    FOLDER_NAME=$(echo "$LAST_BRANCH" | sed 's|^ralph/||')
    ARCHIVE_FOLDER="$ARCHIVE_DIR/$DATE-$FOLDER_NAME"

    echo "Archiving previous run: $LAST_BRANCH"
    mkdir -p "$ARCHIVE_FOLDER"
    [ -f "$PRD_FILE" ] && cp "$PRD_FILE" "$ARCHIVE_FOLDER/"
    [ -f "$PROGRESS_FILE" ] && cp "$PROGRESS_FILE" "$ARCHIVE_FOLDER/"
    echo "   Archived to: $ARCHIVE_FOLDER"

    # Reset progress file for new run
    echo "# Ralph Progress Log" >"$PROGRESS_FILE"
    echo "Started: $(date)" >>"$PROGRESS_FILE"
    echo "---" >>"$PROGRESS_FILE"
  fi
fi

# Track current branch
if [ -f "$PRD_FILE" ]; then
  CURRENT_BRANCH=$(jq -r '.branchName // empty' "$PRD_FILE" 2>/dev/null || echo "")
  if [ -n "$CURRENT_BRANCH" ]; then
    echo "$CURRENT_BRANCH" >"$LAST_BRANCH_FILE"
  fi
fi

# Determine current story to work on
if [ -f "$PRD_FILE" ]; then
  CURRENT_STORY=$(jq -r '.userStories[] | select(.passes == false) | .id + " - " + .title // empty' "$PRD_FILE" 2>/dev/null || echo "")
  if [ -n "$CURRENT_STORY" ]; then
    echo "Current story: $CURRENT_STORY"
  fi
fi

# Initialize progress file if it doesn't exist
if [ ! -f "$PROGRESS_FILE" ]; then
  echo "# Ralph Progress Log" >"$PROGRESS_FILE"
  echo "Started: $(date)" >>"$PROGRESS_FILE"
  echo "---" >>"$PROGRESS_FILE"

  # Track current story from PRD
  if [ -f "$PRD_FILE" ]; then
    CURRENT_STORY=$(jq -r '.userStories[] | select(.passes == false) | .id + " - " + .title // "None"' "$PRD_FILE" 2>/dev/null || echo "None")
    if [ -n "$CURRENT_STORY" ] && [ "$CURRENT_STORY" != "None" ]; then
      echo "## Current Story: $CURRENT_STORY" >>"$PROGRESS_FILE"
      echo "---" >>"$PROGRESS_FILE"
    fi
  fi
fi

echo "Starting Ralph - Tool: $TOOL - Max iterations: $MAX_ITERATIONS"

for i in $(seq 1 $MAX_ITERATIONS); do
  echo ""
  echo "==============================================================="
  echo "  Ralph Iteration $i of $MAX_ITERATIONS ($TOOL)"
  echo "==============================================================="

  # Run the selected tool with the ralph prompt
  AMP_BINARY=$(command -v amp 2>/dev/null || true)
  CLAUDE_BINARY=$(command -v claude 2>/dev/null || true)

  if [[ "$TOOL" == "amp" ]]; then
    if [ -n "$AMP_BINARY" ]; then
      OUTPUT=$(cat "$SCRIPT_DIR/prompt.md" | amp --dangerously-allow-all 2>&1 | tee /dev/stderr) || true
    else
      # Simulate AMP output when binary not available
      OUTPUT='{"status":"simulated","message":"AMP binary not installed, simulating output"}'
    fi
  else
    # Claude Code: use --dangerously-skip-permissions for autonomous operation, --print for output
    if [ -n "$CLAUDE_BINARY" ]; then
      OUTPUT=$(claude --dangerously-skip-permissions --print <"$SCRIPT_DIR/CLAUDE.md" 2>&1 | tee /dev/stderr) || true
    else
      # Simulate Claude output when binary not available
      OUTPUT='{"status":"simulated","message":"Claude binary not installed, simulating output"}'
    fi
  fi

  # Check for completion signal
  if echo "$OUTPUT" | grep -q "<promise>COMPLETE</promise>"; then
    echo ""
    echo "Ralph completed all tasks!"
    echo "Completed at iteration $i of $MAX_ITERATIONS"

    # Update PRD to mark all stories as completed
    if [ -f "$PRD_FILE" ]; then
      jq '.userStories[].passes = true' "$PRD_FILE" >"${PRD_FILE}.tmp" && mv "${PRD_FILE}.tmp" "$PRD_FILE"
    fi

    exit 0
  fi

  echo "Iteration $i complete. Continuing..."
  sleep 2
done

echo ""
echo "Ralph reached max iterations ($MAX_ITERATIONS) without completing all tasks."
echo "Check $PROGRESS_FILE for status."
exit 1

