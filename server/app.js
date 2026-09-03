const express =
  require("express");

const cors =
  require("cors");

const helmet =
  require("helmet");

const session =
  require("express-session");

require("dotenv").config();


const path =
  require("path");

const sessionStore =
  require("./config/sessionStore");

const authRoutes =
  require("./routes/authRoutes");

const clientRoutes =
  require("./routes/clientRoutes");

const categoryRoutes =
  require("./routes/categoryRoutes");

const productRoutes =
  require("./routes/productRoutes");

const adminProductRoutes =
  require("./routes/adminProductRoutes");
const orderRoutes =
  require("./routes/orderRoutes");
const publicOrderRoutes =
  require("./routes/publicOrderRoutes");

const customOrderRoutes =
  require("./routes/customOrderRoutes");

const calendarRoutes =
  require("./routes/calendarRoutes");

const {
  csrfProtection,
} = require(
  "./middleware/csrfMiddleware"
);

const {
  notFound,
  errorHandler,
} = require(
  "./middleware/errorMiddleware"
);


const app =
  express();


const isProduction =
  process.env.NODE_ENV ===
  "production";


// ==========================================
// SECURITY
// ==========================================

app.disable(
  "x-powered-by"
);

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },
  })
);

// Serve static uploaded product images
app.use(
  "/uploads",
  express.static(
    path.join(__dirname, "public", "uploads")
  )
);


if (isProduction) {
  app.set(
    "trust proxy",
    1
  );
}


// ==========================================
// CORS
// ==========================================

app.use(
  cors({
    origin: (origin, callback) => {
      const allowed = process.env.CLIENT_URL
        ? process.env.CLIENT_URL.replace(/\/+$/, "")
        : undefined;

      // allow non-browser requests like Postman (no origin)
      if (!origin) return callback(null, true);

      if (origin === allowed) return callback(null, true);

      return callback(new Error("CORS policy: origin not allowed"));
    },

    credentials: true,

    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Content-Type",
      "X-CSRF-Token",
    ],
  })
);


// ==========================================
// BODY
// ==========================================

app.use(
  express.json({
    limit: "20kb",
  })
);


// ==========================================
// SESSION
// ==========================================

app.use(
  session({
    name:
      "merhak.sid",

    secret:
      process.env.SESSION_SECRET,

    store:
      sessionStore,

    resave:
      false,

    saveUninitialized:
      false,

    rolling:
      true,

    cookie: {
      httpOnly:
        true,

      secure:
        isProduction,

      sameSite:
        "lax",

      maxAge:
        1000 *
        60 *
        60 *
        8,

      path:
        "/",
    },
  })
);


// ==========================================
// HEALTH
// ==========================================

app.get(
  "/",
  (req, res) => {
    res.json({
      message:
        "API MERHAK opérationnelle",
    });
  }
);


// ==========================================
// CSRF
// ==========================================

app.use(
  csrfProtection
);


// ==========================================
// ROUTES
// ==========================================

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/admin/clients",
  clientRoutes
);

app.use(
  "/api/admin/products",
  adminProductRoutes
);

app.use(
  "/api/categories",
  categoryRoutes
);

app.use(
  "/api/products",
  productRoutes
);

app.use(
  "/api/admin/orders",
  orderRoutes
);

app.use(
  "/api/orders",
  publicOrderRoutes
);

app.use(
  "/api/admin/custom-orders",
  customOrderRoutes
);

app.use(
  "/api/admin/calendar",
  calendarRoutes
);


// ==========================================
// ERRORS
// ==========================================

app.use(
  notFound
);

app.use(
  errorHandler
);


// ==========================================
// START SERVER
// ==========================================

const PORT =
  process.env.PORT || 5000;


app.listen(
  PORT,
  () => {
    console.log(
      `Serveur MERHAK : http://localhost:${PORT}`
    );
  }
);