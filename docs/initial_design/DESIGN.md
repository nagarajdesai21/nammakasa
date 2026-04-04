# UI/UX Design - Nammakasa Zone-Based Platform

## Overview
Design specifications for:
1. **Mobile App** (React Native) - Citizen & Driver modes
2. **Admin Website** (React.js)

---

## Part 1: Mobile App Design (React Native)

### Login Screen (Both Citizens & Drivers)
```
┌──────────────────────┐
│   NAMMAKASA Platform │
│                      │
│  ◯ I am a Citizen   │
│  ◯ I am a Driver    │
│                      │
│  [Enter Phone]       │
│  [+91_________]      │
│                      │
│  [SEND OTP]          │
└──────────────────────┘

    ↓ (After OTP sent)

┌──────────────────────┐
│   VERIFY OTP         │
│  OTP sent to:        │
│  +91 XXXX XXXX XX    │
│  [Enter OTP]         │
│  [_ _ _ _ _ _]       │
│  [VERIFY] [RESEND]   │
└──────────────────────┘

    ↓ (First login only)

┌──────────────────────┐
│   SET PASSWORD       │
│  [Enter Password]    │
│  [••••••••••]        │
│  Min 8 chars         │
│  [CONTINUE]          │
└──────────────────────┘
```

### Citizen Dashboard (Tracking)
```
┌──────────────────────────────────┐
│ NAMMAKASA  [Menu] [Profile]      │
├──────────────────────────────────┤
│                                  │
│  TODAY'S COLLECTION              │
│  ┌────────────────────────────┐  │
│  │ Zone: Zone-A               │  │
│  │                            │  │
│  │ Auto: MH01AB1234           │  │
│  │ Driver: Ram Kumar          │  │
│  │ ☎ [Call Driver]            │  │
│  └────────────────────────────┘  │
│                                  │
│  ┌────────────────────────────┐  │
│  │ TRACK DRIVER  [Show Map]   │  │
│  └────────────────────────────┘  │
│                                  │
│  ETA INFORMATION                 │
│  Driver Location: Koramangala    │
│  Distance to Zone: 2.3 km        │
│  ⏱ ETA to your area: 12 min     │
│                                  │
│  STATUS                          │
│  ✓ Collection in progress        │
│  → Will arrive soon              │
│                                  │
│  [Contact Support]               │
└──────────────────────────────────┘
```

### Citizen - Map View (Tracking Auto)
```
┌──────────────────────────────────┐
│ [Back]          TRACKING          │
├──────────────────────────────────┤
│    ┌────────────────────────┐    │
│    │   🗺️ Google Maps      │    │
│    │                        │    │
│    │   🚗 Driver Location   │    │
│    │   📍 Your Location     │    │
│    │   🟦 Your Zone         │    │
│    │   (Polygon boundary)   │    │
│    │                        │    │
│    └────────────────────────┘    │
│                                  │
│  Distance: 2.3 km                │
│  ETA: 12 minutes                 │
│                                  │
│  [Refresh] [Call Driver]         │
└──────────────────────────────────┘
```

### Driver Dashboard (Zone Service)
```
┌──────────────────────────────────┐
│ NAMMAKASA  [Menu] [Profile]      │
├──────────────────────────────────┤
│                                  │
│  YOUR ASSIGNMENT TODAY           │
│  ┌─────────────────────────┐    │
│  │ Zone: Zone-A            │    │
│  │ Auto: MH01AB1234        │    │
│  │                         │    │
│  │ Instructions:           │    │
│  │ Collect from all        │    │
│  │ households in this zone │    │
│  └─────────────────────────┘    │
│                                  │
│  [VIEW ZONE ON MAP]              │
│                                  │
│  ┌────────────────────────────┐  │
│  │  🗺️ Map                   │  │
│  │  🟦 Zone Boundary         │  │
│  │  🚗 Your Current Location  │  │
│  │                           │  │
│  │  Collect as you drive     │  │
│  └────────────────────────────┘  │
│                                  │
│  [MARK ZONE COMPLETE]            │
│                                  │
│  Status: In Progress             │
│  Started: 09:00 AM               │
│  Time in Zone: 45 min            │
└──────────────────────────────────┘
```

### Driver - Zone Completed
```
┌──────────────────────────────────┐
│ [Back]  CONFIRM COMPLETION       │
├──────────────────────────────────┤
│                                  │
│  Zone Completed!                 │
│  ✓ Zone-A                        │
│                                  │
│  Collection Summary:             │
│  Started: 09:00 AM               │
│  Completed: 10:15 AM             │
│  Duration: 1 hour 15 min         │
│                                  │
│  Zone Boundary:                  │
│  📍 Entry Point: Koramangala     │
│  📍 Exit Point: Indiranagar      │
│  📍 Stops: ~50 households        │
│                                  │
│  [CONFIRM] [EDIT]                │
└──────────────────────────────────┘
```

---

## Part 2: Admin Website Design (React.js)

### Admin Login
```
┌────────────────────────────────┐
│   NAMMAKASA Admin Dashboard    │
│                                │
│   Email: [admin@company.com]   │
│   Password: [••••••••••••]      │
│   Remember me: □                │
│                                │
│   [LOGIN]                       │
│   [Forgot Password?]            │
└────────────────────────────────┘
```

