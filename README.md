# Product Admin Dashboard

A high-performance Product Admin Dashboard built with **Next.js (App Router)**, **React**, **Tailwind CSS**, and **Axios**, integrated with the **DummyJSON API**.

---

## 📦 Getting Started & Setup

### Prerequisites
- Node.js (v18.x or higher)
- npm or yarn

### Installation
1. Clone this repository:
   ```bash
   git clone <YOUR_REPOSITORY_URL>
   cd <YOUR_REPOSITORY_FOLDER>
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

5. Production build check:
   ```bash
   npm run build
   npm run start
   ```

---

## 🔐 Credentials for Login

| Field | Value |
| :--- | :--- |
| **Username** | `emilys` |
| **Password** | `emilyspass` |

*(A convenient **"Fill Demo"** button is also provided on the login screen for instant one-click testing).*

---

## ✨ Completed Features Checklist

- [x] **Authentication & Protected Routes**:
  - Token-based login via `POST https://dummyjson.com/auth/login`.
  - Secure session management in `localStorage` + route guard redirecting unauthenticated users to `/login`.
  - Profile header with user details and **Logout** functionality.
  - Multi-click prevention on sign-in.
- [x] **Product List & Responsive Views**:
  - Displays thumbnail image, title, category, price, discount, rating, and stock status.
  - Responsive layout: clean **Table view on desktop** and **Card grid on mobile**.
- [x] **URL-Synchronized State**:
  - Full synchronization of `page`, `limit` (page size), `q` (search query), `category`, `sortBy`, and `order`.
  - Refreshing or sharing a URL directly reproduces the exact view state.
  - Safe parsing and fallback against invalid URLs (e.g., `?page=abc` or `?page=999`).
- [x] **Custom Pagination (Built from scratch)**:
  - Page-by-page fetching using `limit` and `skip`.
  - Page size options: `10`, `20`, `50`.
  - Text display: `"Showing 21–40 of 194 products"`.
  - Prev, Next, First, Last, and numbered page buttons with smart ellipses.
  - **No external pagination/table libraries used**.
- [x] **Debounced Search & Race Condition Shield**:
  - Search via `/products/search?q=`.
  - 400ms debounce waiting for user input completion before firing requests.
  - Automatically resets pagination to page 1 on search term change.
  - Integrated `AbortController` canceling stale requests so delayed responses (e.g. `&delay=2000`) never overwrite newer query results.
- [x] **Filter & Sort**:
  - Dynamically fetched category list (`/products/categories`).
  - Sort by **Title**, **Price**, or **Rating** with Ascending/Descending toggle.
- [x] **Product Details Page (`/products/[id]`)**:
  - Full product specs: image gallery with clickable thumbnails, brand, SKU, warranty, shipping, and return policies.
  - Customer review cards with star ratings, reviewer names, and dates.
  - Dedicated **404 Not Found** state for non-existent IDs.
- [x] **CRUD Operations (Add, Edit, Delete)**:
  - Add & Edit Modal with validation (required title/category/description, positive price and stock).
  - Confirmation modal before deleting any item.
  - Prevents rapid double-click submissions with active submission locks and spinners.
  - **Client-Side Persistence Layer**: Visual persistence of local additions, edits, and deletions across page changes.
- [x] **UI Feedback & States**:
  - Animated skeleton loaders for tables and mobile cards.
  - Empty state with reset CTA when no items match filters.
  - Error state with an interactive **"Retry Request"** button.
  - Toast notification system for instant action feedback.

---

## 🛠️ Architectural Choices & Design Rationales

### 1. Centralized Axios Architecture (`src/services/apiClient.ts`)
Instead of calling `axios` directly in UI components, all HTTP traffic flows through a single configured Axios instance:
- **Request Interceptors**: Automatically attaches `Authorization: Bearer <token>` to requests if an auth token exists.
- **Response Interceptors**: Catches and formats HTTP status codes (401, 403, 404, 500, network timeouts) into clean, user-friendly error messages.
- **Service Modules (`authService.ts`, `productService.ts`)**: Keep API contracts separate from UI presentation logic.

### 2. Zero Heavy Data Libraries (Pure Custom Logic)
In adherence to assignment constraints, neither React Query, SWR, nor any table/pagination packages were used. Data fetching, debounce timers, AbortControllers, and pagination slicing were written completely in vanilla React hooks (`useState`, `useEffect`, `useCallback`, `useRef`).

### 3. URL as the Single Source of Truth
State parameters (`q`, `category`, `sortBy`, `order`, `page`, `limit`) are kept in the URL query string. This ensures:
- Deep-linking and bookmarking works out of the box.
- Browser back/forward navigation is supported natively.
- No synchronization discrepancies between internal state and browser history.

---

## 🔍 Edge Cases Handled Carefully

### 1. Fast Typing & Race Conditions
- **Issue**: If a user types fast or if network latency fluctuates (simulated with `&delay=2000`), a slower response from an earlier keystroke can overwrite a faster response from the latest keystroke.
- **Solution**: We employ an `AbortController` ref and an incremental `requestCounterRef`. When a new request triggers, any in-flight Axios request is canceled immediately, and response updates only execute if the request ID matches the active counter.

### 2. DummyJSON Limitation: Simultaneous Search + Category Filter
- **Issue**: DummyJSON API has separate endpoints for `/products/search?q=` and `/products/category/{category}`, but does not support both parameters simultaneously on a single backend endpoint.
- **Solution**: When both a search query and a category filter are selected, our service queries the search endpoint for matching candidates, applies the category filter client-side, and dynamically computes pagination totals.

### 3. Mock API Persistence for Add / Edit / Delete
- **Issue**: DummyJSON is a mock backend and does not persist changes. If a user adds a product and then navigates to another page or changes sort order, the created product disappears from standard API responses.
- **Solution**: We created a `ProductContext` layer that keeps track of locally added products, updated fields, and deleted IDs during the user's session (backed by `localStorage`). This layer overlays on top of API responses so created and edited items remain visible in the list.

### 4. Malformed & Out-of-Bounds URL Parameters
- **Issue**: URLs like `?page=abc`, `?page=-5`, or `?limit=9999` can crash the UI or API.
- **Solution**: Defensive parsing sanitizes URL queries with safe fallbacks (defaulting non-numeric page values to `1`, clamping invalid page sizes to `10`, and bounding page numbers to maximum available pages).

### 5. Multi-Click Double Submissions
- **Issue**: Rapidly clicking Save, Login, or Delete buttons could trigger duplicate API calls.
- **Solution**: All submission handlers disable action buttons and display a loading spinner while `isSubmitting` is active, ignoring subsequent click events until the initial promise resolves.

---

## 🤖 Note on AI Tools & Problem Solving
- **Where AI helped**: Accelerating component boilerplate generation, refining Tailwind CSS responsive classes, and generating TypeScript interface schemas.
- **Key challenge tackled**: Managing DummyJSON's lack of simultaneous search/category filtering and ephemeral CRUD operations. Resolved by architecting a hybrid client-overlay state layer that seamlessly merges API responses with local session mutations while keeping full URL synchronicity.
