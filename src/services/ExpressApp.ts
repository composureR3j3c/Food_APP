import express, { Application } from "express";
import { AdminRoutes, CustomerRoutes, VandorRoutes } from "../routes";
import path from 'path';
import { ShoppingRoutes } from "../routes/ShoppingRoute";

export default async(app:Application)=>{

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const imagePath=path.join(__dirname,'../images')

app.use("/images",express.static(imagePath))

app.use("/admin", AdminRoutes);
app.use("/vandor", VandorRoutes);
app.use("/shopping", ShoppingRoutes);
app.use("/user", CustomerRoutes);

return app;
}