const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");

const mongoose = require("mongoose");
const { loadavg } = require("os");
const MongoClient = require("mongodb").MongoClient;

const app = express();
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));
const url =
  "mongodb+srv://admin-elvis:kali@cluster0.sbjotar.mongodb.net/GradesDB";
mongoose.connect(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const GradeSchema = new mongoose.Schema({
  subject: String,
  grade: [Number],
  avgGrade: Number,
});

const Grade = mongoose.model("Grade", GradeSchema);

const dbName = "GradesDB";
app.post("/updateEJS", async (req, res) => {
  const { subject, grade } = req.body;

  try {
    // Find the subject in the database
    const existingGrade = await Grade.findOne({ subject });

    if (existingGrade) {
      // Subject already exists, add the new grade
      existingGrade.grade.push(grade);

      // Recalculate the average grade for the subject
      const total = existingGrade.grade.reduce((acc, g) => acc + g, 0);
      const average = total / existingGrade.grade.length;
      existingGrade.avgGrade = average;

      await existingGrade.save();
    } else {
      // Subject doesn't exist, create a new subject with the given grade
      const newGrade = new Grade({
        subject,
        grade: [grade],
        avgGrade: grade,
      });
      await newGrade.save();
    }

    const updatedGrades = await Grade.find({});

    res.render("index", { result: updatedGrades });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error updating/inserting grade");
  }
});

app.get("/loginEJS", (req, res) => {
  res.render("login.ejs");
});

app.get("/", (req, res) => {
  res.render("welcome.ejs");
});

app.get("/", async (req, res) => {
  const { subject, grade } = req.body;

  const client = await MongoClient.connect(url);
  const db = client.db(dbName);
  const collection = db.collection("grades");

  // Get all grades from the database
  const grades = await collection.find().toArray();

  // Calculate the average grade for each subject (ChatGPT)
  const subjects = [...new Set(grades.map((g) => g.subject))];
  console.log(subjects);
  const averages = subjects.map((subject) => {
    const gradesForSubject = grades.filter((g) => g.subject === subject);
    const total = gradesForSubject.reduce((acc, g) => acc + g.grade, 0);
    const average = total / gradesForSubject.length;
    console.log(average);
    return { subject, avgGrade: average };
  });

  res.render("index", { result: grades, averages: averages });
});

app.post("/deleteGrades", async (req, res) => {
  const { subject, grade } = req.body;
  MongoClient.connect(url, function (err, client) {
    const db = client.db(dbName);
    const collection = db.collection("grades");

    try {
      // Call the deleteMany() method to delete all documents in the "grades" collection
      collection.deleteMany();

      // Send a success response to the client
      res.status(200).send("All grades deleted successfully");
    } catch (err) {
      // Send an error response to the client
      res.status(500).send("Error deleting grades");
    }
  });
});

//LOGIN | Register

app.post("/login", async (req, res) => {
  const name = req.body.username;
  const password = req.body.password;

  const client = await MongoClient.connect(url, {
    serverSelectionTimeoutMS: 10000,
  });
  const db = client.db(dbName);
  const collection = db.collection("Logindatens");

  try {
    const user = await collection.findOne({ name: name });

    if (!user) {
      // User not found
      const Nuser = "User not Found in my Database";
      res.render("login", {
        title: "Login",
        loginMessage: Nuser,
      });
    } else if (password === user.passwordR) {
      const userGrades = await Grade.find({
        /* query to filter grades for this user */
      });
      res.render("index", { result: userGrades, name: user.name });
    } else {
      // Incorrect username or password
      const loginMessage = "Incorrect username or password";
      res.render("login", {
        title: "Login",
        loginMessage: loginMessage,
      });
    }
  } catch (err) {
    const ServerError = "Server Error! Try Again";
    res.render("login", {
      title: "Login",
      loginMessage: ServerError,
    });
  } finally {
    client.close();
  }
});

app.post("/register", async (req, res) => {
  const { name, surname, email, passwordR } = req.body;

  const client = await MongoClient.connect(url);
  const db = client.db(dbName);
  const collection = db.collection("Logindatens");

  collection.insertOne(
    { name, surname, email, passwordR },
    function (err, result) {
      if (err) {
        console.log("Error Registering: ", err);
        console.log(err);
      } else {
        console.log(result);
      }
      const success = "You are sucessfully registered";
      res.render("login", {
        title: "register",
        registerMessage: success,
      });
    }
  );
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
