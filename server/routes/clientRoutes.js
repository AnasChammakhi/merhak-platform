const express =
  require("express");

const authenticate =
  require(
    "../middleware/authMiddleware"
  );

const requireAdmin =
  require(
    "../middleware/adminMiddleware"
  );

const {
  getClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
  getMeasurements,
  createMeasurement,
  updateMeasurement,
  deleteMeasurement,
} = require(
  "../controllers/clientController"
);


const router =
  express.Router();


router.use(
  authenticate,
  requireAdmin
);


router.get(
  "/",
  getClients
);


router.get(
  "/:id",
  getClientById
);


router.post(
  "/",
  createClient
);


router.put(
  "/:id",
  updateClient
);


router.delete(
  "/:id",
  deleteClient
);


router.get(
  "/:id/measurements",
  getMeasurements
);


router.post(
  "/:id/measurements",
  createMeasurement
);


router.put(
  "/:id/measurements/:measurementId",
  updateMeasurement
);


router.delete(
  "/:id/measurements/:measurementId",
  deleteMeasurement
);


module.exports =
  router;