/**
 * Mobile App Generator
 * Revolutionary feature: convert websites to native mobile apps (React Native)
 * Generates APK/IPA files from website code
 */

import { invokeLLM } from "../_core/llm";

export interface MobileAppGenerationResult {
  success: boolean;
  appName: string;
  packageName: string;
  reactNativeCode: string;
  androidConfig: string;
  iosConfig: string;
  buildInstructions: string;
  estimatedBuildTime: string;
  requiredTools: string[];
}

/**
 * Generate React Native code from website HTML/CSS/JS
 */
export async function generateMobileApp(
  html: string,
  css: string,
  js: string,
  appName: string,
  packageName: string
): Promise<MobileAppGenerationResult> {
  const systemPrompt = `You are an expert React Native developer for InTheWild Mobile App Generator.
Convert website code to a production-ready React Native application.

Your task:
1. Convert HTML structure to React Native components
2. Convert CSS to React Native StyleSheet
3. Convert JavaScript to React Native logic
4. Add native platform features (camera, geolocation, etc.)
5. Optimize for mobile performance
6. Include proper error handling and loading states
7. Add app navigation structure
8. Include Android and iOS configuration

Output:
- Main App.tsx with React Native code
- Android build configuration
- iOS build configuration
- Build and deployment instructions`;

  const userPrompt = `Convert this website to a React Native mobile app:

App Name: ${appName}
Package Name: ${packageName}

HTML (${html.length} chars):
\`\`\`html
${html.slice(0, 5000)}
\`\`\`

CSS (${css.length} chars):
\`\`\`css
${css.slice(0, 2000)}
\`\`\`

JavaScript (${js.length} chars):
\`\`\`javascript
${js.slice(0, 2000)}
\`\`\`

Generate complete React Native code with Android and iOS configurations.`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "mobile_app_generation",
          strict: true,
          schema: {
            type: "object",
            properties: {
              reactNativeCode: { type: "string", description: "Main App.tsx file" },
              androidConfig: { type: "string", description: "Android configuration" },
              iosConfig: { type: "string", description: "iOS configuration" },
              buildInstructions: { type: "string" },
              estimatedBuildTime: { type: "string" },
              requiredTools: { type: "array", items: { type: "string" } },
            },
            required: ["reactNativeCode", "androidConfig", "iosConfig", "buildInstructions", "estimatedBuildTime", "requiredTools"],
            additionalProperties: false,
          },
        },
      },
    });

    const result = JSON.parse(response.choices[0]?.message?.content as string);

    return {
      success: true,
      appName,
      packageName,
      ...result,
    };
  } catch (error: any) {
    console.error("[Mobile App Generation] Failed:", error);
    return {
      success: false,
      appName,
      packageName,
      reactNativeCode: "",
      androidConfig: "",
      iosConfig: "",
      buildInstructions: "Generation failed",
      estimatedBuildTime: "N/A",
      requiredTools: [],
    };
  }
}

/**
 * Generate Android build configuration (build.gradle)
 */
export function generateAndroidConfig(appName: string, packageName: string): string {
  return `
android {
  namespace "${packageName}"
  compileSdk 34

  defaultConfig {
    applicationId "${packageName}"
    minSdk 21
    targetSdk 34
    versionCode 1
    versionName "1.0.0"
  }

  buildTypes {
    release {
      minifyEnabled true
      proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
    }
  }

  compileOptions {
    sourceCompatibility JavaVersion.VERSION_11
    targetCompatibility JavaVersion.VERSION_11
  }
}

dependencies {
  implementation 'androidx.appcompat:appcompat:1.6.1'
  implementation 'androidx.constraintlayout:constraintlayout:2.1.4'
  implementation 'com.google.android.material:material:1.9.0'
}
`;
}

/**
 * Generate iOS build configuration (Podfile)
 */
