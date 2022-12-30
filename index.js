require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const fs = require("fs");
//mailchimp API
const client = require("@mailchimp/mailchimp_marketing");

const app = express();
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", function (req, res) {
    res.sendFile(__dirname + "/index.html");
})

app.post("/", function (req, res) {

    var firstName = req.body.fname;
    var lastName = req.body.lname;
    var email = req.body.email;
    var data = {
        members: [
            {
                email_address: email,
                status: "subscribed",
                merge_fields: {
                    FNAME: firstName,
                    LNAME: lastName,
                }

            }
        ]
    };
    var jsonData = JSON.stringify(data);

    // ---- to write in a txt file ---- 
    // fs.writeFile("data.txt", jsonData, function(){
    //     console.log("data saved successfully");
    // });

    // ---- store in a list using mail chimp api ----
    client.setConfig({
        apiKey: process.env.API_KEY,
        server: process.env.MAILCHIMP_SERVER,
    });

    const listID = process.env.LIST_ID
    const run = async () => {
        const response = await client.lists.batchListMembers(listID, jsonData);
        if (response.errors.length !== 0) {
            const error_msg = "Error Code" + " : " + response.errors[0].error_code + " - " + response.errors[0].error + "For testing, Try using '@gmail' instead of a fake domain"
            res.send(error_msg)
        } else {
            res.redirect("/success.html");

        }
    };
    run();
})

app.get("/success", function (req, res) {
    res.sendFile(__dirname + "/success.html");
})

app.get("/error", function (req, res) {
    res.sendFile(__dirname + "/error.html");
})

module.exports = app;

const PORT = process.env.PORT || 3000

app.listen(PORT, () => console.log(`Server started at port : ${PORT}`));
