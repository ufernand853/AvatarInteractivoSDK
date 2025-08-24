// app.js
const express = require('express');
const app = express();
const connectDB = require('./utils/db');
const userRoutes = require('./routes/userRoutes');
const sessionRoutes = require("./routes/sessionRoutes");
const dataSessionRoutes = require("./routes/dataSessionRoutes");
const cors = require('cors');

app.use(express.json());
app.use(cors());

app.use('/usuarios', userRoutes);
app.use("/session", sessionRoutes);
app.use("/data-session", dataSessionRoutes);

connectDB();

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});
