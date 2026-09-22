require("dotenv").config();
const productRoutes = require("./routes/productRoutes");
const sellerRoutes = require("./routes/sellerRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const customerRoutes = require("./routes/customerRoutes");
const addressRoutes = require("./routes/addressRoutes");
const express = require("express");
const cors = require("cors");
const cartRoutes = require("./routes/cartRoutes");
const db = require("./config/db");
const imageRoutes = require("./routes/imageRoutes");
const offerRoutes = require("./routes/offerRoutes");
const app = express();

const PORT = process.env.PORT || 5000;


// Middleware
app.use(cors());
app.use(express.json());
app.use("/api/products", productRoutes);
app.use("/api/sellers", sellerRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/products", imageRoutes);
app.use("/api/customers", addressRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/offers", offerRoutes);
// Basic route
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Loge Achi API is running"
    });
});


// Start server after checking database
async function startServer() {

    try {

        await db.query("SELECT 1");

        console.log("MySQL database connected successfully");

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });

    } catch (error) {

        console.error("Database connection failed:");
        console.error(error.message);

        process.exit(1);
    }
}

startServer();