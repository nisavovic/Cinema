let express = require('express');
let cors = require('cors')
const app = express();
app.use(express.static('public')); // host public folder
app.use(cors()); // allow all origins -> Access-Control-Allow-Origin: *

const client = require('./dbConnection.js');

const session = require('express-session');
//dbConnection must be changed to use pg-gsessions
//const pgSession = require('connect-pg-simple')(session);

let bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies

const checkAuth = require('./check_auth');


// app.use(session({
//     store: new pgSession({
//         client: client,
//         tableName: 'sessions',
//         createTableIfMissing: true
//     }),
//     secret: "secret",
//     resave: false,
//     saveUninitialized: false,
//     cookie: {
//         maxAge: 1000 * 60 * 60, // 1 hour
//         //sameSite: true
//     }
// }));

// the express router inherits the properties of the application
// including the session, so this has to be defined after the session is added to the app object
const loginRoutes = require('./login');
app.use("/login", loginRoutes);

// get gallery for logged in user as a list of JSON entries
// app.get("/", (req, res) => {
//     res.setHeader('Content-Type', 'text/html');
//     res.status(200).send("EX3: This is a simple database-backed application");
// });

//app.get("/customers", checkAuth, (req, res) => {
app.get("/customers", (req, res) => {

    const query = {
        text: `SELECT * from customer`
    }

    // issue query (returns promise)
    client.query(query).then(results => {
            resultRows = results.rows;

            // no results
            if (resultRows.length < 1) {
                res.status(401).json({
                    "message": "no results"
                });
                return;
            }

            // everything ok -- return results
            //let response = { imageIds: resultRows.map(item => item.id) }; // only return the ids
            res.status(200).json(resultRows);

        })
        .catch(error => {
            // error accessing db
            if (error) {
                res.status(400).json({
                    "message": "error occurred"
                });
                console.log(error.stack);
                return;
            }
        });
});

app.post("/register", (request, res) => {

    console.log(request.body);
    let firstname = request.body[0][1];
    let lastname = request.body[1][1];
    let email = request.body[2][1];
    let phone_number = request.body[3][1];
    let customer_password = request.body[4][1];

    const query = {
            text: `SELECT * FROM customer WHERE email=$1`,
            values: [email]
        }
        // issue query (returns promise)
    client.query(query).then(results => {
            resultRows = results.rows;

            // no results - good
            if (resultRows.length < 1) {
                const insertNewUser = `INSERT INTO customer(id,firstname,lastname,email,phone_number,customer_password,user_id) VALUES(${0},'${firstname}','${lastname}','${email}','${phone_number}','${customer_password}',${0})`;
                console.log(insertNewUser);
                res.status(200).json({
                    "message": "OK"
                });
                return;
            }

            // everything ok -- return results
            //let response = { imageIds: resultRows.map(item => item.id) }; // only return the ids
            res.status(400).json({
                "message": "email already exists"
            });

        })
        .catch(error => {
            // error accessing db
            if (error) {
                res.status(400).json({
                    "message": "error occurred"
                });
                console.log(error.stack);
                return;
            }
        });
});

//inserting customer for testing db connection
app.post('/customers/newCustomer', (req, res) => {
    const user = req.body;
    const insertNewUser = `INSERT INTO customer(id,firstname,lastname,email,phone_number,customer_password,user_id) VALUES(${user.id},'${user.firstname}','${user.lastname}','${user.email}','${user.phone_number}','${user.customer_password}',${user.user_id})`;


    client.query(insertNewUser, (err) => {
        if (err) {
            res.status(500).send(err.message)
        } else {
            res.status(200).send('Customer inserted successfully!')
        }
    })
    client.end;
})





let port = 3000;
app.listen(port);
console.log("Server running at: http://localhost:" + port);