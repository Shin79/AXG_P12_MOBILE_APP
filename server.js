var express = require('express');
var bodyParser = require('body-parser');
var pg = require('pg');
var app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
const dotenv = require('dotenv');
dotenv.config();
const uri = "postgres://gwbgsvnchhmloy:5fe63c0466c47df31d971056a3b30a240afb1c7812becfc919cbca208c4c6ef3@ec2-52-214-178-113.eu-west-1.compute.amazonaws.com:5432/d3bp6gumtmf0bi"

app.set('port', process.env.PORT || 3000);

app.use(express.static('public'));
app.use(bodyParser.json());
console.log("Database_URL",process.env.DATABASE_URL);
app.post('/update', function(req, res) {
    pg.connect(process.env.DATABASE_URL || uri, async function (err, conn, done) {
        
        // watch for any connect issues
        if (err) console.log(err);
        conn.query(
            'UPDATE salesforce.Contact SET Phone = $1, HomePhone = $1, MobilePhone = $1 WHERE LOWER(FirstName) = LOWER($2) AND LOWER(LastName) = LOWER($3) AND LOWER(Email) = LOWER($4)',
            [req.body.phone.trim(), req.body.firstName.trim(), req.body.lastName.trim(), req.body.email.trim()],
            function(err, result) {
                if (err != null || result.rowCount == 0) {
                  conn.query('INSERT INTO salesforce.Contact (Phone, MobilePhone, FirstName, LastName, Email) VALUES ($1, $2, $3, $4, $5)',
                  [req.body.phone.trim(), req.body.phone.trim(), req.body.firstName.trim(), req.body.lastName.trim(), req.body.email.trim()],
                  function(err, result) {
                    done();
                    if (err) {
                        res.status(400).json({error: err.message});
                    }
                    else {
                        // this will still cause jquery to display 'Record updated!'
                        // eventhough it was inserted
                        res.json(result);
                    }
                  });
                }
                else {
                    done();
                    res.json(result);
                }
            }
        );
    });
});

app.get('/getContracts', function(req, res) {
    pg.connect(process.env.DATABASE_URL, function (err, conn, done) {
        // watch for any connect issues
        if (err) {
            console.log(err);
            return;
        }
        conn.query('SELECT Name, Product_Name__c FROM salesforce.Contract WHERE Product__c IS NOT NULL',
        function(err, result) {
            console.log(result)
            if (err) {
                res.status(400).json({error: err.message});
                return res.end();
            }
            else {
                // Need to display 'Success!'
                res.json(result);
                return res.end();
            }
        });
        
    });
});

app.get('/getProducts', function(req, res) {
        pg.connect(process.env.DATABASE_URL, function (err, conn, done) {

        // watch for any connect issues
        if (err) {
            console.log(err);
            return;
        }

        conn.query('SELECT Name FROM salesforce.Product2 WHERE Name LIKE \'%Insurance%\' ',
        function(err, result) {
            console.log(result)
            if (err) {
                res.status(400).json({error: err.message});
            }
            else {
                // Need to display 'Success!'
                res.json(result);
            }
        });
        
    });
});

const server = app.listen(process.env.PORT || 3000, () => {
    const port = server.address().port;
    console.log(`Express server listening on port ${port}` );
});