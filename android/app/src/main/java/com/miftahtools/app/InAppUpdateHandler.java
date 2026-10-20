package com.miftahtools.app;

import android.app.Activity;
import android.content.Intent;
import android.content.IntentSender;
import android.util.Log;
import android.view.View;
import android.widget.Toast;

import androidx.appcompat.app.AlertDialog;

import com.google.android.material.snackbar.Snackbar;
import com.google.android.play.core.appupdate.AppUpdateInfo;
import com.google.android.play.core.appupdate.AppUpdateManager;
import com.google.android.play.core.appupdate.AppUpdateManagerFactory;
import com.google.android.play.core.appupdate.AppUpdateOptions;
import com.google.android.play.core.install.InstallState;
import com.google.android.play.core.install.InstallStateUpdatedListener;
import com.google.android.play.core.install.model.AppUpdateType;
import com.google.android.play.core.install.model.InstallStatus;
import com.google.android.play.core.install.model.UpdateAvailability;

/**
 * Handles official Google Play In-App Updates for Miftah Tools.
 * Supports Flexible (optional) updates and Immediate (mandatory) updates,
 * download progress observation, download completion installation,
 * and session-aware prompt management.
 */
public class InAppUpdateHandler {

    private static final String TAG = "MiftahAppUpdate";
    public static final int REQUEST_CODE_IN_APP_UPDATE = 8001;

    // Configurable criteria for mandatory (Immediate) vs ordinary (Flexible) updates
    private static final int MANDATORY_UPDATE_PRIORITY_THRESHOLD = 4; // Google Play Priority (0-5) >= 4 is critical
    private static final int MANDATORY_STALENESS_DAYS_THRESHOLD = 30; // 30+ days old release
    private static boolean forceMandatoryUpdateMode = false; // Configurable manual override flag

    private final Activity activity;
    private final AppUpdateManager appUpdateManager;
    private InstallStateUpdatedListener installStateUpdatedListener;

    private boolean hasPromptedUpdateThisSession = false;
    private AlertDialog activeDialog = null;
    private Snackbar activeSnackbar = null;

    public InAppUpdateHandler(Activity activity) {
        this.activity = activity;
        this.appUpdateManager = AppUpdateManagerFactory.create(activity);
        initInstallStateListener();
    }

    /**
     * Configure whether all detected updates should be treated as mandatory (Immediate update flow).
     */
    public static void setForceMandatoryUpdateMode(boolean force) {
        forceMandatoryUpdateMode = force;
    }

    public static boolean isForceMandatoryUpdateMode() {
        return forceMandatoryUpdateMode;
    }

    /**
     * Determines whether an update should be mandatory based on priority, staleness, or override.
     */
    private boolean isMandatoryUpdate(AppUpdateInfo info) {
        if (forceMandatoryUpdateMode) {
            return true;
        }
        // Priority 4 or 5 is defined in Play Console as critical / high priority
        if (info.updatePriority() >= MANDATORY_UPDATE_PRIORITY_THRESHOLD) {
            return true;
        }
        // If the installed version is older than the staleness threshold
        Integer stalenessDays = info.clientVersionStalenessDays();
        if (stalenessDays != null && stalenessDays >= MANDATORY_STALENESS_DAYS_THRESHOLD) {
            return true;
        }
        return false;
    }

    private void initInstallStateListener() {
        installStateUpdatedListener = state -> {
            if (state.installStatus() == InstallStatus.DOWNLOADED) {
                Log.d(TAG, "In-app update download completed (InstallStatus.DOWNLOADED).");
                notifyUpdateDownloaded();
            } else if (state.installStatus() == InstallStatus.DOWNLOADING) {
                long bytes = state.bytesDownloaded();
                long total = state.totalBytesToDownload();
                Log.d(TAG, "Downloading in-app update: " + bytes + " / " + total + " bytes");
            } else if (state.installStatus() == InstallStatus.FAILED) {
                Log.e(TAG, "In-app update download failed with errorCode: " + state.installErrorCode());
            }
        };
        try {
            appUpdateManager.registerListener(installStateUpdatedListener);
        } catch (Exception e) {
            Log.e(TAG, "Failed to register InstallStateUpdatedListener: " + e.getMessage(), e);
        }
    }

