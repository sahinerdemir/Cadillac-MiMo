# Walkthrough - Cadillac MiMo Hotel Web Platforms

A comprehensive guest instruction web application has been successfully built and deployed at `/instructions`, alongside the existing Coming Soon landing page at the root directory of your Cadillac MiMo Hotel workspace (`/Users/sahinerdemir/Cadillac MiMo`). 

Now, a secure, dynamic **Admin Panel** has been built under **`/instructions/admin`** which stores stay information in real-time inside **Vercel KV (Redis)** and serves updates instantly to guests!

---

## 🔗 Live URLs & Repositories
- **GitHub Repository**: [sahinerdemir/Cadillac-MiMo](https://github.com/sahinerdemir/Cadillac-MiMo)
- **Live Vercel Production Website**: [https://cadillac-mimo.vercel.app](https://cadillac-mimo.vercel.app)
- **Live Guest Instructions App**: [https://cadillac-mimo.vercel.app/instructions](https://cadillac-mimo.vercel.app/instructions)
- **Live Admin Portal**: [https://cadillac-mimo.vercel.app/instructions/admin](https://cadillac-mimo.vercel.app/instructions/admin)

---

## 📱 Dynamic Architecture: Admin Panel & Vercel KV Backend

We replaced the hardcoded guest information with a dynamic data delivery loop:

1. **[NEW] [instructions/data.json](file:///Users/sahinerdemir/Cadillac%20MiMo/instructions/data.json)**:
   - Contains the default configuration values. Serves as a local fallback so the website **never breaks** even if the database is offline or not configured.
2. **[NEW] [api/get-data.js](file:///Users/sahinerdemir/Cadillac%20MiMo/api/get-data.js)**:
   - Serverless endpoint to fetch stay details. Returns database contents if Vercel KV is connected, otherwise automatically reads and returns the fallback JSON values.
3. **[NEW] [api/save-data.js](file:///Users/sahinerdemir/Cadillac%20MiMo/api/save-data.js)**:
   - Serverless endpoint to save updates. Enforces password authentication using standard HTTP Bearer headers against an `ADMIN_PASSWORD` environment variable (defaults to `cadillac5201` if unset) and writes updates to Vercel KV.
4. **[NEW] Admin Portal Frontend Dashboard**:
   - **[instructions/admin/index.html](file:///Users/sahinerdemir/Cadillac%20MiMo/instructions/admin/index.html)**: Provides a password entry screen and grouped forms to update stay codes, housekeeping rates, safety rules, manager hours, and property guidelines.
   - **[instructions/admin/style.css](file:///Users/sahinerdemir/Cadillac%20MiMo/instructions/admin/style.css)**: Modern, clean styling with clear focus glows, grouped forms, grid layouts, and a glassmorphic sticky bottom save bar. Includes the custom styling for the top sliding manager profile tray.
   - **[instructions/admin/app.js](file:///Users/sahinerdemir/Cadillac%20MiMo/instructions/admin/app.js)**: Session management (auth persistent in sessionStorage), loads stay details on dashboard initialization, validates form values, and posts payload updates to `/api/save-data`.
5. **[MODIFY] Guest App Integration**:
   - **[instructions/index.html](file:///Users/sahinerdemir/Cadillac%20MiMo/instructions/index.html)**: Placed target IDs (`id="gateCodeDisplay"`, `id="wifiNetworkDisplay"`, `id="hkStudioRateDisplay"`, and the new welcome contact manager hook `id="heroCallBtnName"`) onto copy containers, text fields, and CTAs. Both top and bottom sections use the unified label **"Hospitality Manager"**.
   - **[instructions/app.js](file:///Users/sahinerdemir/Cadillac%20MiMo/instructions/app.js)**: Dynamically fetches stay details from `/api/get-data` on page load. If successful, dynamically injects values into the page (overwriting default values) and updates copy buttons' clipboard metadata and welcome button names.

---

## 🔒 Setup Instructions for the Vercel Dashboard

To start using the dynamic dashboard with your client, complete these quick steps:

### Step 1: Create Vercel KV Database (Takes 10 seconds)
1. Go to your **[Vercel Dashboard](https://vercel.com/dashboard)**.
2. Select your project: **`cadillac-mimo`**.
3. Click the **Storage** tab at the top.
4. Click **Create Database** and select **KV (Redis)**.
5. Hit **Create** and click **Connect** to link it to your `cadillac-mimo` project. (This automatically injects the secret database environment variables `KV_URL` and `KV_REST_API_TOKEN` into Vercel).

### Step 2: Set Admin Password (Optional but Recommended)
1. In your Vercel project, go to **Settings** ➡️ **Environment Variables**.
2. Create an environment variable named **`ADMIN_PASSWORD`**.
3. Set the value to whatever password you want your client to use to log in (e.g., `mimo5201`). If you don't set this variable, it defaults to **`cadillac5201`**.
4. Redeploy the project or push a commit so Vercel loads the new password.

---

## 🔍 Verification Steps (Manual)

1. Navigate to: [https://cadillacmimo.com/instructions/admin](https://cadillacmimo.com/instructions/admin).
2. Enter the default password `cadillac5201` (or your custom `ADMIN_PASSWORD` if configured) and hit **Sign In**.
3. Verify that the form loads and is populated with the default stay details.
4. Edit a value (e.g. change the Gate Code or Wi-Fi password) and click **Save Stay Information**.
5. Once saved, navigate to: [https://cadillacmimo.com/instructions](https://cadillacmimo.com/instructions) and check if the Wi-Fi/gate details have instantly updated on the guest page!
