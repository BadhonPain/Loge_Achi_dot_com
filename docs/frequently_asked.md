# Frequently Asked Questions

## How does logout work?

Logout travels from the navigation bar, through the shared frontend authentication context, to the backend authentication route and controller. The frontend then clears its local authentication state and returns the user to the home page.

### File-by-file flow

1. **The user clicks Log Out** in `frontend/src/components/layout/Navbar.jsx`. The button calls `handleLogout()`. That handler calls and waits for `logout()` from `AuthContext`, closes the account dropdown, and navigates to `/`.

2. **The shared logout function runs** in `frontend/src/context/AuthContext.jsx`. The `AuthProvider` exposes `logout` through `AuthContext`, which is why the Navbar can call it. The function sends `POST http://localhost:5000/api/auth/logout` using Axios. Axios includes the default `Authorization: Bearer <token>` header that was set when the user logged in or registered.

3. **The Express app routes the request** in `backend/server.js`, where `/api/auth` is mounted to `backend/routes/authRoutes.js`. That router matches `POST /logout` and runs the `protect` middleware before the logout controller.

4. **The authentication middleware validates the request** in `backend/middleware/authMiddleware.js`. It reads the Bearer token, checks whether it is already in `token_blacklist`, verifies the JWT signature and expiration, and attaches the decoded identity to `req.user`. If the token is missing, invalid, expired, or already blacklisted, the route returns an authorization error instead of reaching the controller.

5. **The controller invalidates the token** in `backend/controllers/authController.js`. Its `logout` handler reads the token from the request header, decodes its expiration time, and inserts the token and expiration into the `token_blacklist` table. The table is defined in `database/60_percent_update.sql`. After a successful insert, the controller responds with `Logged out successfully`.

6. **The frontend clears its local session** back in `AuthContext.jsx`. After the request attempt, whether it succeeds or fails, the function removes `token` and `user` from `localStorage`, sets the React `user` state to `null`, and deletes Axios's default `Authorization` header. The `storage` listener in the same file also clears the displayed user in other open tabs when the `user` entry is removed.

7. **The Navbar finishes the navigation** in `Navbar.jsx`: it closes the dropdown and sends the current tab to the home page.

### Why logout has both frontend and backend steps

Removing `token` from `localStorage` signs the user out in this browser. Adding that token to `token_blacklist` prevents the same JWT from being accepted by protected backend routes if it is reused elsewhere. The `protect` middleware checks the blacklist on authenticated requests.

If the logout API call fails, the browser still clears its local session, but the backend may not have blacklisted the token. In that case, a copied token could remain usable until it expires.

## How do triggers, functions, procedures, and complex queries work?

These are MySQL-side features, but they are reached in different ways. The browser does not call a trigger or a database function directly: the frontend calls an API, the Express route selects a controller, and the controller sends SQL to MySQL. Triggers are automatic; stored functions and procedures are explicitly referenced by SQL; analytics queries are regular SQL statements in a controller.

### Installing the database features

`database/triggers_functions_procedures.sql` contains the current definitions for the triggers, functions, and procedures. Apply it to `loge_achi_db` using a MySQL script runner/client. The `DELIMITER` statements are for a script runner and are not sent as one ordinary prepared query. `backend/server.js` mounts API routes and connects to MySQL; starting the server does not create these database objects.

`backend/apply_db_features.js` also contains JavaScript code that creates database features, but its embedded `sp_place_order` is an older version without the row-locking stock protection in the SQL source. Use the SQL file as the current source of truth rather than running that installer after it.

### Triggers run automatically

- `trg_product_auto_out_of_stock` is a `BEFORE UPDATE` trigger on `products`. Any SQL update to a product can invoke it. It changes an active product to `OUT_OF_STOCK` when stock reaches zero, and restores it to `ACTIVE` when stock is replenished from zero. For example, checkout's `sp_place_order` updates product stock; product-management operations can update it as well. Neither the frontend nor a controller issues a separate call to this trigger.
- `trg_order_status_audit` is an `AFTER UPDATE` trigger on `seller_orders`. A seller changes a status through `frontend/src/pages/SellerDashboard.jsx` -> `PUT /api/orders/seller/:id/status` -> `backend/routes/orderRoutes.js` -> `orderController.updateSellerOrderStatus` in `backend/controllers/orderController.js`. MySQL then automatically inserts a log row into `order_status_log` when the preparation status changed. The admin audit view requests `GET /api/analytics/orders/:id/log`; `analyticsController.getOrderStatusLog` reads and returns those rows.

### Functions are used inside SQL

- `fn_seller_revenue(seller_id)` calculates a seller's revenue while excluding cancelled orders. `sp_seller_dashboard` uses it for the seller's dashboard total, and `analyticsController.getTopSellers` uses it in the admin analytics query.
- `fn_product_avg_rating(product_id)` calculates the average of published reviews for one product. It is used in `productController` for catalog/detail product ratings, in `reviewController.getProductReviews` for the review summary, and in `analyticsController.getTopSellingProducts` for the product analytics table.

The caller writes a statement such as `SELECT fn_product_avg_rating(?)`; MySQL evaluates the function as part of that query and returns its value in the result row.