    /**
     * Check if a newer version is available on Google Play.
     * @param isManualCheck true if triggered manually by user, false if automatic app start check.
     */
    public void checkForAppUpdate(boolean isManualCheck) {
        try {
            appUpdateManager.getAppUpdateInfo().addOnSuccessListener(appUpdateInfo -> {
                int availability = appUpdateInfo.updateAvailability();

                if (availability == UpdateAvailability.UPDATE_AVAILABLE) {
                    boolean mandatory = isMandatoryUpdate(appUpdateInfo);
                    int updateType = mandatory ? AppUpdateType.IMMEDIATE : AppUpdateType.FLEXIBLE;

                    // Fallback to whichever is allowed if preferred is not allowed
                    if (!appUpdateInfo.isUpdateTypeAllowed(updateType)) {
                        if (appUpdateInfo.isUpdateTypeAllowed(AppUpdateType.FLEXIBLE)) {
                            updateType = AppUpdateType.FLEXIBLE;
                            mandatory = false;
                        } else if (appUpdateInfo.isUpdateTypeAllowed(AppUpdateType.IMMEDIATE)) {
                            updateType = AppUpdateType.IMMEDIATE;
                            mandatory = true;
                        } else {
                            Log.w(TAG, "Update available, but neither Flexible nor Immediate flow is allowed.");
                            if (isManualCheck) {
                                showToast("Update currently unavailable through In-App Update flow.");
                            }
                            return;
                        }
                    }

                    // For automatic checks, do not nag repeatedly within the same session
                    if (!isManualCheck && hasPromptedUpdateThisSession) {
                        Log.d(TAG, "Update is available, but dialog was already shown this session. Skipping.");
                        return;
                    }

                    hasPromptedUpdateThisSession = true;
                    showUpdateDialog(appUpdateInfo, updateType, mandatory);

                } else if (availability == UpdateAvailability.DEVELOPER_TRIGGERED_UPDATE_IN_PROGRESS) {
                    // Resume immediate update flow if interrupted
                    resumeImmediateUpdate(appUpdateInfo);
                } else {
                    Log.d(TAG, "No update available (availability code: " + availability + ")");
                    if (isManualCheck) {
                        showToast("Miftah Tools is up to date.");
                    }
                }
            }).addOnFailureListener(e -> {
                Log.e(TAG, "Failed to check for in-app update: " + e.getMessage());
                if (isManualCheck) {
                    showToast("Unable to check for updates right now.");
                }
            });
        } catch (Exception e) {
            Log.e(TAG, "Exception during checkAppUpdate: " + e.getMessage(), e);
        }
    }

    /**
     * Displays a clean, professional dialog prompting the user to update.
     */
    private void showUpdateDialog(AppUpdateInfo appUpdateInfo, int updateType, boolean isMandatory) {
        if (activity.isFinishing() || activity.isDestroyed()) {
            return;
        }

        activity.runOnUiThread(() -> {
            try {
                if (activeDialog != null && activeDialog.isShowing()) {
                    activeDialog.dismiss();
                }

                String title = isMandatory ? "Critical Update Required" : "New Update Available";
                String message = isMandatory
                        ? "A critical update is required to continue using Miftah Tools safely. Please update now to access the latest features and security improvements."
                        : "A new version is available with improvements and new features.";

                AlertDialog.Builder builder = new AlertDialog.Builder(activity)
                        .setTitle(title)
                        .setMessage(message)
                        .setIcon(R.mipmap.ic_launcher)
                        .setCancelable(!isMandatory);

                builder.setPositiveButton("Update Now", (dialog, which) -> {
                    dialog.dismiss();
                    startUpdateFlow(appUpdateInfo, updateType);
                });

                if (!isMandatory) {
                    builder.setNegativeButton("Later", (dialog, which) -> {
                        dialog.dismiss();
                        Log.d(TAG, "User selected 'Later'. Continuing normal app usage.");
                    });
                } else {
                    builder.setNegativeButton("Exit App", (dialog, which) -> {
                        dialog.dismiss();
                        activity.finishAffinity();
                    });
                }

                activeDialog = builder.create();
                activeDialog.setCanceledOnTouchOutside(!isMandatory);
                activeDialog.show();
            } catch (Exception e) {
                Log.e(TAG, "Error displaying update dialog: " + e.getMessage(), e);
            }
        });
    }

    /**
     * Launches the official Google Play in-app update flow.
     */
    private void startUpdateFlow(AppUpdateInfo appUpdateInfo, int updateType) {
        try {
            AppUpdateOptions options = AppUpdateOptions.newBuilder(updateType).build();
            appUpdateManager.startUpdateFlowForResult(
                    appUpdateInfo,
                    activity,
                    options,
                    REQUEST_CODE_IN_APP_UPDATE
            );
            Log.d(TAG, "Launched Google Play update flow (type: " + (updateType == AppUpdateType.IMMEDIATE ? "IMMEDIATE" : "FLEXIBLE") + ")");
        } catch (IntentSender.SendIntentException e) {
            Log.e(TAG, "IntentSender.SendIntentException starting update flow: " + e.getMessage(), e);
            showToast("Failed to launch Google Play update flow.");
        } catch (Exception e) {
            Log.e(TAG, "Unexpected error launching update: " + e.getMessage(), e);
        }
    }