export function generateIOSConfig(appName: string): string {
  return `
platform :ios, '13.0'

target '${appName}' do
  pod 'React', :path => '../node_modules/react-native/'
  pod 'React-Core', :path => '../node_modules/react-native/React'
  pod 'React-cxxreact', :path => '../node_modules/react-native/ReactCommon/cxxreact'
  pod 'React-jsi', :path => '../node_modules/react-native/ReactCommon/jsi'
  pod 'React-jsiexecutor', :path => '../node_modules/react-native/ReactCommon/jsiexecutor'
  pod 'React-perflogger', :path => '../node_modules/react-native/ReactCommon/perflogger'
  pod 'React-RCTActionSheetIOS', :path => '../node_modules/react-native/Libraries/ActionSheetIOS'
  pod 'React-RCTAnimation', :path => '../node_modules/react-native/Libraries/NativeAnimation'
  pod 'React-RCTBlob', :path => '../node_modules/react-native/Libraries/Blob'
  pod 'React-RCTImage', :path => '../node_modules/react-native/Libraries/Image'
  pod 'React-RCTLinking', :path => '../node_modules/react-native/Libraries/LinkingIOS'
  pod 'React-RCTNetwork', :path => '../node_modules/react-native/Libraries/Network'
  pod 'React-RCTSettings', :path => '../node_modules/react-native/Libraries/Settings'
  pod 'React-RCTText', :path => '../node_modules/react-native/Libraries/Text'
  pod 'React-RCTVibration', :path => '../node_modules/react-native/Libraries/Vibration'
  pod 'React-RCTWebSocket', :path => '../node_modules/react-native/Libraries/WebSocket'
  pod 'React-jsinspector', :path => '../node_modules/react-native/ReactCommon/jsinspector'
  pod 'React-callinvoker', :path => '../node_modules/react-native/ReactCommon/callinvoker'
  pod 'React-runtimeexecutor', :path => '../node_modules/react-native/ReactCommon/runtimeexecutor'
  pod 'ReactCommon/turbomodule/core', :path => '../node_modules/react-native/ReactCommon'
  pod 'Yoga', :path => '../node_modules/react-native/ReactCommon/yoga'
  pod 'DoubleConversion', :podspec => '../node_modules/react-native/third-party-podspecs/DoubleConversion.podspec'
  pod 'glog', :podspec => '../node_modules/react-native/third-party-podspecs/glog.podspec'
  pod 'RCT-Folly', :podspec => '../node_modules/react-native/third-party-podspecs/RCT-Folly.podspec'
end
`;
}

/**
 * Generate build instructions
 */
export function generateBuildInstructions(appName: string, packageName: string): string {
  return `
# ${appName} - Build Instructions

## Prerequisites
- Node.js 16+ and npm/yarn
- React Native CLI: \`npm install -g react-native-cli\`
- Android Studio (for Android builds)
- Xcode (for iOS builds on macOS)

## Setup

1. Install dependencies:
   \`\`\`bash
   npm install
   cd ios && pod install && cd ..
   \`\`\`

2. Configure app name and package:
   - Update app.json with your app details
   - Update Android package name in android/app/build.gradle
   - Update iOS bundle identifier in ios/${appName}/Info.plist

## Building for Android

1. Generate signing key:
   \`\`\`bash
   keytool -genkey -v -keystore my-release-key.keystore -keyalg RSA -keysize 2048 -validity 10000 -alias my-key-alias
   \`\`\`

2. Build APK:
   \`\`\`bash
   cd android && ./gradlew assembleRelease && cd ..
   \`\`\`

3. APK location: \`android/app/build/outputs/apk/release/app-release.apk\`

## Building for iOS

1. Build for simulator:
   \`\`\`bash
   react-native run-ios
   \`\`\`

2. Build for device:
   \`\`\`bash
   cd ios
   xcodebuild -workspace ${appName}.xcworkspace -scheme ${appName} -configuration Release -derivedDataPath build
   cd ..
   \`\`\`

3. IPA location: \`ios/build/Release-iphoneos/${appName}.app\`

## Deployment

- **Android**: Upload APK to Google Play Console
- **iOS**: Upload IPA to App Store Connect

## Support
For issues, visit: https://inthewild.app/support
`;
}

/**
 * Get required tools for mobile app development
 */
export function getRequiredTools(): string[] {
  return [
    "Node.js 16+",
    "npm or yarn",
    "React Native CLI",
    "Android Studio (for Android)",
    "Xcode (for iOS on macOS)",
    "Android NDK",
    "Java Development Kit (JDK) 11+",
  ];
}

/**
 * Estimate build time based on app complexity
 */
export function estimateBuildTime(codeSize: number): string {
  if (codeSize < 10000) return "5-10 minutes";
  if (codeSize < 50000) return "15-30 minutes";
  if (codeSize < 100000) return "30-60 minutes";
  return "1-2 hours";
}