### Admin Dashboard  
```
┌─────────────────────────────────────────────────┐
│ NAMMAKASA Admin   [Notifications] [Profile]     │
├─────────────────────────────────────────────────┤
│ Ward: Koramangala                               │
│ Today's Overview                                │
│ ┌──────────┬──────────┬──────────┬──────────┐  │
│ │ Zones    │ Autos    │ Drivers  │ Progress │  │
│ │ Created  │ Online   │ On Duty  │ Avg %    │  │
│ │   5      │   4      │   4      │  75%     │  │
│ └──────────┴──────────┴──────────┴──────────┘  │
│                                                 │
│ Today's Zone Assignments & Completion:          │
│ Zone-A    │ MH01   │ In Progress... █████░░░  │
│ Zone-B    │ MH02   │ Completed ✓    █████████ │
│ Zone-C    │ MH03   │ In Progress... ███░░░░░░ │
│ Zone-D    │ Idle   │ Not Assigned    -         │
│                                                 │
│ [Create New Zone] [Daily Assignments]          │
│ [Drivers]  [Analytics]  [Settings]             │
└─────────────────────────────────────────────────┘
```

### Zone Management - Create/Edit
```
┌──────────────────────────────────────────────────┐
│  CREATE ZONE                                     │
├──────────────────────────────────────────────────┤
│  Zone Name: [Zone-A____________]                │
│  Ward: [Koramangala ▼]                          │
│                                                  │
│  DRAW ZONE BOUNDARY ON MAP:                      │
│  [Polygon Tool] [Circle Tool] [Clear] [Undo]   │
│                                                  │
│  ┌────────────────────────────────────────────┐ │
│  │     🗺️ Google Maps                        │ │
│  │                                            │ │
│  │   Polygon drawn (4 corners):              │ │
│  │   ① ─────── ④                             │ │
│  │   │         │                             │ │
│  │   │ ZONE-A  │                             │ │
│  │   │         │                             │ │
│  │   ② ─────── ③                             │ │
│  │                                            │ │
│  │   [Click to add corners]                   │ │
│  │   [Drag to edit]                           │ │
│  │                                            │ │
│  └────────────────────────────────────────────┘ │
│                                                  │
│  [SAVE ZONE] [CANCEL] [DELETE]                  │
└──────────────────────────────────────────────────┘
```

### Daily Assignment - One-Click
```
┌──────────────────────────────────────────────────┐
│ DAILY ASSIGNMENT - Today                         │
├──────────────────────────────────────────────────┤
│ Quick Assign (select zone for each auto):        │
│                                                  │
│ Auto MH01 | [Zone-A        ▼] | [✓ Assign]     │
│ Auto MH02 | [Zone-B        ▼] | [✓ Assign]     │
│ Auto MH03 | [Zone-A        ▼] | [✓ Assign]     │
│ Auto MH04 | [None          ▼] | [✓ Assign]     │
│                                                  │
│ ─────────────────────────────────────────────── │
│                                                  │
│ OR Drag & Drop:                                  │
│ Autos              →     Zones                  │
│ ┌─────────┐              ┌──────────┐          │
│ │ MH01    │ ──────────→ │ Zone-A   │          │
│ │ MH02    │ ──────────→ │ Zone-B   │          │
│ │ MH03    │ ──────────→ │ Zone-A   │          │
│ └─────────┘              └──────────┘          │
│                                                  │
│ [SAVE ALL ASSIGNMENTS]                          │
│ ✓ 3 assignments saved | MH04 unassigned         │
└──────────────────────────────────────────────────┘
```

### Zones List
```
┌──────────────────────────────────────────────────┐
│ ZONES                        [+ Create New Zone] │
├──────────────────────────────────────────────────┤
│ Filter by Ward: [Koramangala ▼]                 │
│ Search: [_________]                             │
│                                                  │
│ ┌──────────────────────────────────────────┐   │
│ │ Zone Name    │ Autos  │ Created By │    │   │
│ ├──────────────────────────────────────────┤   │
│ │ Zone-A       │ 2      │ Admin A    │ → │   │
│ │ Zone-B       │ 1      │ Admin A    │ → │   │
│ │ Zone-C       │ 0      │ Admin B    │ → │   │
│ │ Zone-D       │ 1      │ Admin C    │ → │   │
│ └──────────────────────────────────────────┘   │
│                                                  │
│ (Click → to view, edit, or delete)              │
└──────────────────────────────────────────────────┘
```

### Real-Time Progress
```
┌──────────────────────────────────────────────────┐
│ TODAY'S PROGRESS (Real-Time)                     │
├──────────────────────────────────────────────────┤
│                                                  │
│ Zone-A  (MH01 - Ram Kumar)                      │
│ ████████████░░░░ In Progress... 75% (12/16)    │
│ Started: 09:00 AM | Current: Koramangala       │
│                                                  │
│ Zone-B  (MH02 - Rajesh K)                       │
│ █████████████████ Completed! ✓ 100% (10/10)   │
│ Started: 09:15 AM | Completed: 10:30 AM        │
│                                                  │
│ Zone-C  (MH03 - Prakash M)                      │
│ ██████░░░░░░░░░░ In Progress... 30% (5/16)    │
│ Started: 09:30 AM | Current: Indiranagar       │
│                                                  │
│ Zone-D  (Idle)                                  │
│ Not Assigned                                    │
│                                                  │
│ [View Map]  [Refresh]  [End Day]               │
└──────────────────────────────────────────────────┘
```

---

## Design Principles
- **Simplicity**: Focus on zones, not individual stops
- **Visual Feedback**: Show zone boundaries on map clearly
- **One-Click Assignment**: Dropdown + button, done
- **Real-Time Updates**: Progress shown without websockets
- **Mobile-First**: Works on 4-6 inch screens
- **Accessibility**: Large tap zones, readable fonts

## Color Scheme
- **Primary**: Blue (#007AFF)
- **Success**: Green (#34C759)
- **In-Progress**: Orange (#FF9500)
- **Zone Fill**: Light Blue with transparency
- **Text**: Dark Gray (#333333)

## Typography
- **Headers**: 20-24px, Bold
- **Body**: 16-18px, Regular
- **Labels**: 14px, Medium