    /**
     * Resumes an immediate update that was interrupted (e.g. user backgrounded the app).
     */
    private void resumeImmediateUpdate(AppUpdateInfo appUpdateInfo) {
        try {
            AppUpdateOptions options = AppUpdateOptions.newBuilder(AppUpdateType.IMMEDIATE).build();
            appUpdateManager.startUpdateFlowForResult(
                    appUpdateInfo,
                    activity,
                    options,
                    REQUEST_CODE_IN_APP_UPDATE
            );
        } catch (IntentSender.SendIntentException e) {
            Log.e(TAG, "Error resuming immediate update: " + e.getMessage(), e);
        }
    }

    /**
     * Handles lifecycle onResume: checks for downloaded updates or unfinished immediate updates.
     */
    public void onResume() {
        try {
            appUpdateManager.getAppUpdateInfo().addOnSuccessListener(appUpdateInfo -> {
                // If a flexible update finished downloading in the background, prompt user to install
                if (appUpdateInfo.installStatus() == InstallStatus.DOWNLOADED) {
                    notifyUpdateDownloaded();
                }
                // If an immediate update was in progress, resume it
                else if (appUpdateInfo.updateAvailability() == UpdateAvailability.DEVELOPER_TRIGGERED_UPDATE_IN_PROGRESS) {
                    resumeImmediateUpdate(appUpdateInfo);
                }
                // If update is available but user hasn't been prompted yet this session
                else if (!hasPromptedUpdateThisSession && appUpdateInfo.updateAvailability() == UpdateAvailability.UPDATE_AVAILABLE) {
                    checkForAppUpdate(false);
                }
            }).addOnFailureListener(e -> {
                Log.d(TAG, "onResume getAppUpdateInfo check: " + e.getMessage());
            });
        } catch (Exception e) {
            Log.e(TAG, "Exception during onResume in InAppUpdateHandler: " + e.getMessage(), e);
        }
    }

    /**
     * Notifies the user when a flexible update has downloaded and is ready to install.
     */
    private void notifyUpdateDownloaded() {
        if (activity.isFinishing() || activity.isDestroyed()) {
            return;
        }

        activity.runOnUiThread(() -> {
            try {
                View rootView = activity.findViewById(android.R.id.content);
                if (rootView != null) {
                    if (activeSnackbar != null && activeSnackbar.isShown()) {
                        return;
                    }
                    activeSnackbar = Snackbar.make(
                            rootView,
                            "An update has been downloaded.",
                            Snackbar.LENGTH_INDEFINITE
                    ).setAction("RESTART", v -> {
                        appUpdateManager.completeUpdate();
                    });
                    activeSnackbar.show();
                    return;
                }

                // Fallback to AlertDialog
                if (activeDialog != null && activeDialog.isShowing()) {
                    return;
                }
                activeDialog = new AlertDialog.Builder(activity)
                        .setTitle("Update Ready to Install")
                        .setMessage("The new version has finished downloading and is ready to install.")
                        .setIcon(R.mipmap.ic_launcher)
                        .setPositiveButton("Restart & Install", (dialog, which) -> {
                            dialog.dismiss();
                            appUpdateManager.completeUpdate();
                        })
                        .setNegativeButton("Later", (dialog, which) -> dialog.dismiss())
                        .show();
            } catch (Exception e) {
                Log.e(TAG, "Error displaying update downloaded notification: " + e.getMessage(), e);
            }
        });
    }

    /**
     * Handles Activity result from startUpdateFlowForResult.
     */
    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        if (requestCode == REQUEST_CODE_IN_APP_UPDATE) {
            if (resultCode == Activity.RESULT_OK) {
                Log.d(TAG, "In-app update flow started/completed successfully.");
            } else if (resultCode == Activity.RESULT_CANCELED) {
                Log.d(TAG, "User canceled the in-app update flow.");
            } else {
                Log.w(TAG, "In-app update flow returned failure code: " + resultCode);
            }
        }
    }

    /**
     * Unregisters listeners and dismisses UI elements when Activity is destroyed.
     */
    public void onDestroy() {
        try {
            if (appUpdateManager != null && installStateUpdatedListener != null) {
                appUpdateManager.unregisterListener(installStateUpdatedListener);
            }
            if (activeDialog != null && activeDialog.isShowing()) {
                activeDialog.dismiss();
                activeDialog = null;
            }
            if (activeSnackbar != null && activeSnackbar.isShown()) {
                activeSnackbar.dismiss();
                activeSnackbar = null;
            }
        } catch (Exception e) {
            Log.e(TAG, "Error in onDestroy: " + e.getMessage(), e);
        }
    }

    private void showToast(final String message) {
        activity.runOnUiThread(() -> Toast.makeText(activity, message, Toast.LENGTH_SHORT).show());
    }
}
