# ProGuard / R8 Configuration for Miftah Tools Android App

# Capacitor core and plugins
-keep public class com.getcapacitor.** { *; }
-keep class com.getcapacitor.community.** { *; }
-keepclasseswithmembers class * {
    @com.getcapacitor.PluginMethod public *;
}

# Google Mobile Ads / AdMob
-keep class com.google.android.gms.ads.** { *; }
-keep interface com.google.android.gms.ads.** { *; }

# Firebase
-keep class com.google.firebase.** { *; }
-keep interface com.google.firebase.** { *; }

# WebView Javascript Interface
-keepattributes JavascriptInterface
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Suppress common harmless warnings
-dontwarn com.google.android.gms.**
-dontwarn com.google.firebase.**
