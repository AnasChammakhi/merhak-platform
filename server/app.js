const express = require("express");
const cors = require("cors");

require("dotenv").config();


const db =
  require("./config/database");

const authRoutes =
  require("./routes/authRoutes");

const clientRoutes =
  require("./routes/clientRoutes");


const app = express();


// ==============================
// MIDDLEWARE
// ==============================

app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

app.use(
  express.json()
);


// ==============================
// BASIC ROUTES
// ==============================

app.get("/", (req, res) => {

  res.json({
    message:
      "Merhak backend is working",
  });

});


app.get(
  "/api/test-db",
  async (req, res) => {

    try {

      const [rows] =
        await db.execute(
          "SELECT 1 AS connected"
        );


      res.json({
        success: true,
        message:
          "Database connection successful",
        result: rows,
      });

    } catch (error) {

      console.error(error);


      res.status(500).json({
        success: false,
        message:
          "Database connection failed",
      });

    }

  }
);


// ==============================
// API ROUTES
// ==============================

app.use(
  "/api/auth",
  authRoutes
);


app.use(
  "/api/admin/clients",
  clientRoutes
);


// ==============================
// SERVER
// ==============================

const PORT =
  process.env.PORT || 5000;


app.listen(PORT, () => {

  console.log(
    `Server running on http://localhost:${PORT}`
  );

});