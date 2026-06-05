# AA Lifestyle — iOS App Store Publication Guide

## Prerequisites
- macOS with Xcode 15+ installed
- Apple Developer Account ($99/year) — https://developer.apple.com
- Node.js 18+ & npm
- CocoaPods (`sudo gem install cocoapods`)

---

## Step 1: Install Capacitor

```bash
cd project
npm install @capacitor/core @capacitor/cli
npx cap init "AA Lifestyle" "com.aalifestyle.app" --web-dir dist
```

> The `capacitor.config.ts` is already configured. If `cap init` creates a new one, keep the existing file.

## Step 2: Add iOS Platform

```bash
npm install @capacitor/ios
npx cap add ios
```

## Step 3: Install Native Plugins (optional but recommended)

```bash
npm install @capacitor/status-bar @capacitor/splash-screen @capacitor/keyboard @capacitor/haptics
npx cap sync ios
```

## Step 4: Build the Web App

```bash
npm run build
npx cap copy ios
```

## Step 5: Configure iOS in Xcode

```bash
npx cap open ios
```

In Xcode:
1. **General > Identity**
   - Display Name: `AA Lifestyle`
   - Bundle Identifier: `com.aalifestyle.app`
   - Version: `1.0.0`
   - Build: `1`

2. **General > Deployment Info**
   - Target: iOS 15.0+
   - Device Orientation: Portrait only
   - Status Bar Style: Light Content

3. **Signing & Capabilities**
   - Team: Select your Apple Developer team
   - Check "Automatically manage signing"

4. **Info.plist** — add these keys:
   - `ITSAppUsesNonExemptEncryption` = `NO` (skip export compliance)
   - `UIStatusBarStyle` = `UIStatusBarStyleLightContent`
   - `UIViewControllerBasedStatusBarAppearance` = `YES`

## Step 6: App Icons

You need app icons in these sizes. Use https://appicon.co or Figma to generate from your logo:

| Size | Usage |
|------|-------|
| 20x20 @2x, @3x | Notifications |
| 29x29 @2x, @3x | Settings |
| 40x40 @2x, @3x | Spotlight |
| 60x60 @2x, @3x | App Icon |
| 1024x1024 | App Store |

Place them in `ios/App/App/Assets.xcassets/AppIcon.appiconset/`

## Step 7: Splash Screen (Launch Screen)

Edit `ios/App/App/Base.lproj/LaunchScreen.storyboard`:
- Set background to black (#000000)
- Add your logo centered
- Or use the built-in Capacitor splash screen plugin

## Step 8: Test on Simulator / Device

```bash
npm run build && npx cap copy ios && npx cap open ios
```
Then press **Cmd+R** in Xcode to run.

## Step 9: Archive & Submit

1. In Xcode: **Product > Archive**
2. Once archived, click **Distribute App**
3. Select **App Store Connect**
4. Upload

## Step 10: App Store Connect

1. Go to https://appstoreconnect.apple.com
2. Create new app:
   - Name: **AA Lifestyle**
   - Primary Language: English (or Italian)
   - Bundle ID: `com.aalifestyle.app`
   - SKU: `aalifestyle`
3. Fill in:
   - Description
   - Keywords: lifestyle, habits, fitness, nutrition, planner, organizer
   - Category: Lifestyle
   - Screenshots (iPhone 15 Pro Max, iPhone SE)
   - App Privacy details
4. Submit for Review

---

## Quick Commands Reference

```bash
# Full build + sync cycle
npm run build && npx cap sync ios

# Open Xcode
npx cap open ios

# Live reload during development (connect Mac + iPhone on same WiFi)
npx cap run ios --livereload --external
```

## Troubleshooting

- **White flash on launch**: Check LaunchScreen.storyboard has black (#000000) background
- **Safe area issues**: The app already uses `env(safe-area-inset-*)` everywhere
- **Keyboard pushes content**: Capacitor Keyboard plugin is configured with `resize: 'body'`
- **Status bar light text**: Already set via `black-translucent` meta tag + Capacitor config
