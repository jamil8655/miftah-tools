const { initializeApp, cert } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const path = require("path");
const fs = require("fs");

const PROJECT_ID = "studio-3108342384-2960a";

const serviceAccountPath = path.join(
  __dirname,
  "../serviceAccountKey.json"
);

if (!fs.existsSync(serviceAccountPath)) {
  console.error("❌ serviceAccountKey.json not found!");
  process.exit(1);
}

const serviceAccount = require(serviceAccountPath);

if (serviceAccount.project_id !== PROJECT_ID) {
  console.error("❌ Wrong Firebase project!");
  console.error("Expected:", PROJECT_ID);
  console.error("Found:", serviceAccount.project_id);
  process.exit(1);
}

initializeApp({
  credential: cert(serviceAccount),
  projectId: PROJECT_ID
});

const auth = getAuth();
const db = getFirestore();

async function makeAdmin(email) {
  try {
    const cleanEmail = email.trim().toLowerCase();

    console.log(`\n🔍 Finding Firebase user: ${cleanEmail}`);

    const user = await auth.getUserByEmail(cleanEmail);

    console.log("✅ User found");
    console.log("UID:", user.uid);

    await auth.setCustomUserClaims(user.uid, {
      admin: true,
      role: "admin"
    });

    await db
      .collection("admins")
      .doc(user.uid)
      .set(
        {
          uid: user.uid,
          email: user.email,
          role: "admin",
          active: true,
          updatedAt: FieldValue.serverTimestamp()
        },
        { merge: true }
      );

    console.log("\n====================================");
    console.log("✅ ADMIN SUCCESSFULLY CREATED");
    console.log("====================================");
    console.log("Email :", user.email);
    console.log("UID   :", user.uid);
    console.log("Role  : admin");
    console.log("Claim : admin = true");
    console.log("====================================\n");

    console.log("⚠️ Miftah Tools سے Logout کریں۔");
    console.log("⚠️ Browser Refresh کریں۔");
    console.log("⚠️ پھر دوبارہ Login کریں۔\n");

  } catch (error) {
    console.error("\n❌ ADMIN CREATION FAILED");
    console.error("Code:", error.code || "unknown");
    console.error("Message:", error.message);

    if (error.code === "auth/user-not-found") {
      console.error(
        "\nیہ Email Firebase Authentication میں موجود نہیں ہے۔"
      );
    }

    if (
      error.code === "app/invalid-credential" ||
      error.message?.toLowerCase().includes("credential")
    ) {
      console.error(
        "\nService Account JSON یا Firebase credentials چیک کریں۔"
      );
    }

    process.exit(1);
  }
}

const email = process.argv[2];

if (!email) {
  console.error(
    "\nاستعمال:\nnode scripts/set-admin-claims.js your@email.com\n"
  );
  process.exit(1);
}

makeAdmin(email);
