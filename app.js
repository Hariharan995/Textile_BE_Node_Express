const express = require('express')
const mongoose = require('mongoose')
const cron = require("node-cron")
require('dotenv/config')
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./swagger.yaml');
const app = express();
const routes = require('./src/routes/route');

app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(express.json());
app.use(cors());
app.use(routes);

// cron.schedule("* * * * *", function () {
//     sellerStatus.checkSellerStatus()
// });


app.get("/", (req, res) => {
    res.send("Hello World!")
});

mongoose.set("strictQuery", false);

app.listen(process.env.PORT, () => {
    //DB Connection 
    mongoose.connect(process.env.DB_CONNECTION, { dbName: 'textile', useNewUrlParser: true })
        .then(result => {
            console.log('connected to DB!')
        }).catch(err => {
            console.log(err);
        });
});

