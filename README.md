# Loge Achi dot com


  **Tech Stack so far:**
- React(Vite)
- Express.js
- Node.js
- MySQL
- Git & GitHub

## Vendor Applications

For an existing database, apply `database/70_vendor_applications.sql` once before starting the updated backend. Fresh installations can use `database/schema.sql`, which now includes the `seller_applications` table. Vendor applications remain separate from seller accounts until an administrator approves them in the Admin Console.

For an existing database, also apply `database/80_seller_chat.sql` once to enable customer-seller conversations and data-backed seller response metrics. Fresh installations using `database/schema.sql` include the conversation and message tables.

For an existing database, apply `database/90_customer_notifications.sql` after `database/80_seller_chat.sql` to enable order-status and seller-reply notifications. Fresh installations using `database/schema.sql` include customer notifications.
