const db = require('../config/db');


exports.getDashboard = (req, res) => {
  res.render('admin/dashboard', { message: null });
};


// Show the Add Food Form
exports.getAddFood = (req, res) => {
  res.render('admin/addFood');
};


// Handle Food Submission
exports.postAddFood = async (req, res) => {
  try {
    const { name, description, image_url, price } = req.body;


    // Basic validation (optional)
    if (!name || !price) {
      return res.status(400).send('Name and Price are required.');
    }


    await db.none(
      `
      INSERT INTO food_items (name, description, image_url, price)
      VALUES ($1, $2, $3, $4)
      `,
      [name, description, image_url, price]
    );


    res.redirect('/admin/food'); // Redirect to food list page
  } catch (err) {
    console.error('❌ Error inserting food:', err);
    res.status(500).send('Server Error');
  }
};


exports.getAllFoods = async (req, res) => {
  try {
    const foods = await db.any('SELECT * FROM food_items ORDER BY created_at DESC');
    res.render('admin/foodList', { foods });
  } catch (err) {
    console.error('❌ Error fetching food items:', err);
    res.status(500).send('Server Error');
  }
};


// GET - Show edit form
exports.getEditFood = async (req, res) => {
  const { id } = req.params;
  try {
    const food = await db.oneOrNone('SELECT * FROM food_items WHERE id = $1', [id]);
    if (!food) {
      return res.status(404).send("Food item not found");
    }
    res.render('admin/editFood', { food });
  } catch (err) {
    console.error("Error loading edit form:", err);
    res.status(500).send("Server error");
  }
};


// POST - Handle update form
exports.postEditFood = async (req, res) => {
  const { id } = req.params;
  const { name, description, image_url, price } = req.body;
  try {
    await db.none(`
      UPDATE food_items
      SET name = $1, description = $2, image_url = $3, price = $4
      WHERE id = $5
    `, [name, description, image_url, price, id]);


    res.redirect('/admin/food');
  } catch (err) {
    console.error("Error updating food:", err);
    res.status(500).send("Server error");
  }
};


exports.deleteFood = async (req, res) => {
  const { id } = req.params;
  try {
    await db.none('DELETE FROM food_items WHERE id = $1', [id]);
    res.redirect('/admin/food');
  } catch (err) {
    console.error("Error deleting food:", err);
    res.status(500).send("Server error");
  }
};
