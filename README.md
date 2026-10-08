<div align="center">
  <img src="frontend/src/assets/icon.png" alt="Loge Achi shopping cart logo" width="132" />
  <h1>Loge Achi</h1>
  <p><strong>A modern marketplace to discover, shop, and grow together.</strong></p>
  <p>
    <a href="https://loge-achi-dot-com.vercel.app/"><strong>Visit the live store →</strong></a>
  </p>
  <p>
    <img src="https://img.shields.io/badge/React-19-149eca?logo=react&logoColor=white" alt="React 19" />
    <img src="https://img.shields.io/badge/Node.js-Express-339933?logo=nodedotjs&logoColor=white" alt="Node.js and Express" />
    <img src="https://img.shields.io/badge/Database-MySQL-4479A1?logo=mysql&logoColor=white" alt="MySQL" />
    <img src="https://img.shields.io/badge/Deployed%20on-Vercel-000000?logo=vercel&logoColor=white" alt="Deployed on Vercel" />
  </p>
</div>

---

Loge Achi is a full-stack e-commerce platform connecting customers and sellers through a single shopping experience. Explore a product catalog, manage orders, apply to become a seller, and run marketplace operations through dedicated role-based dashboards.

### 🎥 Project Showcase

**Watch the `Loge Achi dot com` project on YouTube:**
[▶️ View Project Demo on YouTube](https://youtu.be/PPiLMk2-yvg)

## ✨ What you can do

<table>
  <tr>
    <td width="50%">
      <h3>🛍️ Shop with ease</h3>
      Browse products and categories, save favorites, manage your cart, check out, and track orders.
    </td>
    <td width="50%">
      <h3>🏪 Sell and grow</h3>
      Apply to become a seller, manage products, follow orders, and communicate with customers.
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h3>💬 Stay connected</h3>
      Use customer-seller messaging, product reviews, and notifications to keep conversations moving.
    </td>
    <td width="50%">
      <h3>📊 Manage the marketplace</h3>
      Admin tools, role-protected dashboards, and analytics support day-to-day operations.
    </td>
  </tr>
</table>

An optional AI shopping assistant can help customers discover products.

## 🚧 Current status & known limitations

| Area | Status | What this means |
| --- | --- | --- |
| Cash on delivery | Order flow available | Orders can be submitted with cash on delivery; payment remains pending. |
| Card, mobile banking, and bank transfer | **Not connected to a real payment provider** | These options appear in checkout, but no payment gateway processes or verifies transactions. Non-COD payments are currently recorded as simulated successes. |
| Other features under active construction | **Not specified in the repository** | No other feature is clearly identified as actively under construction in the current code or project documentation. |

**Important:** Do not use the online payment options for real purchases. A production payment integration needs a supported provider, secure server-side transaction verification, and appropriate payment-result handling. The current checkout is suitable for demonstration, not real online payment collection.

## 🧰 Built with

| Layer | Tools |
| --- | --- |
| Frontend | React 19, Vite, React Router, Axios, Tailwind CSS |
| Backend | Node.js, Express |
| Database | MySQL, `mysql2` |
| Authentication | bcrypt password hashing, JSON Web Tokens |

## 📁 Project structure

```text
.
├── backend/       Express API, routes, controllers, and database connection
├── database/      SQL schema, migrations, and stored routines
├── docs/          Project and database documentation
└── frontend/      React application
```

## 🚀 Get started locally

### Prerequisites

- Node.js and npm
- MySQL

### 1. Install dependencies

Run from the repository root:

```bash
npm install --prefix frontend
npm install --prefix backend
```

### 2. Prepare the database

1. Create the database by running [`database/schema.sql`](database/schema.sql).
2. Apply [`database/60_percent_update.sql`](database/60_percent_update.sql) for the admin and token-blacklist tables.
3. Apply [`database/triggers_functions_procedures.sql`](database/triggers_functions_procedures.sql) for database routines. Use a MySQL client or script runner that supports `DELIMITER`.

For existing databases, review the applicable migration scripts in `database/` before deploying. Vendor application, seller chat, and customer notification migrations support databases that predate those features; a fresh database created from the current schema already includes their tables.

Create an admin account separately with a securely generated password hash. The application does not include an admin-registration flow.

### 3. Configure the API

Create `backend/.env`:

```dotenv
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_NAME=loge_achi_db
JWT_SECRET=replace_with_a_long_random_secret
```

Keep credentials private. Use a unique, securely generated `JWT_SECRET` for each environment.

To enable the OpenAI-powered shopping assistant, also configure:

```dotenv
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=your_available_model
```

### 4. Run the app

Start the backend in one terminal:

```bash
cd backend
npm run dev
```

Start the frontend in another terminal:

```bash
cd frontend
npm run dev
```

The API defaults to `http://localhost:5000`; Vite prints the frontend development URL in the terminal.

## 🧪 Build and lint

From the repository root:

```bash
npm run build
npm --prefix frontend run lint
```

## ☁️ Deployment

The frontend is live at **[loge-achi-dot-com.vercel.app](https://loge-achi-dot-com.vercel.app/)**. The API and MySQL database must also be deployed and configured for the complete application to work.

For separate frontend and backend deployments, set `VITE_API_URL` in the frontend deployment to the backend origin or API URL (for example, `https://api.example.com/api`), then rebuild and redeploy the frontend. Without this setting, production requests use `/api` on the frontend's own origin and require a reverse proxy to the backend.

The backend connects to MySQL and initializes notification tables at startup. The production database user must have the permissions required by the application; startup fails if the database is unavailable or the required tables cannot be created.

## 📚 Documentation

For deeper technical details, database setup guidance, and known test-script limitations, see the [Backend & Database Walkthrough](docs/CSE216_BACKEND_DATABASE_WALKTHROUGH.md).

## 🤝 Collaboration & contact

Interested in contributing, extending the platform, or implementing additional features? I welcome thoughtful collaboration. Please reach out through [GitHub](https://github.com/BadhonPain) or email [badhonpain48@gmail.com](mailto:badhonpain48@gmail.com) to discuss your ideas.

<div align="center">
  <img src="frontend/src/assets/Badhon.png" alt="Badhon Pain" width="110" />
  <p><strong>Developed by Badhon Pain</strong></p>
  <a href="https://github.com/BadhonPain">GitHub profile</a>
</div>
