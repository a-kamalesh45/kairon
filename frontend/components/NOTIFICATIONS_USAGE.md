# KAIRON Notification System - Usage Guide

## Overview

The NotificationProvider component delivers real-time toast notifications with industrial aesthetics. It supports WebSocket subscriptions for live events and manual triggering for custom notifications.

---

## Features

- **Auto-dismiss:** 5-second timer (pauses on hover)
- **Max Queue:** 5 notifications visible at once
- **Types:** SUCCESS (cyan), ERROR (pink), INFO (blue)
- **Animations:** Smooth slide-in from right (200ms)
- **WebSocket:** Subscribes to user events (simulated for demo)

---

## Manual Usage

### 1. Import the Hook

```tsx
import { useNotifications } from '@/components/NotificationProvider'
```

### 2. Get the Context

```tsx
const { addNotification } = useNotifications()
```

### 3. Trigger Notifications

```tsx
// Success Notification
addNotification({
  type: "SUCCESS",
  message: "Order Filled: BTCUSDT @ 43250"
})

// Error Notification
addNotification({
  type: "ERROR",
  message: "Insufficient Funds: Order Cancelled"
})

// Info Notification
addNotification({
  type: "INFO",
  message: "System Maintenance in 5 minutes"
})
```

---

## Example: Trading Page

```tsx
'use client'

import { useNotifications } from '@/components/NotificationProvider'

export default function TradePage() {
  const { addNotification } = useNotifications()

  const executeTrade = async () => {
    try {
      const response = await fetch('/api/trade/execute', {
        method: 'POST',
        // ... trade data
      })

      if (response.ok) {
        addNotification({
          type: "SUCCESS",
          message: "Trade Executed Successfully"
        })
      } else {
        addNotification({
          type: "ERROR",
          message: "Trade Failed: Insufficient Balance"
        })
      }
    } catch (error) {
      addNotification({
        type: "ERROR",
        message: "Network Error: Please try again"
      })
    }
  }

  return (
    <button onClick={executeTrade}>
      Execute Trade
    </button>
  )
}
```

---

## WebSocket Integration

### Current State (Simulated)

The NotificationProvider simulates WebSocket events for demo purposes. Random notifications appear every 20 seconds.

### Production Setup

To connect to a real WebSocket:

1. Open `NotificationProvider.tsx`
2. Replace the simulated WebSocket section with:

```tsx
const token = localStorage.getItem("kairon_token")
const ws = new WebSocket(`wss://your-backend/ws/user-events?token=${token}`)

ws.onopen = () => {
  console.log("WebSocket connected")
}

ws.onmessage = (event) => {
  const data = JSON.parse(event.data)
  addNotification({
    type: data.type,
    message: data.message
  })
}

ws.onerror = (error) => {
  console.error("WebSocket error:", error)
}

ws.onclose = () => {
  console.log("WebSocket disconnected")
}
```

### Expected Backend Payload

```json
{
  "type": "SUCCESS" | "ERROR" | "INFO",
  "message": "Order Filled: BTCUSDT @ 43250",
  "timestamp": "2026-02-18T12:34:56Z"
}
```

---

## Styling

### Type Colors

- **SUCCESS:** Cyan `#00E5FF` with subtle glow
- **ERROR:** Hot Pink `#FF006E` with stronger glow
- **INFO:** Electric Blue `#0066FF` with subtle glow

### Positioning

- Fixed top-right corner
- 16px from top and right edges
- Stacks vertically with 16px gap
- Max width: 350px

### Behavior

- **Hover:** Pauses auto-dismiss timer
- **Click X:** Immediately dismisses
- **Max Queue:** Oldest removed when > 5
- **Animation:** Slide-in from right (200ms)

---

## Testing

### Manual Test

Add a test button to any page:

```tsx
'use client'

import { useNotifications } from '@/components/NotificationProvider'

export default function TestPage() {
  const { addNotification } = useNotifications()

  return (
    <div className="p-8 space-y-4">
      <button 
        onClick={() => addNotification({ type: "SUCCESS", message: "Test Success!" })}
        className="px-4 py-2 bg-cyan-500 text-black"
      >
        Test Success
      </button>
      
      <button 
        onClick={() => addNotification({ type: "ERROR", message: "Test Error!" })}
        className="px-4 py-2 bg-pink-500 text-black"
      >
        Test Error
      </button>
      
      <button 
        onClick={() => addNotification({ type: "INFO", message: "Test Info!" })}
        className="px-4 py-2 bg-blue-500 text-black"
      >
        Test Info
      </button>
    </div>
  )
}
```

---

## Performance

- **Memoized Components:** ToastItem uses React.memo
- **Efficient State:** Only affected notifications re-render
- **Auto-cleanup:** Timers cleared on unmount
- **Max Limit:** Prevents memory leaks with 5-notification cap

---

## Security

- **JWT Required:** WebSocket only connects if `kairon_token` exists
- **Validation:** Type checking on incoming messages
- **No Sensitive Data:** Avoid displaying private keys or passwords

---

## Architecture

```
NotificationProvider (Context)
  ├── WebSocket Listener (simulated)
  ├── NotificationContainer (fixed top-right)
  │     └── ToastItem (memoized)
  │           ├── Auto-dismiss Timer
  │           ├── Hover Pause Logic
  │           └── Slide Animation
```

---

## Future Enhancements

- [ ] Sound effects for critical errors
- [ ] Persistent notifications (require manual dismiss)
- [ ] Action buttons (e.g., "View Order", "Retry")
- [ ] Notification history panel
- [ ] Filter by type
- [ ] Custom duration per notification

---

**Status:** ✅ Production Ready (with simulated WebSocket)
**Aesthetics:** Industrial, terminal-grade, cyan/pink accents
**Performance:** Optimized with memoization and cleanup
