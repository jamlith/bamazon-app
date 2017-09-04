/*
 *  (bamazon):
 *      bamazon-manager.js - an interface to view inventory, alerts for low
 *              inventory, and an option to add new products.
 *
 *-------------------------------------->8------------------------------------*/

var mysql = require('mysql'),
    clc = require('cli-color'),
    inquirer = require('inquirer');

var sql_info = {
    user: "james",
    password: "james",
    host: "localhost",
    database: "bamazon"
};

var products = [],
    ids = [];

function getTable() {
    var cxs = mysql.createConnection(sql_info);
    cxs.connect();
    var query = "SELECT * FROM `products`";
    cxs.query(query, (err, resp, vals) => {
        if (!err) {
            products = JSON.parse(JSON.stringify(resp));
            for (var i = 0; i < products.length; i++) {
                ids += [ products[ i ].item_id ];
            }
            showMenu();
        } else {
            throw Error(err);
        }
    });
    cxs.end();
}
function showMenu() {
    var questions = [
        { type: "list",
          name: "func",
          message: "What would you like to do?",
          choices: [ "View products", "View low inventory", "Add to inventory", "Add a new product" ]
        }
    ];
    inquirer.prompt(questions).then((answers) => {
        if (answers.func == 'View products') {
            printTable();
        } else if (answers.func == 'View low inventory') {
            printLowInv();
        } else if (answers.func == 'Add to inventory') {
            incInv();
        } else if (answers.func == 'Add a new product') {
            addNewInv();
        }
    });
}
var printTable = function () {
    for (var i = 0; i < products.length; i++) {
        console.log(clc.cyan('#' + products[ i ].item_id + ': ') + clc.green(products[ i ].department_name + ' > ') + clc.red(products[ i ].product_name));
        console.log(clc.red('> ') + clc.white('Only ' + clc.green(products[ i ].stock_qty) + ' left @ ') + clc.green(products[ i ].price));

    }
    showMenu();
};
function printLowInv() {
    console.log(clc.white(clc.underline('LOW INVENTORY ITEMS:')));
    for (var i = 0; i < products.length; i++) {
        if (products[i].stock_qty < 5) {
            console.log(clc.cyan('#' + products[ i ].item_id + ': ') + clc.green(products[ i ].department_name + ' > ') + clc.red(products[ i ].product_name));
            console.log(clc.red('> ') + clc.white('Only ' + clc.green(products[ i ].stock_qty) + ' left @ ') + clc.green(products[ i ].price));
        }
    }
    showMenu();
}
function incInv() {
    console.log(clc.white(clc.underline("Update inventory quantity:")));
    var questions = [
        { type: "input",
          name: "id",
          message: "ID of the item to update?" },
        { type: "input",
          name: "new_qty",
          message: "What to change the stock quantity to?" }
    ]
    inquirer.prompt(questions).then((answers) => {
        if (ids.indexOf(answers.id) !== -1 && answers.new_qty > 0) {
            var cxs = mysql.createConnection(sql_info);
            cxs.connect();
            var query = "UPDATE `bamazon`.`products` SET `stock_qty`='" + answers.new_qty + "' WHERE `item_id`='" + answers.id + "';";
            cxs.query(query, (err, resp, vals) => {
                if (!err) {
                    console.log('Inventory updated!');
                    getTable();
                } else {
                    throw Error(err);
                }
            });
        } else {
            console.log('Either the item id or the quantity was invalid... try again!');
            printTable();
        }
    });
}
function addNewInv() {
    var index = products.length;
    var questions = [
        { type: "input",
          name: "name",
          message: "New product's name?" },
        { type: "input",
          name: "department",
          message: "What department is it?" },
        { type: "input",
          name: "price",
          message: "What price to sell it for?" },
        { type: "input",
          name: "qty",
          message: "How many to put in inventory?" }
    ];
    inquirer.prompt(questions).then((answers) => {
        var cxs = mysql.createConnection(sql_info);
        cxs.connect();
        var query = "INSERT INTO `bamazon`.`products` (`item_id`, `product_name`, `department_name`, `stock_qty`, `price`) VALUES (?, ?, ?, ?, ?);";
        cxs.query(query, [index, answers.name, answers.department, answers.qty, answers.price], (err, resp, vals) => {
            if (!err) {
                console.log(clc.white("Item added!"));
                getTable();
            } else {
                throw Error(err);
            }
        });
        cxs.end();
    });
}
getTable();
