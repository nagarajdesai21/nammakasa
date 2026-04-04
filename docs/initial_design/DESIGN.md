# UI/UX Design - Nammakasa Auto Service Platform

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
```

### OTP Verification Screen
```
┌──────────────────────┐
│   VERIFY OTP         │
│                      │
│  OTP sent to:        │
│  +91 XXXX XXXX XX    │
│                      │
│  [Enter OTP]         │
│  [_ _ _ _ _ _]       │
│                      │
│  [VERIFY]  [RESEND]  │
└──────────────────────┘
```

### Set Password (First Login Only)
```
┌──────────────────────┐
│   SET PASSWORD       │
│                      │
│  [Enter Password]    │
│  [••••••••••]        │
│                      │
│  [Complexity info]   │
│  Min 8 chars         │
│                      │
│  [CONTINUE]          │
└──────────────────────┘
```

### Citizen Dashboard
```
┌──────────────────────────────────┐
│ NAMMAKASA  [Menu] [Profile]      │
├──────────────────────────────────┤
│                                  │
│  TODAY'S STATUS                  │
│  ┌────────────────────────────┐  │
│  │ Auto Assigned              │  │
│  │ MH01AB1234                 │  │
│  │ Driver: Ram Kumar          │  │
│  │ ☎ [Call]                  │  │
│  └────────────────────────────┘  │
│                                  │
│  ┌────────────────────────────┐  │
│  │ TRACK DRIVER               │  │
│  │ [Show Map]                 │  │
│  └────────────────────────────┘  │
│                                  │
│  ETA INFORMATION                 │
│  Current Location: Koramangala   │
│  Stops Remaining: 3 of 8         │
│  ⏱ ETA: 12 minutes               │
│                                  │
│  STATUS                          │
│  ✓ Completed                     │
│  ⏳ In Progress                   │
│  ⭕ Pending                       │
│                                  │
│  [Contact Support]               │
└──────────────────────────────────┘
```

### Citizen - Map View
```
┌──────────────────────────────────┐
│ [Back]          TRACKING          │
├──────────────────────────────────┤
│                                  │
│    ┌────────────────────────┐    │
│    │   🗺️ Google Maps      │    │
│    │   🚗 Current Position  │    │
│    │   📍 Your Location     │    │
│    │   📍 Next Stop         │    │
│    └────────────────────────┘    │
│                                  │
│  Distance: 2.3 km                │
│  ETA: 12 minutes                 │
│                                  │
│  [Refresh] [Call Driver]         │
└──────────────────────────────────┘
```

### Driver Dashboard
```
┌──────────────────────────────────┐
│ NAMMAKASA  [Menu] [Profile]      │
├──────────────────────────────────┤
│                                  │
│  TODAY'S ROUTE                   │
│  Route: West Zone Day Shift      │
│  Auto: MH01AB1234               │
│                                  │
│  PROGRESS: 3 of 8 ████░░░░░░░░  │
│                                  │
│  CURRENT TASK                    │
│  Stop 3 of 8                     │
│  📍 Koramangala Main Road        │
│  Customer: Rajesh Kumar          │
│  Phone: 98765XXXXX               │
│  Task: Collection                │
│                                  │
│  [START] [COMPLETE] [CALL]       │
│                                  │
│  NEXT STOPS                      │
│  ⭕ Stop 4: Indiranagar          │
│  ⭕ Stop 5: Whitefield           │
│  ⭕ Stop 6: Marathahalli         │
│                                  │
│  [View All] [View History]       │
└──────────────────────────────────┘
```

### Driver - Task Detail
```
┌──────────────────────────────────┐
│ [Back]  TASK DETAILS             │
├──────────────────────────────────┤
│                                  │
│  Stop: 3 of 8                    │
│  📍 122 Koramangala Main Rd      │
│                                  │
│  CUSTOMER INFO                   │
│  Name: Rajesh Kumar              │
│  Phone: +91 98765XXXXX           │
│  Email: rajesh@email.com         │
│                                  │
│  TASK TYPE                       │
│  🔹 Collection                   │
│                                  │
│  STATUS: ⭕ Pending              │
│                                  │
│  NOTES                           │
│  "Gate code: 1234, Ring bell"    │
│                                  │
│  [Call Customer] [Navigate]      │
│                                  │
│  ─────────────────────────────   │
│  COMPLETION                      │
│  [Mark as Completed]             │
│  Optional Notes:                 │
│  [________________]              │
│  [SUBMIT]                        │
└──────────────────────────────────┘
```

### Driver - Completed Tasks
```
┌──────────────────────────────────┐
│ [Back]  COMPLETED TASKS          │
├──────────────────────────────────┤
│                                  │
│  Today's Progress: 5 of 8        │
│                                  │
│  ✓ Stop 1 - Completed 09:30 AM  │
│    📍 Indiranagar               │
│                                  │
│  ✓ Stop 2 - Completed 10:15 AM  │
│    📍 Koramangala               │
│                                  │
│  ✓ Stop 3 - Completed 11:00 AM  │
│    📍 Whitefield                │
│                                  │
│  ⏳ Stop 4 - In Progress          │
│    📍 Marathahalli              │
│                                  │
│  ⭕ Stop 5 - Pending            │
│    📍 Electronic City           │
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
│ Today's Overview                                │
│ ┌──────────┬──────────┬──────────┬──────────┐  │
│ │ Autos    │ Drivers  │ Routes   │ Progress │  │
│ │ Active   │ On Duty  │ Active   │ Avg %    │  │
│ │   12     │   10     │   5      │  68%     │  │
│ └──────────┴──────────┴──────────┴──────────┘  │
│                                                 │
│ Real-time Task Completion                       │
│ Route: West Zone - 8 of 8 ████████░░          │
│ Route: East Zone  - 5 of 8 █████░░░            │
│ Route: North Zone - 3 of 6 ███░░░░░            │
│                                                 │
│ Recent Activity                                 │
│ 11:30 - Auto MH01AB1234 completed Stop 5      │
│ 11:15 - Driver Ram Kumar started route        │
└─────────────────────────────────────────────────┘
```

### Autos Management
```
┌─────────────────────────────────────────────────┐
│ AUTOS                    [+ Add Auto]            │
├─────────────────────────────────────────────────┤
│ Filter: [Active ▼] Search: [_________]         │
│ ┌──────────────────────────────────────────┐   │
│ │ Auto #  │ Driver      │ Route      │ %   │   │
│ ├──────────────────────────────────────────┤   │
│ │MH01AB12 │ Ram Kumar   │ West Zone  │ 75% │→  │
│ │MH01AB13 │ Rajesh K    │ East Zone  │ 60% │→  │
│ │MH01AB14 │ Prakash     │ North Zone │ 50% │→  │
│ │MH01AB15 │ [Unassigned]│ -          │  -  │→  │
│ └──────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘

