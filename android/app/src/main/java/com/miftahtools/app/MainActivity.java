package com.miftahtools.app;

import android.Manifest;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.ContentValues;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.content.pm.ResolveInfo;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.provider.MediaStore;
import android.util.Base64;
import android.webkit.DownloadListener;
import android.webkit.JavascriptInterface;
import android.webkit.PermissionRequest;
import android.webkit.URLUtil;
import android.webkit.WebView;
import android.widget.Toast;

import androidx.core.app.ActivityCompat;
import androidx.core.app.NotificationCompat;
import androidx.core.content.ContextCompat;
import androidx.core.content.FileProvider;

import com.getcapacitor.BridgeActivity;
import com.getcapacitor.BridgeWebChromeClient;

import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.List;

public class MainActivity extends BridgeActivity {

    private static final String NOTIFICATION_CHANNEL_ID = "miftah_tools_notifications";
    private static final int RUNTIME_PERMISSIONS_REQ_CODE = 1001;

    public class AndroidDownloaderInterface {
        private final Context mContext;

        public AndroidDownloaderInterface(Context context) {
            this.mContext = context;
        }

        @JavascriptInterface
        public void requestAppPermissions() {
            runOnUiThread(() -> requestNativePermissions());
        }

        @JavascriptInterface
        public boolean isCameraPermissionGranted() {
            return ContextCompat.checkSelfPermission(mContext, Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED;
        }

        @JavascriptInterface
        public boolean isMicrophonePermissionGranted() {
            return ContextCompat.checkSelfPermission(mContext, Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED;
        }

        @JavascriptInterface
        public boolean isNotificationPermissionGranted() {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                return ContextCompat.checkSelfPermission(mContext, Manifest.permission.POST_NOTIFICATIONS) == PackageManager.PERMISSION_GRANTED;
            }
            return true;
        }

        @JavascriptInterface
        public void showNotification(String title, String message, String routeUrl) {
            try {
                createNotificationChannel();
                Intent intent = new Intent(mContext, MainActivity.class);
                intent.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
                if (routeUrl != null && !routeUrl.isEmpty()) {
                    intent.putExtra("route", routeUrl);
                }

                PendingIntent pendingIntent = PendingIntent.getActivity(
                    mContext,
                    (int) System.currentTimeMillis(),
                    intent,
                    PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M ? PendingIntent.FLAG_IMMUTABLE : 0)
                );

                NotificationCompat.Builder builder = new NotificationCompat.Builder(mContext, NOTIFICATION_CHANNEL_ID)
                    .setSmallIcon(R.mipmap.ic_launcher)
                    .setContentTitle(title != null && !title.isEmpty() ? title : "Miftah Tools")
                    .setContentText(message != null ? message : "Notification from Miftah Tools")
                    .setPriority(NotificationCompat.PRIORITY_DEFAULT)
                    .setAutoCancel(true)
                    .setContentIntent(pendingIntent);

                NotificationManager manager = (NotificationManager) mContext.getSystemService(Context.NOTIFICATION_SERVICE);
                if (manager != null) {
                    manager.notify((int) System.currentTimeMillis(), builder.build());
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
        }

        private String resolveMimeType(String fileName, String providedMime) {
            if (providedMime != null && !providedMime.isEmpty() && !providedMime.equals("application/octet-stream") && !providedMime.equals("*/*")) {
                return providedMime;
            }
            if (fileName == null) return "application/octet-stream";
            String lower = fileName.toLowerCase();
            if (lower.endsWith(".pdf")) return "application/pdf";
            if (lower.endsWith(".docx")) return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
            if (lower.endsWith(".doc")) return "application/msword";
            if (lower.endsWith(".xlsx")) return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            if (lower.endsWith(".xls")) return "application/vnd.ms-excel";
            if (lower.endsWith(".pptx")) return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
            if (lower.endsWith(".ppt")) return "application/vnd.ms-powerpoint";
            if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
            if (lower.endsWith(".png")) return "image/png";
            if (lower.endsWith(".webp")) return "image/webp";
            if (lower.endsWith(".gif")) return "image/gif";
            if (lower.endsWith(".svg")) return "image/svg+xml";
            if (lower.endsWith(".txt")) return "text/plain";
            if (lower.endsWith(".csv")) return "text/csv";
            if (lower.endsWith(".json")) return "application/json";
            if (lower.endsWith(".html")) return "text/html";
            if (lower.endsWith(".zip")) return "application/zip";
            return "application/octet-stream";
        }

        private File saveToAppCache(byte[] fileBytes, String fileName) {
            try {
                File cacheDir = new File(mContext.getCacheDir(), "downloads");
                if (!cacheDir.exists()) {
                    cacheDir.mkdirs();
                }
                File cacheFile = new File(cacheDir, fileName);
                try (FileOutputStream fos = new FileOutputStream(cacheFile)) {
                    fos.write(fileBytes);
                    fos.flush();
                }
                return cacheFile;
            } catch (Exception e) {
                e.printStackTrace();
                return null;
            }
        }

        private File saveToAppExternalFiles(byte[] fileBytes, String fileName) {
            try {
                File extDir = mContext.getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS);
                if (extDir != null) {
                    if (!extDir.exists()) extDir.mkdirs();
                    File extFile = new File(extDir, fileName);
                    try (FileOutputStream fos = new FileOutputStream(extFile)) {
                        fos.write(fileBytes);
                        fos.flush();
                    }
                    return extFile;
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
            return null;
        }

        @JavascriptInterface
        public boolean saveBase64File(String base64Data, String fileName, String mimeType) {
            if (base64Data == null || base64Data.isEmpty() || fileName == null || fileName.isEmpty()) {
                showToast("Download failed: empty data.");
                return false;
            }

            try {
                String cleanBase64 = base64Data.contains(",") ? base64Data.substring(base64Data.indexOf(",") + 1) : base64Data;
                byte[] fileBytes = Base64.decode(cleanBase64, Base64.DEFAULT);
                String effectiveMime = resolveMimeType(fileName, mimeType);

                // 1. Always write cached copies into app directories for guaranteed FileProvider access
                saveToAppCache(fileBytes, fileName);
                saveToAppExternalFiles(fileBytes, fileName);

                // 2. Save into Public Downloads via MediaStore on Android 10+ (Q+)
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    ContentValues values = new ContentValues();
                    values.put(MediaStore.Downloads.DISPLAY_NAME, fileName);
                    values.put(MediaStore.Downloads.MIME_TYPE, effectiveMime);
                    values.put(MediaStore.Downloads.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS);

                    Uri uri = mContext.getContentResolver().insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, values);
                    if (uri != null) {
                        try (OutputStream out = mContext.getContentResolver().openOutputStream(uri)) {
                            if (out != null) {
                                out.write(fileBytes);
                                out.flush();
                                showToast("Saved to Downloads: " + fileName);
                                return true;
                            }
                        }
                    }
                } else {
                    // Legacy Android 9 and below
                    File downloadsDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS);
                    if (!downloadsDir.exists()) {
                        downloadsDir.mkdirs();
                    }
                    File outputFile = new File(downloadsDir, fileName);
                    try (FileOutputStream fos = new FileOutputStream(outputFile)) {
                        fos.write(fileBytes);
                        fos.flush();
                        showToast("Saved to Downloads: " + fileName);
                        return true;
                    }
                }
                showToast("Saved: " + fileName);
                return true;
            } catch (Exception e) {
                e.printStackTrace();
                showToast("Download notice: " + e.getLocalizedMessage());
                return false;
            }
        }

