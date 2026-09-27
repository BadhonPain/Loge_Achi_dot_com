# LogeAchi.com — CSE216 Database Systems Project Defense & Checklist Guide

This document explains every single database requirement from the **CSE216 Project Checklist**, where it is implemented in the codebase, and how to demonstrate and explain each part during faculty evaluation.

---

## Checklist Item 1: User Authentication
- **Requirement:** Ensure authentication of users is handled by your own code (not third-party services like Firebase, Supabase, Auth0). May use JWT or sessions.
- **Where it is implemented:**
  - [`backend/controllers/authController.js`](file:///e:/Loge_Achi_dot_com/backend/controllers/authController.js)
  - [`backend/middleware/authMiddleware.js`](file:///e:/Loge_Achi_dot_com/backend/middleware/authMiddleware.js)
- **Explanation:**
  - Passwords are salted and hashed using `bcryptjs` (cost factor 10) before storage in `password_hash`.
  - JSON Web Tokens (JWT) are signed server-side using `jsonwebtoken` with role-based payloads (`{ id, email, role }`).
  - Secure logout is implemented via a MySQL database token blacklist table (`token_blacklist`), preventing token reuse.

---

## Checklist Item 2: Authentication Validation on Every Page
- **Requirement:** Check authentication on every page to ensure user is authenticated before processing any HTTP request.
- **Where it is implemented:**
  - [`backend/middleware/authMiddleware.js`](file:///e:/Loge_Achi_dot_com/backend/middleware/authMiddleware.js): `protect` and `authorize(...roles)`.
  - Routes protected:
    - [`orderRoutes.js`](file:///e:/Loge_Achi_dot_com/backend/routes/orderRoutes.js): Orders require `protect` and role checks.
    - [`cartRoutes.js`](file:///e:/Loge_Achi_dot_com/backend/routes/cartRoutes.js): Protected cart operations.
    - [`adminRoutes.js`](file:///e:/Loge_Achi_dot_com/backend/routes/adminRoutes.js): Strictly requires `protect` and `authorize('ADMIN')`.
    - [`sellerRoutes.js`](file:///e:/Loge_Achi_dot_com/backend/routes/sellerRoutes.js): Product management strictly requires `authorize('SELLER')`.
    - [`wishlistRoutes.js`](file:///e:/Loge_Achi_dot_com/backend/routes/wishlistRoutes.js): Requires `authorize('CUSTOMER')`.
    - [`reviewRoutes.js`](file:///e:/Loge_Achi_dot_com/backend/routes/reviewRoutes.js): Review submission requires customer auth & ownership check.
  - Frontend Route Protection:
    - In React (`AdminDashboard.jsx`, `SellerDashboard.jsx`, `OrdersPage.jsx`, `CheckoutPage.jsx`), `useEffect` checks `user` and `user.role` from `AuthContext` and redirects unauthenticated users to `/login`.

---

## Checklist Item 3: Explicit Transaction Control
- **Requirement:** Implement explicit transaction control in every DML operation (`INSERT`, `UPDATE`, `DELETE`) using `COMMIT` and `ROLLBACK`.
- **Where it is implemented:**
  - All controllers acquire a pooled connection (`await db.getConnection()`), initiate `await connection.beginTransaction()`, commit on success (`await connection.commit()`), and roll back inside `catch` blocks (`await connection.rollback()`):
    - `authController.js`: Customer registration + cart creation in atomic transaction.
    - `orderController.js`: `sp_place_order` procedure runs atomic transaction inside DB, and order status updates use `beginTransaction/commit/rollback`.
    - `cartController.js`: `addToCart`, `updateCartItem`, `deleteCartItem` all use explicit transactions.
    - `productController.js`: `createProduct`, `updateProduct`, `deleteProduct` all use explicit transactions.
    - `sellerController.js`: `createSeller`, `updateSeller` use explicit transactions.
    - `customerController.js`: `createCustomer`, `updateCustomer` use explicit transactions.
    - `addressController.js`: `createAddress`, `updateAddress`, `deleteAddress` use explicit transactions.
    - `categoryController.js`: `createCategory`, `updateCategory` use explicit transactions.
    - `adminController.js`: `updateSellerStatus`, `updateCustomerStatus`, `archiveProduct` use explicit transactions.
    - `wishlistController.js`: `addToWishlist`, `removeFromWishlist` use explicit transactions.
    - `reviewController.js`: `createReview`, `hideReview` use explicit transactions.

---

## Checklist Item 4: Use of Triggers (2 Triggers Implemented)
- **Requirement:** Ensure you use one or more triggers for data validation or logging sensitive actions to a shadow table.
- **Where it is implemented:**
  - File: [`database/triggers_functions_procedures.sql`](file:///e:/Loge_Achi_dot_com/database/triggers_functions_procedures.sql)

### Trigger 1: `trg_product_auto_out_of_stock`
- **Timing & Event:** `BEFORE UPDATE ON products FOR EACH ROW`
- **Purpose:** Automatically changes product status to `'OUT_OF_STOCK'` when `stock_quantity` reaches 0 after checkout, and auto-restores to `'ACTIVE'` when stock is replenished.
```sql
CREATE TRIGGER trg_product_auto_out_of_stock
BEFORE UPDATE ON products
FOR EACH ROW
BEGIN
    IF NEW.stock_quantity = 0 AND NEW.status = 'ACTIVE' THEN
        SET NEW.status = 'OUT_OF_STOCK';
    END IF;
    
    IF NEW.stock_quantity > 0 AND OLD.stock_quantity = 0 AND OLD.status = 'OUT_OF_STOCK' THEN
        SET NEW.status = 'ACTIVE';
    END IF;
END;
```

### Trigger 2: `trg_order_status_audit`
- **Timing & Event:** `AFTER UPDATE ON orders FOR EACH ROW`
- **Purpose:** Auditing sensitive order status transitions (`PENDING` -> `SHIPPED` -> `DELIVERED` -> `CANCELLED`) to the shadow/audit table `order_status_log`.
```sql
CREATE TABLE IF NOT EXISTS order_status_log (
    log_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT UNSIGNED NOT NULL,
    old_status VARCHAR(30) NULL,
    new_status VARCHAR(30) NOT NULL,
    changed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER trg_order_status_audit
AFTER UPDATE ON orders
FOR EACH ROW
BEGIN
    IF OLD.order_status != NEW.order_status THEN
        INSERT INTO order_status_log (order_id, old_status, new_status)
        VALUES (OLD.order_id, OLD.order_status, NEW.order_status);
    END IF;
END;
```
- **Live Demo in UI:** In `AdminDashboard.jsx`, click "Update Status" on any order. The trigger executes in MySQL, records to `order_status_log`, and clicking "View Trigger Log" renders the shadow table entries!

---

## Checklist Item 5: Use of Functions (2 Stored Functions Implemented)
- **Requirement:** Ensure you use one or more functions returning statistical or computed values from the database.
- **Where it is implemented:**
  - File: [`database/triggers_functions_procedures.sql`](file:///e:/Loge_Achi_dot_com/database/triggers_functions_procedures.sql)

### Function 1: `fn_seller_revenue(seller_id)`
- **Returns:** `DECIMAL(14,2)`
- **Purpose:** Calculates total non-cancelled gross revenue for a given vendor by joining `seller_orders` and `orders`.
```sql
CREATE FUNCTION fn_seller_revenue(p_seller_id BIGINT UNSIGNED)
RETURNS DECIMAL(14,2)
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE v_revenue DECIMAL(14,2);
    
    SELECT COALESCE(SUM(so.seller_total), 0)
    INTO v_revenue
    FROM seller_orders so
    JOIN orders o ON so.order_id = o.order_id
    WHERE so.seller_id = p_seller_id
      AND o.order_status != 'CANCELLED'
      AND so.preparation_status != 'CANCELLED';
    
    RETURN v_revenue;
END;
```

### Function 2: `fn_product_avg_rating(product_id)`
- **Returns:** `DECIMAL(3,2)`
- **Purpose:** Computes the average verified customer review rating for a product from the `reviews` table joining `order_items`.
```sql
CREATE FUNCTION fn_product_avg_rating(p_product_id BIGINT UNSIGNED)
RETURNS DECIMAL(3,2)
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE v_avg DECIMAL(3,2);
    
    SELECT COALESCE(AVG(r.rating), 0)
    INTO v_avg
    FROM reviews r
    JOIN order_items oi ON r.order_item_id = oi.order_item_id
    WHERE oi.product_id = p_product_id
      AND r.review_status = 'PUBLISHED';
    
    RETURN v_avg;
END;
```

---

## Checklist Item 6: Use of Procedures (2 Stored Procedures Implemented)
- **Requirement:** Ensure at least one procedure for a multi-step workflow modifying several tables in one operation.
- **Where it is implemented:**
  - File: [`database/triggers_functions_procedures.sql`](file:///e:/Loge_Achi_dot_com/database/triggers_functions_procedures.sql)

### Procedure 1: `sp_place_order(...)`
- **Multi-step workflow:** Modifies 5+ tables atomically:
  1. Validates delivery address ownership (`customer_addresses`).
  2. Validates cart items and verifies available stock (`cart_items`, `products`).
  3. Inserts master customer order (`orders`).
  4. Generates sub-orders partitioned by merchant (`seller_orders`).
  5. Inserts historical snapshot items (`order_items`).
  6. Automatically deducts product inventory (`products`).
  7. Generates transaction payment record (`payments`).
  8. Empties the customer's cart (`cart_items`).
  9. Executes `START TRANSACTION` / `COMMIT` / `ROLLBACK` on `SQLEXCEPTION`.
- Called directly from [`backend/controllers/orderController.js`](file:///e:/Loge_Achi_dot_com/backend/controllers/orderController.js).

### Procedure 2: `sp_seller_dashboard(seller_id)`
- **Multi-table analytics workflow:**
  - Computes active products, total merchant orders, pending order count, calls `fn_seller_revenue(seller_id)`, and computes average rating across customer reviews in a single database roundtrip.
  - Called directly from [`backend/controllers/analyticsController.js`](file:///e:/Loge_Achi_dot_com/backend/controllers/analyticsController.js) and displayed live on [`SellerDashboard.jsx`](file:///e:/Loge_Achi_dot_com/frontend/src/pages/SellerDashboard.jsx).

---

## Checklist Item 7: Use of Complex Queries (5 Complex Queries Implemented)
- **Requirement:** Three or more complex queries retrieving data from multiple tables and using aggregation functions.
- **Where implemented:**
  - Controller: [`backend/controllers/analyticsController.js`](file:///e:/Loge_Achi_dot_com/backend/controllers/analyticsController.js)
  - Routes: [`backend/routes/analyticsRoutes.js`](file:///e:/Loge_Achi_dot_com/backend/routes/analyticsRoutes.js)
  - Frontend Display: Tab **📊 Analytics & Complex Queries** in [`AdminDashboard.jsx`](file:///e:/Loge_Achi_dot_com/frontend/src/pages/AdminDashboard.jsx).

| Query | Name | Tables Joined | Aggregation & Advanced Features |
|---|---|---|---|
| **Query 1** | Top Selling Products | `products`, `sellers`, `categories`, `order_items`, `seller_orders`, `orders`, `reviews` | `SUM(quantity)`, `SUM(line_total)`, `COUNT(DISTINCT r.review_id)`, `fn_product_avg_rating()`, subquery for primary image |
| **Query 2** | Top Merchants by Revenue | `sellers`, `products`, `seller_orders`, `order_items`, `reviews` | `fn_seller_revenue(seller_id)`, `COUNT(DISTINCT product_id)`, `COUNT(DISTINCT order_id)`, `AVG(rating)` |
| **Query 3** | Category Sales Performance | `categories`, `products`, `order_items`, `seller_orders`, `orders`, `reviews` | `COUNT(products)`, `SUM(items_sold)`, `SUM(total_revenue)`, Correlated scalar subquery for top product per category |
| **Query 4** | Monthly Revenue Trend | `orders` | `DATE_FORMAT(created_at, '%Y-%m')`, `SUM(grand_total)`, `AVG(grand_total)`, `COUNT(DISTINCT order_id)`, `DATE_SUB` filter |
| **Query 5** | Customer Lifetime Analytics | `customers`, `orders`, `wishlist_items` | `COUNT(orders)`, `SUM(grand_total)`, `AVG(grand_total)`, `MAX(created_at)`, `COUNT(wishlist)` |

---

## Checklist Item 8: Appropriate Use of Database Features
- Features are strictly applied to real e-commerce business domains:
  - Inventory management -> Triggers (prevent negative stock and out-of-stock visibility).
  - Order state tracking -> Audit log trigger (non-repudiation of status updates).
  - Multi-seller checkout -> Stored procedure (atomic cart-to-order workflow).
  - Seller revenue -> Stored function (reusable across analytics and seller dashboard).

---

## Checklist Item 9: Explaining Your Own Code
- Quick commands to verify everything live during defense:
  - Run the automated test suite:
    ```bash
    cd backend
    node verify_checklist.js
    ```
  - Re-apply or inspect triggers and procedures:
    ```bash
    node apply_db_features.js
    ```
  - Start servers:
    ```bash
    # Backend
    cd backend && npm run dev
    # Frontend
    cd frontend && npm run dev
    ```