Auto Detail (Click to reassign):
┌─────────────────────────────────────────────────┐
│ AUTO: MH01AB1234  [Edit] [Delete]              │
├─────────────────────────────────────────────────┤
│ Driver: Ram Kumar                               │
│ Current Route: West Zone Day Shift              │
│ Status: Active                                  │
│                                                 │
│ REASSIGN ROUTE:                                 │
│ [Select Route ▼]                               │
│  - West Zone Day Shift (current)                │
│  - East Zone Evening Shift                      │
│  - North Zone Day Shift                         │
│  - South Zone Evening Shift                     │
│                                                 │
│ [ASSIGN] [CANCEL]                              │
└─────────────────────────────────────────────────┘
```

### Routes Management
```
┌─────────────────────────────────────────────────┐
│ ROUTES                   [+ Create New Route]   │
├─────────────────────────────────────────────────┤
│ Search: [_________]  Filter: [Status ▼]       │
│ ┌──────────────────────────────────────────┐   │
│ │ Route Name       │ Stops │ Status │ Autos│   │
│ ├──────────────────────────────────────────┤   │
│ │West Zone Shift   │  8    │ Active │  2   │→  │
│ │East Zone Shift   │  6    │ Active │  1   │→  │
│ │North Zone Shift  │  7    │ Active │  2   │→  │
│ │South Zone Shift  │  5    │ Draft  │  -   │→  │
│ └──────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘

