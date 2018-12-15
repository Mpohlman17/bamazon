var mysql = require("mysql");
var inquirer = require("inquirer");
var Table = require('cli-table');

var connection = mysql.createConnection({
  host: "localhost",
  port: 8889,
  // put in your user ID here
  user: "",
  // put in your password here
  password: "",
  database: "bamazon_db"
});
connection.connect((err) => {
  if (err) throw err;
  console.log('Thank you for chosing to shop at Bamazon, ');
  console.log('we have awesome products avalible for you today')
  // confirm myqsl is connected and display inventory
  displayProducts();
});

var displayProducts = function () {
  connection.query(`SELECT * FROM products`, (err, res) => {
    var listTable = new Table({
      head: ['Item ID', 'Product Name', 'Price', 'Quantity'],
      colWidths: [10, 45, 12, 12]
    });

    for (var i = 0; i < res.length; i++) {
      listTable.push([res[i].item_id, res[i].product_name, `$${res[i].price}`, res[i].inventory_quantity]);
    }

    console.log(`\n\n${listTable.toString()}\n\n`);
    promptUserPurchase();
  });
};
// nameing sure user input is a true integer with no decimal or 0
function validateInput(value) {
  var integer = Number.isInteger(parseFloat(value));
  var numcheck = Math.sign(value);

  if (integer && (numcheck === 1)) {
    return true;
  } else {
    return 'Please enter a whole non-zero number.';
  }
}

// ask user which product they would like to purchase
function promptUserPurchase() {

  // Prompt the user to select an item ID
  inquirer.prompt([{
      type: 'input',
      name: 'item_id',
      message: 'Please enter the Item ID which you would like to purchase today.',
      validate: validateInput,
      filter: Number
    },
    {
      type: 'input',
      name: 'quantity',
      message: 'How many would you like to purchase?',
      validate: validateInput,
      filter: Number
    }
  ]).then((answers) => {
    var product = answers.item_id;
    var quantity = answers.quantity;

    // Query db to confirm that the given item ID exists in the desired quantity
    var queryStr = 'SELECT * FROM products WHERE ?';

    connection.query(queryStr, {
      item_id: product
    }, function (err, res) {
      if (err) throw err;

      if (res.length === 0) {
        console.log('ERROR: Please select a valid Item ID.');
        displayItems();

      } else {
        var productData = res[0];
        // If have quantity requested process transaction
        if (quantity <= productData.inventory_quantity) {
          console.log('\nSuccess!!! We are able to fulfill your order today\n');

          // Construct the updating query string
          var updateQueryStr = 'UPDATE products SET inventory_quantity = ' + (productData.inventory_quantity - quantity) + ' WHERE item_id = ' + product;

          // Update the inventory and inform customer of their bill of sale
          connection.query(updateQueryStr, function (err, res) {
            if (err) throw err;

            console.log('Your order has been placed! Your total is $' + productData.price * quantity);
            console.log('\nThank you for shopping with us today!');
            console.log("\n---------------------------------------------------------------------\n");

            // End the database connection
            connection.end();
          })
        } else {
          console.log('Sorry, there is not enough product in stock, ');
          console.log('we are unable to process this large of an order at this time.');
          console.log('We appoligize for the inconvience this may cause.')
          console.log("\n---------------------------------------------------------------------\n");

          displayProducts();
        }
      }
    })
  })
}