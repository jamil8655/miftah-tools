# 📱 Miftah Tools — Android App & Google Play Build Guide

This project is a hybrid **Production-Grade Web & Native Android Application** powered by Next.js 14 and Capacitor 6 with native device bridge integration.

---

## 🚀 Quick Summary
- **App Name**: Miftah Tools
- **Application ID / Package**: `com.miftahtools.app`
- **Minimum Android SDK**: 22 (Android 5.1 Lollipop)
- **Target Android SDK**: 34 (Android 14 Ready)
- **Firebase Project**: `studio-3108342384-2960a`
- **Configuration File**: `capacitor.config.json`
- **Google Services File**: `android/app/google-services.json`

---

## ⚡ 1-Click Build & Sync
Run the automated Windows batch script in the root directory:
```bash
build-android.bat
```
Or run the npm script:
```bash
npm run android:sync
```

---

## 🛠️ Compiling APK & Google Play App Bundle (.aab)

### Option 1: Android Studio (Recommended)
1. Open terminal and run:
   ```bash
   npm run android:open
   ```
2. Android Studio will launch the `android/` project.
3. **For Testing / Debug APK**:
   - Menu: **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
   - Output: `android/app/build/outputs/apk/debug/app-debug.apk`
4. **For Google Play Store Release (.aab)**:
   - Menu: **Build** → **Generate Signed Bundle / APK...**
   - Select **Android App Bundle (.aab)**
   - Create or choose your production keystore
   - Select `release` destination folder
   - Upload the generated `.aab` file to **Google Play Console**.

---

## 🔌 Integrated Native Plugins
1. **`@capacitor/app`**: Hardware back button handling & lifecycle events.
2. **`@capacitor/status-bar`**: Seamless light/dark mode status bar coloring.
3. **`@capacitor/splash-screen`**: Auto-dismissing splash branding.
4. **`@capacitor/share`**: Native Android system share sheet for files & links.
5. **`@capacitor/filesystem`**: Native file downloads and storage handling.
6. **`@capacitor/camera`**: Native camera capture for Passport Photo Maker & Document Scanner.
7. **`@capacitor/network`**: Live online / offline connection listener.
8. **`@capacitor/preferences`**: Fast persistent device preferences storage.

---

## 🛡️ Security & Privacy Architecture
- **Zero Server Secrets inside Android**: `serviceAccountKey.json` is strictly kept on the backend server and omitted from the client bundle.
- **Client-Side WASM**: All 75+ tools process files locally in the browser/WebView memory with zero third-party cloud uploads.
- **Secure Firebase Auth & Firestore**: Authenticated requests verify custom claims and security rules.
