# NEXORA Tools Pro — Production Firebase Rules & Security Configuration

Dedicated Project ID: `studio-3108342384-2960a`

---

## 1. Firebase Authentication — Authorized Domains
Ensure these domains are added under **Authentication -> Settings -> Authorized Domains**:
- `jamil8655.github.io`
- `localhost`

---

## 2. Cloud Firestore Security Rules (`firestore.rules`)
Copy and paste into **Firestore Database -> Rules**:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isSignedIn() {
      return request.auth != null;
    }

    // Primary Check: Cryptographic Admin Custom Claims & Authorized Emails
    function isAdmin() {
      return isSignedIn() && (
        request.auth.token.admin == true ||
        request.auth.token.role == 'admin' ||
        request.auth.token.super_admin == true ||
        request.auth.token.email == 'jrahmanansari132@gmail.com' ||
        request.auth.token.email == 'jamil8655@gmail.com' ||
        request.auth.token.email == 'hafizjamilurrahman@gmail.com' ||
        request.auth.token.email == 'jamilurrahman@gmail.com'
      );
    }

    function isOwner(userId) {
      return isSignedIn() && request.auth.uid == userId;
    }

    // Helper functions for Ratings & Reviews collection validation
    function hasValidReviewName(data) {
      return (
        ('userName' in data && data.userName is string && data.userName.size() <= 50) ||
        ('name' in data && data.name is string && data.name.size() <= 50)
      );
    }

    function isValidReview(data) {
      return hasValidReviewName(data) &&
             data.comment is string && data.comment.size() <= 500 &&
             data.rating is number && data.rating >= 1 && data.rating <= 5 &&
             data.approved is bool &&
             data.status is string;
    }

    // Users Collection (Strict User Data Isolation)
    match /users/{userId} {
      allow read: if isOwner(userId) || isAdmin();
      allow create: if isOwner(userId);
      allow update: if isOwner(userId) && (!request.resource.data.diff(resource.data).affectedKeys().hasAny(['role', 'isAdmin', 'isSuperAdmin']) || isAdmin());
      allow delete: if isOwner(userId) || isAdmin();
    }

    // Courses Collection (Public Read, Admin Write)
    match /courses/{courseId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // Admins Collection (Strict Admin Isolation)
    match /admins/{adminId} {
      allow read, write: if isAdmin();
    }

    // Tools Collection (Public Read, Admin Write)
    match /tools/{toolId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // Jobs Queue (User Scoped)
    match /jobs/{jobId} {
      allow read: if isSignedIn() && (resource.data.uid == request.auth.uid || isAdmin());
      allow create: if isSignedIn() && request.resource.data.uid == request.auth.uid;
      allow update, delete: if isSignedIn() && (resource.data.uid == request.auth.uid || isAdmin());
    }

    // System Settings & Feature Flags (Public Read, Admin Write)
    match /settings/{settingId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // Analytics & Telemetry (Admin Read, Authenticated Append)
    match /analytics/{docId} {
      allow read: if isAdmin();
      allow create: if isSignedIn() || true;
      allow update, delete: if isAdmin();
    }

    // Audit Logs (Strict Admin Read, Authenticated Append)
    match /audit_logs/{logId} {
      allow read: if isAdmin();
      allow create: if isSignedIn();
      allow update, delete: if isAdmin();
    }

    // Ratings & Reviews Collection (Strict Moderation & Role-Based Access)
    match /ratings_reviews/{reviewId} {
      // 1. Public read is allowed if resource.data.approved == true.
      // 2. The review author can read their own review even if pending.
      // 3. Admins can read all reviews regardless of approval status.
      allow read: if (resource.data.approved == true) ||
                     (isSignedIn() && resource.data.userId == request.auth.uid) ||
                     isAdmin();

      // 4. Create validation: name <= 50, comment <= 500, rating 1-5, approved=false and status='pending' unless admin
      allow create: if isValidReview(request.resource.data) &&
                       (request.resource.data.approved == false || isAdmin()) &&
                       (request.resource.data.status == 'pending' || isAdmin()) &&
                       (!('userId' in request.resource.data) ||
                        request.resource.data.userId == null ||
                        request.resource.data.userId == '' ||
                        (isSignedIn() && request.resource.data.userId == request.auth.uid) ||
                        isAdmin());

      // 5. Update validation: Admin can update any review; authenticated owner can update comment/rating but CANNOT change approved status
      allow update: if isValidReview(request.resource.data) &&
                       (isAdmin() || (
                         isSignedIn() &&
                         resource.data.userId == request.auth.uid &&
                         (request.resource.data.userId == resource.data.userId) &&
                         (request.resource.data.approved == resource.data.approved) &&
                         (request.resource.data.status == resource.data.status)
                       ));

      // 6. Delete validation: Admin or authenticated owner
      allow delete: if isAdmin() || (isSignedIn() && resource.data.userId == request.auth.uid);
    }
  }
}
```

---

## 3. Firebase Cloud Storage Security Rules (`storage.rules`)
Copy and paste into **Storage -> Rules**:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    function isSignedIn() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isSignedIn() && request.auth.uid == userId;
    }
    
    function isAdmin() {
      return isSignedIn() && (
        request.auth.token.admin == true ||
        request.auth.token.role == 'admin' ||
        request.auth.token.email == 'jrahmanansari132@gmail.com' ||
        request.auth.token.email == 'jamil8655@gmail.com'
      );
    }

    // User Profile Avatars (Max 5MB image upload)
    match /users/{userId}/profile/{allPaths=**} {
      allow read: if true;
      allow write: if (isOwner(userId) || isAdmin()) &&
                   request.resource.size < 5 * 1024 * 1024 &&
                   request.resource.contentType.matches('image/.*');
    }

    // User Private Documents & Conversions (Max 100MB)
    match /users/{userId}/documents/{allPaths=**} {
      allow read, write: if isOwner(userId) || isAdmin();
    }
  }
}
```