Route Builder (Create/Edit):
┌─────────────────────────────────────────────────┐
│ CREATE NEW ROUTE  [Cancel]                     │
├─────────────────────────────────────────────────┤
│ Route Name: [West Zone Day Shift]              │
│ Description: [Collection route...]             │
│                                                 │
│ STOPS (Drag to reorder):                        │
│ ☰ 1 📍 Koramangala Main Rd [Edit] [Remove]     │
│ ☰ 2 📍 Indiranagar Layout   [Edit] [Remove]    │
│ ☰ 3 📍 Whitefield           [Edit] [Remove]    │
│ ☰ 4 📍 Marathahalli         [Edit] [Remove]    │
│                                                 │
│ [+ Add Stop] [MAP VIEW] [SAVE] [DELETE]        │
└─────────────────────────────────────────────────┘

Route Builder - Map View:
┌──────────────────────────────────────────────────┐
│ [Back] ROUTE BUILDER - Map [List View]          │
├──────────────────────────────────────────────────┤
│ ┌────────────────────────────────────────────┐  │
│ │     🗺️ Google Maps                        │  │
│ │  ① → ② → ③ → ④ (stops visualization)     │  │
│ │  📍 Drag stops to reorder                 │  │
│ │  📍 Click to edit details                 │  │
│ └────────────────────────────────────────────┘  │
│                                                  │
│ Stops:                                           │
│ ☰ 1 Koramangala - 📍12.93, 77.62               │
│ ☰ 2 Indiranagar - 📍12.97, 77.64               │
│ ☰ 3 Whitefield - 📍12.96, 77.71                │
│                                                  │
│ [Add Stop] [Save] [Cancel]                      │
└──────────────────────────────────────────────────┘
```

### Drivers Management
```
┌─────────────────────────────────────────────────┐
│ DRIVERS                  [+ Add Driver]          │
├─────────────────────────────────────────────────┤
│ Filter: [Status ▼]  Search: [_________]        │
│ ┌──────────────────────────────────────────┐   │
│ │ Name        │ Auto       │ Status │ Since │  │
│ ├──────────────────────────────────────────┤   │
│ │ Ram Kumar   │ MH01AB1234 │ ✓ On   │ May 1 │  │
│ │ Rajesh K    │ MH01AB1235 │ ✓ On   │ May 5 │  │
│ │ Prakash M   │ MH01AB1236 │ ⊘ Off  │May 10│  │
│ │ Vikram Singh│ -          │ ⏳ Pend │May 15│  │
│ └──────────────────────────────────────────┘   │
│                                                 │
│ Actions: [Approve] [Suspend] [Remove]          │
└─────────────────────────────────────────────────┘
```

---

## Design Principles
- **Clean Interface**: Minimal clutter, focus on essential information
- **Accessibility**: Large taps zones, readable fonts
- **Mobile-First**: Designed for 4-6 inch screens first
- **Consistency**: Same colors, buttons, layouts across screens
- **Performance**: Fast loading, responsive interactions

## Color Scheme
- **Primary**: Blue (#007AFF)
- **Success**: Green (#34C759)
- **Warning**: Orange (#FF9500)
- **Error**: Red (#FF3B30)
- **Background**: White (#FFFFFF)
- **Text**: Dark Gray (#333333)

## Typography
- **Headers**: 20-24px, Bold
- **Body**: 16-18px, Regular
- **Labels**: 14px, Medium