        @JavascriptInterface
        public boolean openBase64FileInSystem(String base64Data, String fileName, String mimeType) {
            try {
                if (base64Data != null && !base64Data.isEmpty()) {
                    String cleanBase64 = base64Data.contains(",") ? base64Data.substring(base64Data.indexOf(",") + 1) : base64Data;
                    byte[] fileBytes = Base64.decode(cleanBase64, Base64.DEFAULT);
                    saveToAppCache(fileBytes, fileName);
                    saveToAppExternalFiles(fileBytes, fileName);
                }
                return openFileInSystem(fileName, mimeType);
            } catch (Exception e) {
                e.printStackTrace();
                showToast("Cannot open file: " + e.getLocalizedMessage());
                return false;
            }
        }

        @JavascriptInterface
        public boolean openFileInSystem(String fileName, String mimeType) {
            try {
                File targetFile = null;

                // Check 1: App External Files Downloads dir
                File extDir = mContext.getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS);
                if (extDir != null) {
                    File candidate = new File(extDir, fileName);
                    if (candidate.exists() && candidate.length() > 0) {
                        targetFile = candidate;
                    }
                }

                // Check 2: App Cache downloads dir
                if (targetFile == null) {
                    File cacheFile = new File(new File(mContext.getCacheDir(), "downloads"), fileName);
                    if (cacheFile.exists() && cacheFile.length() > 0) {
                        targetFile = cacheFile;
                    }
                }

                // Check 3: App root Cache dir
                if (targetFile == null) {
                    File rootCacheFile = new File(mContext.getCacheDir(), fileName);
                    if (rootCacheFile.exists() && rootCacheFile.length() > 0) {
                        targetFile = rootCacheFile;
                    }
                }

                // Check 4: Public Downloads dir (if readable)
                if (targetFile == null) {
                    File publicDownloads = new File(Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS), fileName);
                    if (publicDownloads.exists() && publicDownloads.length() > 0) {
                        targetFile = publicDownloads;
                    }
                }

