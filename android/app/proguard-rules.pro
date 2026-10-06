# ProGuard / R8 Configuration for Miftah Tools Android App
# Hardened for Release Obfuscation, Anti-Tampering, Size Reduction, and Debug Log Stripping

# Preserve AndroidX Core and Activity EdgeToEdge
-keep class androidx.activity.** { *; }
-keep interface androidx.activity.** { *; }
-keep class androidx.core.** { *; }

# Capacitor core and native bridge
-keep public class com.getcapacitor.** { *; }
-keep class com.getcapacitor.community.** { *; }
-keep class com.codetrixstudio.** { *; }
-keepclasseswithmembers class * {
    @com.getcapacitor.PluginMethod public *;
}

# Google Mobile Ads / AdMob SDK
-keep class com.google.android.gms.ads.** { *; }
-keep interface com.google.android.gms.ads.** { *; }
-keep class com.google.android.gms.common.** { *; }
-keep class com.google.android.gms.internal.ads.** { *; }

# Firebase Android SDK
-keep class com.google.firebase.** { *; }
-keep interface com.google.firebase.** { *; }

# WebView Javascript Interfaces & Native Bridges
-keepattributes JavascriptInterface
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}
-keep class com.miftahtools.app.MainActivity$AndroidDownloaderInterface { *; }
-keep class com.miftahtools.app.MainActivity$AndroidSpeechInterface { *; }

# Keep data models, enum values, and parcelables
-keepclassmembers enum * {
    public static **[] values();
    public static ** valueOf(java.lang.String);
}
-keepclassmembers class * implements android.os.Parcelable {
    public static final android.os.Parcelable$Creator *;
}

# Strip Android android.util.Log calls in release builds to prevent info leakage
-assumenosideeffects class android.util.Log {
    public static boolean isLoggable(java.lang.String, int);
    public static int v(...);
    public static int d(...);
    public static int i(...);
}

# Suppress harmless third-party build warnings
-dontwarn com.google.android.gms.**
-dontwarn com.google.firebase.**
-dontwarn org.apache.http.**
-dontwarn okio.**
