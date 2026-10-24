# 🕵️ Mafia Party Game Application

A full-stack, real-time interactive **Mafia** party game application engineered for in-person group gameplay. Built with React (Vite, Tailwind CSS, Lucide Icons) and Node.js (Express, Socket.IO).

---

## 🌟 Overview & Architecture

The application is architected into three dedicated panels:

1. **📱 Player Panel (`/`)**
   - Mobile-first interface for joining the room with customizable avatars (inspired by Netflix & Money Heist).
   - Secret role assignment & hold-to-reveal card with neutral stealth reflections.
   - Night distraction mini-games (dynamic double-meaning jokes typing task & tapping tasks) to conceal Mafia & Doctor identities.
   - Private Mafia kill voting & encrypted chat channel.
   - Doctor victim protection selection.
   - Daytime discussion timers, live voting, and role elimination reveals.

2. **🛠️ Admin Control Panel (`/admin`)**
   - Password-protected (`Brock1122`) centralized game master unit.
   - Complete authority over phase progression: 3-2-1 game start countdown, skip timers, force stage transitions, and room reset.
   - Configurable countdown timers (Mafia night, Doctor, Discussion, Day Voting, Tie-breaker) in minutes and seconds.
   - Mafia count selection & customizable typing word count.
   - Player management & kick controls.
   - Secret God-Mode panel (triple-click top-right corner) to inspect living roles and manually override assignments.

3. **📺 Game Display Unit (`/display`)**
   - TV/Projector full-screen (100vh) view.
   - Real-time QR Code linked to active local network IP for seamless mobile onboarding.
   - Live player status grid (alive, protected, eliminated).
   - Real-time day voting tracker showing who has cast their vote.
   - Global elimination popup animations with secret role reveals and surviving Mafia counters.
   - Persistent scoreboard updating at full game conclusion with celebratory victory confetti.

---

## 🎮 Key Game Mechanics

- **Anti-Repetition Role Balancer**: No player is assigned Mafia or Doctor more than 2 consecutive games.
- **Auto Doctor Succession**: If the living Doctor is eliminated, a surviving Villager is automatically promoted to Doctor in the next round.
- **Single Tie-Break Rule**: If daytime voting results in a tie, a single tie-break discussion occurs. A subsequent tie results in no elimination to keep the game moving.
- **Mafia Last Chance Timer**: If Mafias fail to select a victim before time expires, a 30-second warning countdown triggers. If no victim is selected, the Mafia team instantly loses.
- **Anti-Cheat Cover Task**: Copy-pasting and dragging text are disabled on typing cover tasks to require genuine typing activity. Uppercase/lowercase differences are tolerated with up to 3 minor typo allowances.
- **Session Reconnection**: Players who switch apps or refresh their browsers automatically reconnect without losing their status or roles.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/vedant1717/Mafia.git
cd Mafia

# Install dependencies
npm install
```

### Running Locally

```bash
# Run both backend server and Vite client concurrently
npm run dev
```

- **Player Interface**: `http://localhost:3000` (or `http://<YOUR_LOCAL_IP>:3000`)
- **Admin Control Panel**: `http://localhost:3000/admin` *(Password: `Brock1122`)*
- **Display Board**: `http://localhost:3000/display` *(Password: `Brock1122`)*

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React, Canvas Confetti
- **Backend**: Node.js, Express, Socket.IO
- **Audio Engine**: Synthesized Web Audio API (countdown beeps, bells, victory fanfare)