                if (targetFile == null || !targetFile.exists()) {
                    showToast("File ready in Downloads folder: " + fileName);
                    return false;
                }

                String effectiveMime = resolveMimeType(fileName, mimeType);
                Uri fileUri = FileProvider.getUriForFile(
                        mContext,
                        mContext.getPackageName() + ".fileprovider",
                        targetFile
                );

                Intent viewIntent = new Intent(Intent.ACTION_VIEW);
                viewIntent.setDataAndType(fileUri, effectiveMime);
                viewIntent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                viewIntent.addFlags(Intent.FLAG_GRANT_WRITE_URI_PERMISSION);
                viewIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                viewIntent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);

                // Explicitly grant URI permission to all candidate applications
                List<ResolveInfo> resInfoList = mContext.getPackageManager().queryIntentActivities(viewIntent, PackageManager.MATCH_DEFAULT_ONLY);
                for (ResolveInfo resolveInfo : resInfoList) {
                    String packageName = resolveInfo.activityInfo.packageName;
                    mContext.grantUriPermission(packageName, fileUri, Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_GRANT_WRITE_URI_PERMISSION);
                }

                Intent chooser = Intent.createChooser(viewIntent, "Open " + fileName);
                chooser.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                chooser.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);

                List<ResolveInfo> chooserInfoList = mContext.getPackageManager().queryIntentActivities(chooser, PackageManager.MATCH_DEFAULT_ONLY);
                for (ResolveInfo resolveInfo : chooserInfoList) {
                    String packageName = resolveInfo.activityInfo.packageName;
                    mContext.grantUriPermission(packageName, fileUri, Intent.FLAG_GRANT_READ_URI_PERMISSION);
                }

                mContext.startActivity(chooser);
                return true;
            } catch (Exception e) {
                e.printStackTrace();
                showToast("Cannot open file: " + e.getLocalizedMessage());
                return false;
            }
        }

        @JavascriptInterface
        public boolean shareBase64FileInSystem(String base64Data, String fileName, String mimeType) {
            try {
                if (base64Data != null && !base64Data.isEmpty()) {
                    String cleanBase64 = base64Data.contains(",") ? base64Data.substring(base64Data.indexOf(",") + 1) : base64Data;
                    byte[] fileBytes = Base64.decode(cleanBase64, Base64.DEFAULT);
                    File cached = saveToAppCache(fileBytes, fileName);
                    if (cached != null) {
                        String effectiveMime = resolveMimeType(fileName, mimeType);
                        Uri fileUri = FileProvider.getUriForFile(
                                mContext,
                                mContext.getPackageName() + ".fileprovider",
                                cached
                        );

                        Intent shareIntent = new Intent(Intent.ACTION_SEND);
                        shareIntent.setType(effectiveMime);
                        shareIntent.putExtra(Intent.EXTRA_STREAM, fileUri);
                        shareIntent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);

                        List<ResolveInfo> resInfoList = mContext.getPackageManager().queryIntentActivities(shareIntent, PackageManager.MATCH_DEFAULT_ONLY);
                        for (ResolveInfo resolveInfo : resInfoList) {
                            String packageName = resolveInfo.activityInfo.packageName;
                            mContext.grantUriPermission(packageName, fileUri, Intent.FLAG_GRANT_READ_URI_PERMISSION);
                        }

                        Intent chooser = Intent.createChooser(shareIntent, "Share " + fileName);
                        chooser.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                        chooser.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                        mContext.startActivity(chooser);
                        return true;
                    }
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
            return false;
        }

        @JavascriptInterface
        public void downloadUrl(String fileUrl, String fileName, String mimeType) {
            try {
                if (fileUrl == null || fileUrl.isEmpty()) {
                    showToast("Download failed: empty URL.");
                    return;
                }
                Uri uri = Uri.parse(fileUrl);
                android.app.DownloadManager.Request request = new android.app.DownloadManager.Request(uri);
                String cleanName = (fileName != null && !fileName.isEmpty()) ? fileName : URLUtil.guessFileName(fileUrl, null, mimeType);
                String effectiveMime = resolveMimeType(cleanName, mimeType);

                request.setTitle(cleanName);
                request.setDescription("Downloading " + cleanName);
                request.setNotificationVisibility(android.app.DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
                request.setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, cleanName);
                request.setMimeType(effectiveMime);
                request.setAllowedOverMetered(true);
                request.setAllowedOverRoaming(true);

                android.app.DownloadManager dm = (android.app.DownloadManager) mContext.getSystemService(Context.DOWNLOAD_SERVICE);
                if (dm != null) {
                    dm.enqueue(request);
                    showToast("Download started: " + cleanName);
                } else {
                    showToast("DownloadManager unavailable.");
                }
            } catch (Exception e) {
                e.printStackTrace();
                showToast("Download error: " + e.getLocalizedMessage());
            }
        }

        private void showToast(final String message) {
            runOnUiThread(() -> Toast.makeText(mContext, message, Toast.LENGTH_SHORT).show());
        }
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            CharSequence name = "Miftah Tools Notifications";
            String description = "Updates and notifications for downloads, courses, and tools";
            int importance = NotificationManager.IMPORTANCE_DEFAULT;
            NotificationChannel channel = new NotificationChannel(NOTIFICATION_CHANNEL_ID, name, importance);
            channel.setDescription(description);
            NotificationManager notificationManager = getSystemService(NotificationManager.class);
            if (notificationManager != null) {
                notificationManager.createNotificationChannel(channel);
            }
        }
    }

    private void requestNativePermissions() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            List<String> list = new ArrayList<>();
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA) != PackageManager.PERMISSION_GRANTED) {
                list.add(Manifest.permission.CAMERA);
            }
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) {
                list.add(Manifest.permission.RECORD_AUDIO);
            }
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
                    list.add(Manifest.permission.POST_NOTIFICATIONS);
                }
            }
            if (!list.isEmpty()) {
                ActivityCompat.requestPermissions(this, list.toArray(new String[0]), RUNTIME_PERMISSIONS_REQ_CODE);
            }
        }
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        createNotificationChannel();
        requestNativePermissions();
    }

    @Override
    public void onStart() {
        super.onStart();
        if (this.bridge != null && this.bridge.getWebView() != null) {
            WebView webView = this.bridge.getWebView();
            webView.getSettings().setMediaPlaybackRequiresUserGesture(false);

            // Grant Camera and Microphone access to HTML5 getUserMedia and Speech APIs
            webView.setWebChromeClient(new BridgeWebChromeClient(this.bridge) {
                @Override
                public void onPermissionRequest(final PermissionRequest request) {
                    runOnUiThread(() -> {
                        request.grant(request.getResources());
                    });
                }
            });

            webView.addJavascriptInterface(new AndroidDownloaderInterface(this), "AndroidDownloader");

            webView.setDownloadListener(new DownloadListener() {
                @Override
                public void onDownloadStart(String url, String userAgent, String contentDisposition, String mimetype, long contentLength) {
                    if (url != null) {
                        if (url.startsWith("data:")) {
                            try {
                                String base64 = url.substring(url.indexOf(",") + 1);
                                String filename = URLUtil.guessFileName(url, contentDisposition, mimetype);
                                new AndroidDownloaderInterface(MainActivity.this).saveBase64File(base64, filename, mimetype);
                            } catch (Exception e) {
                                e.printStackTrace();
                            }
                        } else if (url.startsWith("http://") || url.startsWith("https://")) {
                            String filename = URLUtil.guessFileName(url, contentDisposition, mimetype);
                            new AndroidDownloaderInterface(MainActivity.this).downloadUrl(url, filename, mimetype);
                        }
                    }
                }
            });
        }
    }
}

