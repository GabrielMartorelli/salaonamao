const mongoose = require("mongoose");
const URI =
  "mongodb+srv://salaoUser:JprpMR9Wb9jD6VL5@salaonamaodev.t3reew1.mongodb.net/salaonamao?retryWrites=true&w=majority";

/* Connecting to the database. */
mongoose
  .connect(URI)
  .then(() => {
    console.log("DataBase connection established");
  })
  .catch((err) => {
    console.log(err);
  });
