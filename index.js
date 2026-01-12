import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import authRoute from "./routes/auth/authRoute.js";
import employeesRoute from "./routes/admin/employees/employeesRoute.js";
import RequestsRoute from "./routes/Requests/membershipRequestsRoutes.js";
import registryEntriesRoute from "./routes/registryEntries/registryEntriesRoute.js";
import trainingRequestsRoutes from "./routes/Requests/trainingRequestsRoutes.js";
import officeOpeningRoutes from "./routes/Requests/officeOpeningRoutes.js";
import promotionRequestsRoute from "./routes/Requests/promotionRequestsRoute.js";
import auditorRoute from "./routes/auditor/auditorRoute.js";
import officeRoute from "./routes/admin/offices/officesRoute.js";
import engineersRoute from "./routes/engineers/engineersRoute.js";



const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

app.use("/auth", authRoute); // مثال: /auth/login و /auth/me
app.use("/employees", employeesRoute);
app.use("/Requests", RequestsRoute);
app.use("/registry", registryEntriesRoute);
app.use("/training_requests", trainingRequestsRoutes);
app.use("/office_opening_requests", officeOpeningRoutes);
app.use("/promotion_requests", promotionRequestsRoute);
app.use("/auditor", auditorRoute);
app.use("/offices", officeRoute);
app.use("/engineers", engineersRoute); // مسارات المهندسين


app.listen(3000, () => console.log("Server running on port 3000"));
