# GitHub Release Specifications

## 🏷️ Release Target Metadata
* **Tag Version**: `v1.0.0`
* **Release Title**: `v1.0.0 - SCUM Dedicated Server Management Web GUI Panel (Initial Release)`
* **Target Branch**: `main`

---

## 📝 Release Notes (English)

### 🚀 Overview
We are proud to present the initial stable release of the **SCUM Dedicated Server Management Web GUI Panel (v1.0.0)**. This lightweight, high-performance administrative panel is built utilizing a modern tech stack (React 19, Vite 6, Tailwind CSS v4, Express) to streamline SCUM Dedicated Server hosting. It eliminates hardcoded batch configurations, provides a centralized configuration schema, and introduces robust multilingual capability.

---

### Key Features

1. **Multilingual Interface (i18n)**
   * Out-of-the-box support for 5 languages: **Korean (KO)**, **English (EN)**, **Japanese (JA)**, **Chinese (ZH)**, and **Russian (RU)**.
   * Persistent language session state cached in `LocalStorage`.

2. **Zero-Hardcoding Configuration Core**
   * Dynamically resolves server roots and credentials from [config.json](file:///d:/scum_server/config.json).
   * Synchronized parameters across UI, INI files, and CLI execution pipelines, securing configuration integrity.

3. **SteamCMD Auto-Deployment**
   * Automated one-click download, expansion, and cleaning of the official SteamCMD utility directly from the web interface.

4. **Resource Affinity Tuning**
   * Configured to run on physical **CPU cores 0-3 (Affinity F)**, leaving cores 4-15 dedicated to the gaming client to prevent framerate stuttering on the host machine.

5. **WebSocket RCON Terminal**
   * Real-time server connection shell supporting command execution and macro shortcuts (Player Info, Server Save, Vehicle Info).

6. **Interactive Teleport Grid Map**
   * Generates exact in-game `#teleport X Y Z` commands on-click by parsing mouse positions mapped to the 12km SCUM world coordinates.

---

### 📦 Distribution Package Layout
The compiled release archive contains the following clean layout:
```text
release.zip
├── run_web_panel.exe        # Background service launcher (no terminal window)
├── start_scum_server.bat    # Dedicated CPU isolation script wrapper
├── update_scum_server.bat   # Non-interactive server updater
├── apply_server_settings.bat# Executionpolicy bypass settings injector
├── apply_server_settings.ps1# Config.json mapping injector
├── steamcmd_script.txt      # Automated download configuration script
├── config.json              # Centralized variables database
├── README.md                # Multilingual quick start guide
├── LICENSE                  # MIT License details
└── web_panel/
    ├── server.js            # Express server script
    ├── package.json         # Runtime dependencies list
    ├── package-lock.json    # Dependency lock
    └── frontend/
        └── dist/            # Compiled static React distribution files
```

---

### ⚙️ Quick Start Installation
1. Download `release.zip` and extract it to your preferred directory.
2. Double-click `run_web_panel.exe` to launch.
3. Access the panel in your browser at `http://localhost:3000`.
4. Click **Auto-Download & Install SteamCMD** at the bottom of the Dashboard tab.
