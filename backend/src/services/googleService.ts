import { google } from "googleapis";

// Get auth client
export function getGoogleAuth(): any {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY;

  if (!email || !privateKey) {
    console.warn("⚠️ Google credentials are not set in environment variables.");
    return null;
  }

  // Replace escaped newlines if any
  const formattedKey = privateKey.replace(/\\n/g, "\n");

  return new google.auth.GoogleAuth({
    credentials: {
      client_email: email,
      private_key: formattedKey,
    },
    scopes: [
      "https://www.googleapis.com/auth/spreadsheets",
      "https://www.googleapis.com/auth/documents",
      "https://www.googleapis.com/auth/drive",
    ],
  });
}

// ============================================================
// GOOGLE DOCS (via Drive API + Docs API)
// ============================================================
export async function exportDocToGoogleDocs(
  userGmail: string,
  title: string,
  content: string
): Promise<string> {
  const auth = getGoogleAuth();
  if (!auth) throw new Error("Google authentication failed");

  const drive = google.drive({ version: "v3", auth });
  const docs = google.docs({ version: "v1", auth });

  // 1. Create a blank Google Document
  const docFile = await drive.files.create({
    requestBody: {
      name: title,
      mimeType: "application/vnd.google-apps.document"
    }
  });

  const docId = docFile.data.id;
  if (!docId) throw new Error("Failed to create document file in Google Drive");

  // 2. Populate text content
  await docs.documents.batchUpdate({
    documentId: docId,
    requestBody: {
      requests: [
        {
          insertText: {
            text: content,
            location: { index: 1 }
          }
        }
      ]
    }
  });

  // 3. Share with User Email if provided
  if (userGmail && userGmail.trim() !== "") {
    try {
      await drive.permissions.create({
        fileId: docId,
        requestBody: {
          role: "writer",
          type: "user",
          emailAddress: userGmail.trim()
        },
        sendNotificationEmail: true
      });
    } catch (err: any) {
      console.warn(`⚠️ Could not share document with ${userGmail}:`, err.message);
    }
  }

  // 4. Retrieve web view link
  const fileInfo = await drive.files.get({
    fileId: docId,
    fields: "webViewLink"
  });

  return fileInfo.data.webViewLink || `https://docs.google.com/document/d/${docId}/edit`;
}
