import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;
const db = new pg.Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let items = [
  { id: 1, title: "Buy milk" },
  { id: 2, title: "Finish homework" },
];

app.get("/", async(req, res) => {
  const result = await db.query("SELECT * FROM items");
  // console.log(result);
  let tasks = [];
  result.rows.forEach((task) => {tasks.push(task)});
  // console.log(tasks);
  res.render("index.ejs", {
    listTitle: "Today",
    listItems: tasks,
  });
});

app.post("/add", async(req, res) => {
  const item = req.body.newItem;
  try{
    const result = await db.query("INSERT INTO items (title) VALUES ($1) RETURNING *", [item]);
    // items.push({ title: item });
    res.redirect("/");
  } catch (err) {
    console.error(err);
    }
});

app.post("/edit", async(req, res) => {
  const id = parseInt(req.body.updatedItemId);
  const title = req.body.updatedItemTitle;
  console.log(title);
  console.log(id);

  if(isNaN(id)){
    return res.status(400).send("Invalid ID.");
  }

  try{
    const result = await db.query(
      "UPDATE items SET title = $1 WHERE id = $2 RETURNING *", 
      [title, id]);
      res.redirect("/");
    } catch (err) {
      console.error(err);
      return res.status(500).send("Error updating item.");
      }
});

app.post("/delete", async(req, res) => {
  const id = parseInt(req.body.deleteItemId);
  console.log(id);
  const result = db.query("DELETE FROM items WHERE id = $1", [id]);
  res.redirect("/");
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
