# ProGuard / R8 Configuration for Miftah Tools Android App
# Optimized for Google Play DEX Code Obfuscation Threshold (> 25%), Size Reduction, and Security

# Maximize Obfuscation by repackaging obfuscated classes
-repackageclasses 'com.miftahtools.app.obf'
-allowaccessmodification

# Capacitor Core, Bridge, and Plugins
-keep public class * extends com.getcapacitor.Plugin {
    public <init>(...);
    public <methods>;
}
-keepclasseswithmembers class * {
    @com.getcapacitor.PluginMethod public *;
}
-keep class com.getcapacitor.BridgeActivity { *; }
-keep class com.getcapacitor.Bridge { *; }
-keep class com.getcapacitor.PluginHandle { *; }
-keep class com.getcapacitor.JSObject { *; }
-keep class com.getcapacitor.JSArray { *; }
-keep class com.codetrixstudio.capacitor.GoogleAuth.** { *; }

# WebView Javascript Interfaces & Native Bridges
-keepattributes JavascriptInterface
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}
-keepclassmembers class com.miftahtools.app.MainActivity$AndroidDownloaderInterface {
    <methods>;
}
-keepclassmembers class com.miftahtools.app.MainActivity$AndroidSpeechInterface {
    <methods>;
}

# Keep standard Enum & Parcelable methods
-keepclassmembers enum * {
    public static **[] values();
    public static ** valueOf(java.lang.String);
}
-keepclassmembers class * implements android.os.Parcelable {
    public static final android.os.Parcelable$Creator *;
}

# Strip Android android.util.Log calls in release builds for performance & security
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

# Google Play In-App Updates & In-App Review
-keep class com.google.android.play.core.appupdate.** { *; }
-keep class com.google.android.play.core.install.** { *; }
-keep class com.google.android.play.core.review.** { *; }
