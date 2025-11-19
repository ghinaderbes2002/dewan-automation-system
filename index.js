import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import authRoute from "./routes/auth/authRoute.js";
import employeesRoute from "./routes/employees/employeesRoute.js";
import RequestsRoute from "./routes/Requests/membershipRequestsRoutes.js";
import registryEntriesRoute from "./routes/registryEntries/registryEntriesRoute.js";
import trainingRequestsRoutes from "./routes/Requests/trainingRequestsRoutes.js";



const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());


app.use("/auth", authRoute);  // مثال: /auth/login و /auth/me
app.use("/employees", employeesRoute); 
app.use("/Requests", RequestsRoute); 
app.use("/registry", registryEntriesRoute);
app.use("/training_requests", trainingRequestsRoutes);



app.listen(3000, () => console.log("Server running on port 3000"));