### Procedures are explicitly called by controllers

- **Checkout:** `frontend/src/pages/CheckoutPage.jsx` sends `POST /api/orders`. `backend/server.js` mounts `orderRoutes` at `/api/orders`; `backend/routes/orderRoutes.js` protects the customer route and calls `orderController.placeOrder`. That controller executes `CALL sp_place_order(...)`, then reads the procedure's output variables for the order ID, total, and result message. The procedure performs the multi-step order creation and stock deduction in a database transaction. Updating product stock also causes `trg_product_auto_out_of_stock` to run automatically.
- **Seller dashboard stats:** `frontend/src/pages/SellerDashboard.jsx` requests `/api/analytics/seller/dashboard` when it loads. `analyticsRoutes.js` requires a seller token and maps the request to `analyticsController.getSellerDashboardStats`, which executes `CALL sp_seller_dashboard(?)` with the authenticated seller ID. The controller returns the first row from MySQL's stored-procedure result to the frontend.

### Admin complex analytics queries

The analytics tables are not stored procedures. Their SQL is written in `backend/controllers/analyticsController.js` as regular `db.query(...)` statements. When an admin opens the Analytics tab, `frontend/src/pages/AdminDashboard.jsx` runs `loadAnalytics()` and requests these endpoints in parallel:

| Dashboard data | API endpoint | Controller query |
|---|---|---|
| Top Selling Products | `GET /api/analytics/top-products` | `getTopSellingProducts`: joins products, sellers, categories, orders, order items, and reviews; aggregates units and revenue; uses the average-rating function. |
| Top Merchants by Revenue | `GET /api/analytics/top-sellers` | `getTopSellers`: aggregates sellers, products, orders, and reviews; uses `fn_seller_revenue`. |
| Category Sales Performance | `GET /api/analytics/categories` | `getCategorySalesAnalytics`: aggregates category sales and uses a subquery to find the best-selling product. |
| Monthly Revenue Trend | `GET /api/analytics/revenue-trend` | `getMonthlyRevenueTrend`: groups non-cancelled order totals by month using MySQL date functions. |
| Customer Lifetime Analytics | `GET /api/analytics/customers` | `getCustomerAnalytics`: aggregates customer order totals and wishlist counts. |

The top-products and top-sellers endpoints are public in `backend/routes/analyticsRoutes.js`; the other three analytics endpoints require an ADMIN token. The admin page has an authenticated request, so it can call all five. Each controller sends its query to MySQL and responds with JSON; the dashboard stores those arrays in React state and renders them in tables.

### Example: how Top Selling Products is assembled

The query in `analyticsController.getTopSellingProducts` is a single SQL statement. It asks MySQL to combine product and sales data and return one summary row per product. Conceptually, it works like this (the database optimizer may choose a different physical execution order):

1. **Start with the products.** `FROM products p` makes each catalog product the starting record. `JOIN sellers` and `JOIN categories` add its store and category; these are inner joins, so a product must have matching seller and category rows.
2. **Attach optional sales and reviews.** `LEFT JOIN order_items` connects sales to products, then `seller_orders`, `orders`, and published `reviews` supply order and review data. A left join keeps products even when there are no matching sales or reviews; their missing values can be handled as zero.
3. **Exclude archived products.** `WHERE p.status != 'ARCHIVED'` filters out archived catalog entries.
4. **Calculate one row per product.** `GROUP BY` the product and its displayed seller/category fields makes matching order-item rows into one product group. `SUM(oi.quantity)` calculates units sold, `SUM(oi.line_total)` calculates sales value, and `COUNT(DISTINCT r.review_id)` counts published reviews without counting a review repeatedly because of other joins. `COALESCE(..., 0)` converts a missing aggregate to zero.
5. **Add values from database helpers.** `fn_product_avg_rating(p.product_id)` calculates that product's published-review average. A scalar subquery looks up its primary image from `product_images`.
6. **Rank and cap the results.** `ORDER BY total_sold DESC, total_revenue DESC` puts higher-selling products first and uses revenue as a tie-breaker. `LIMIT ?` caps the number of rows; the controller supplies the request's `limit`, or defaults to 10.

Then the response travels back through Express as `{ success: true, data: products }`. `AdminDashboard.loadAnalytics()` receives it from `/api/analytics/top-products`, puts `data` into `topProducts`, and React renders each row in the Top Selling Products table.

**Current-query caveat:** the query puts `o.order_status != 'CANCELLED'` in the `LEFT JOIN orders ... ON` condition, but its sales sums use `order_items` columns and do not require a matching non-cancelled `orders` row. Therefore that condition alone does not guarantee cancelled order items are excluded from `total_sold` or `total_revenue`. The displayed totals may include them until the query's aggregate/filter logic is changed.

The other analytics use the same general pattern but answer different questions: top sellers groups by seller and uses `fn_seller_revenue`; category analytics groups by category and uses a subquery to select its best-selling product; monthly revenue groups orders by a formatted date; customer analytics groups order and wishlist data by customer. Joins connect related tables, aggregate functions summarize multiple records, and grouping determines what each returned row represents.
