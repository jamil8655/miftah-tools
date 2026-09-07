package com.miftahtools.app;

import android.content.ContentValues;
import android.content.Context;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.provider.MediaStore;
import android.util.Base64;
import android.webkit.DownloadListener;
import android.webkit.JavascriptInterface;
import android.webkit.URLUtil;
import android.webkit.WebView;
import android.widget.Toast;

import com.getcapacitor.BridgeActivity;

import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;

public class MainActivity extends BridgeActivity {

    public class AndroidDownloaderInterface {
        private final Context mContext;

        public AndroidDownloaderInterface(Context context) {
            this.mContext = context;
        }

        @JavascriptInterface
        public boolean saveBase64File(String base64Data, String fileName, String mimeType) {
            if (base64Data == null || base64Data.isEmpty() || fileName == null || fileName.isEmpty()) {
                showToast("Download failed: empty data.");
                return false;
            }

            try {
                // Strip potential data URL prefix
                String cleanBase64 = base64Data.contains(",") ? base64Data.substring(base64Data.indexOf(",") + 1) : base64Data;
                byte[] fileBytes = Base64.decode(cleanBase64, Base64.DEFAULT);

                String effectiveMime = (mimeType != null && !mimeType.isEmpty()) ? mimeType : "application/octet-stream";

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
                                showToast("Downloaded to Downloads: " + fileName);
                                return true;
                            }
                        }
                    }
                } else {
                    File downloadsDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS);
                    if (!downloadsDir.exists()) {
                        downloadsDir.mkdirs();
                    }
                    File outputFile = new File(downloadsDir, fileName);
                    try (FileOutputStream fos = new FileOutputStream(outputFile)) {
                        fos.write(fileBytes);
                        fos.flush();
                        showToast("Downloaded to Downloads: " + fileName);
                        return true;
                    }
                }
            } catch (Exception e) {
                e.printStackTrace();
                showToast("Download error: " + e.getLocalizedMessage());
                return false;
            }
            return false;
        }

        @JavascriptInterface
        public boolean openFileInSystem(String fileName, String mimeType) {
            try {
                File downloadsDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS);
                File file = new File(downloadsDir, fileName);
                if (!file.exists()) {
                    showToast("File not found in Downloads: " + fileName);
                    return false;
                }

                android.content.Intent intent = new android.content.Intent(android.content.Intent.ACTION_VIEW);
                String effectiveMime = (mimeType != null && !mimeType.isEmpty()) ? mimeType : "*/*";
                
                Uri fileUri;
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                    fileUri = androidx.core.content.FileProvider.getUriForFile(
                            mContext,
                            mContext.getPackageName() + ".fileprovider",
                            file
                    );
                    intent.addFlags(android.content.Intent.FLAG_GRANT_READ_URI_PERMISSION);
                } else {
                    fileUri = Uri.fromFile(file);
                }

                intent.setDataAndType(fileUri, effectiveMime);
                intent.addFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK);
                mContext.startActivity(intent);
                return true;
            } catch (Exception e) {
                e.printStackTrace();
                showToast("Cannot open file: " + e.getLocalizedMessage());
                return false;
            }
        }

        private void showToast(final String message) {
            runOnUiThread(() -> Toast.makeText(mContext, message, Toast.LENGTH_LONG).show());
        }
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
    }

    @Override
    public void onStart() {
        super.onStart();
        if (this.bridge != null && this.bridge.getWebView() != null) {
            WebView webView = this.bridge.getWebView();
            webView.addJavascriptInterface(new AndroidDownloaderInterface(this), "AndroidDownloader");

            webView.setDownloadListener(new DownloadListener() {
                @Override
                public void onDownloadStart(String url, String userAgent, String contentDisposition, String mimetype, long contentLength) {
                    if (url != null && url.startsWith("data:")) {
                        try {
                            String base64 = url.substring(url.indexOf(",") + 1);
                            String filename = URLUtil.guessFileName(url, contentDisposition, mimetype);
                            new AndroidDownloaderInterface(MainActivity.this).saveBase64File(base64, filename, mimetype);
                        } catch (Exception e) {
                            e.printStackTrace();
                        }
                    }
                }
            });
        }
    }
}
