var mysql = require("mysql");
var inquirer = require("inquirer");
var Table = require('cli-table');

var connection = mysql.createConnection({
    host: "localhost",
    port: 8889,
    // put in your user ID here
    user: " ",
    // put in your password here
    password: " ",
    database: "bamazon_db"
});
connection.connect((err) => {
    if (err) throw err;
    console.log('Welcome to the Bamazon Manager Server ');
    displayMenu();
    reset();
});
var itemToUpdate = {};

var reset = function () {
    itemToUpdate = {};
}

var displayMenu = function () {
    inquirer.prompt({
        name: 'action',
        type: 'rawlist',
        message: '\n\nChoose an action: ',
        choices: [
            'View Products for Sale',
            'View Low Inventory',
            'Add to Inventory',
            'Add New Product',
        ]
    }).then((answer) => {
        switch (answer.action) {
            case 'View Products for Sale':
                viewProductsForSale();
                break;
            case 'View Low Inventory':
                viewLowInventory();
                break;
            case 'Add to Inventory':
                addToInventory();
                break;
            case 'Add New Product':
                addNewProduct();
                break;
        }
    })
}

// function that allows for managers to view products currently for sale
var viewProductsForSale = function () {
    connection.query(`SELECT * FROM products`, (err, res) => {
        var listTable = new Table({
            head: ['Item ID', 'Product Name', 'Price', 'Quantity'],
            colWidths: [10, 45, 12, 12]
        });
        for (var i = 0; i < res.length; i++) {
            listTable.push([res[i].item_id, res[i].product_name, `$${res[i].price}`, res[i].inventory_quantity]);
        }
        console.log(`\n\n${listTable.toString()}\n\n`);
        connection.end();
    });
};

// displays what inventory is low for the manager
var viewLowInventory = function () {
    connection.query(`SELECT * FROM products WHERE inventory_quantity < 5 ORDER BY inventory_quantity DESC`, (err, res) => {
        if (res.length > 0) {
            var listTable = new Table({
                head: ['Item ID', 'Product Name', 'Price', 'Quantity'],
                colWidths: [10, 45, 12, 12]
            });

            for (var i = 0; i < res.length; i++) {
                listTable.push([res[i].item_id, res[i].product_name, `$${res[i].price}`, res[i].inventory_quantity]);
            }
            console.log(`\n\n${listTable.toString()}\n\n`);

        } else {
            console.log(`\n\tThere is nothing to restock today\n\n`);
        }
        connection.end();
    });
};
// allows for managers to add aditional inventory to current products
var addToInventory = function () {
    // viewProductsForSale();
    askForItemID();
};

// function for managers to add new products
var addNewProduct = function () {
    inquirer.prompt([{
            name: 'name',
            type: 'input',
            message: 'Enter the product name: '
        },
        {
            name: 'department',
            type: 'input',
            message: 'Enter the product department: '
        },
        {
            name: 'price',
            type: 'input',
            message: 'Enter a price for the new product',
            validate: (value) => {
                if (!isNaN(value) && value > 0) {
                    return true;
                } else {
                    console.log('Make smart business decisons, provide a price greater than $0.00');
                    return false;
                }
            }
        },
        {
            name: 'inventoryNum',
            type: 'input',
            message: 'Enter the current inventory of the new product: ',
            validate: (value) => {
                if (!isNaN(value) && value > 0) {
                    return true;
                } else {
                    console.log('We can not list this product with 0 in our inventory');
                    return false;
                }
            }
        }
    ]).then((answers) => {
        connection.query('INSERT INTO products SET ?', {
            product_name: answers.name,
            department_name: answers.department,
            price: answers.price,
            inventory_quantity: answers.inventoryNum
        }, (err, res) => {
            if (err) throw err;
            console.log('\n\tThe new product has been successfully added into our system!');
            viewProductsForSale();
        });
    });
};

// items are capped off at 30 products to secure quality control
var askForItemID = function () {
    inquirer.prompt({
        name: 'itemID',
        type: 'input',
        message: 'Enter the item ID for the product you would like to update: ',
        validate: (value) => {
            if (!isNaN(value) && (value > 0 && value <= 30)) {
                return true;
            } else {
                console.log('You have input an invalid item ID');
                return false;
            }
        }
    }).then((answer) => {
        connection.query('SELECT * FROM products WHERE ?', {
            item_id: answer.itemID
        }, (err, res) => {
            confirmItem(res[0].product_name, res);
        })
    });
};

var confirmItem = function (product, object) {
    inquirer.prompt({
        name: 'confirmItem',
        type: 'confirm',
        message: `You chose + '${product}' + Is this correct?`
    }).then((answer) => {
        if (answer.confirmItem) {
            itemToUpdate = {
                item_id: object[0].item_id,
                product_name: object[0].product_name,
                department_name: object[0].department_name,
                price: object[0].price,
                inventory_quantity: object[0].inventory_quantity,
            };
            askForUpdateQuantity();
        } else {
            askForItemID();
        }
    });
};

var askForUpdateQuantity = function () {
    inquirer.prompt({
        name: 'updateQuantity',
        type: 'input',
        message: 'Enter the quantity you would like to add: ',
        validate: (value) => {
            if (!isNaN(value) && value > 0) {
                return true;
            } else {
                console.log('please add a quantity that is greater then 0');
                return false;
            }
        }
    }).then((answer) => {
        itemToUpdate.updateQuantity = answer.updateQuantity;
        connection.query('UPDATE products SET ? WHERE ?', [{
                inventory_quantity: Number(itemToUpdate.inventory_quantity) + Number(answer.updateQuantity)
            },
            {
                item_id: itemToUpdate.item_id
            }
        ], (err, res) => {
            console.log(`\n\tInventory updated! '${itemToUpdate.product_name}' now has ${Number(itemToUpdate.inventory_quantity) + Number(itemToUpdate.updateQuantity)} items in inventory\n`);
            connection.end();
        });
    });
}