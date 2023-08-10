const express = require('express'); 
const router = express.Router();
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');


const userFilePath = "./data/users.json";
const sessionsPath = "./data/sessions.json";

// for seperation of concerns, crud action on user would be here. 

const fetchCustomers = () => {
    return JSON.parse(fs.readFileSync(userFilePath));
}

const saveCustomers = (customerData) => {
    fs.writeFileSync(userFilePath, JSON.stringify(customerData));
}

const getSessionsList = () => {
    return JSON.parse(fs.readFileSync(sessionsPath));
}

const saveSession = (sessionData) => {
    fs.writeFileSync(sessionsPath, JSON.stringify(sessionData));
}
//validating the customer's registration
const validateCustomer = (req, res, next) => {
    if (!req.body.email.trim() || !req.body.username.trim() || !req.body.password.trim()) {
        return res.status(400).json({ error: "Please fill in a valid email, username and password." })
    } else {
        next();
    }
}
//register as a customer.
router
    .route("/register")
    .post(validateCustomer, (req, res) => {
    const customerEmail = req.body.email.trim(); 
    const customersList = fetchCustomers();
    //find if the customer exists
    const existingCustomer = customersList.find(customer => customer.email === customerEmail);
     
    if (existingCustomer) {
     return res.status(400).json({error:"Customer already exists."})
    }

    const customerUsername = req.body.username.trim();
    const existingCustomerUsername = customersList.find(customer => customer.username === customerUsername); 

    if (existingCustomerUsername) {
        return res.status(400).json({ error: "Username already exists." });
    } 

    //create customer data with a unique id
    const customer = {
        id: uuidv4(),
        ...req.body
    }
    //update the list of customer data.
    customersList.push(customer)
    saveCustomers(customersList);
    res.status(201).json(customer);
})
    
//Login logic


const validateLogin = (req, res, next) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(401).json({error:"Invalid login credentials"})
    }

    const customerList = fetchCustomers();
    const theCustomer = customerList.find(customer => customer.username === username && customer.password === password);

    if (!theCustomer) {
        return res.status(401).json({ error: "Invalid login credientials" });
    } else {
        next();
    }
}

// Check if there's a session not terminated by user. 
const isUserSessionRunning = (id) => {
    const sessionList = getSessionsList();
    const session = sessionList.find(item => item.customer === id);
    return !!session; 
}

router
    .route("/login")
    .post(validateLogin, (req, res) => {
        // fetch customer with username 
        const username = req.body.username;
        const customerList = fetchCustomers();
        const customer = customerList.find(customer => customer.username === username);

        //fetch the session
        const customerSession = isUserSessionRunning(customer.id);

        if (!customerSession) {
            const session = {
                id: uuidv4(),
                customer: customer.id
            }
            const sessionList = getSessionsList();
            sessionList.push(session);
            saveSession(sessionList);
        }

        res.status(200).json({ message: "Login successful!"});
    });

//The session would be used determine if the customer is logged in to confirm that the information is being retrieved by the customer. 
router
    .route("/:userid")
    .get((req, res) => {
        const customerid = req.params.userid;
        const customerList = fetchCustomers();
        const customer = customerList.find(customer => customer.id === customerid);

        if (!customer) {
            res.status(400).json({error:"Invalid request."})
        }

        const isLoggedIn = isUserSessionRunning(customerid);

        if (!isLoggedIn) {
            res.status(400).status({error:"invalid request"})
        }

        res.status(200).json(customer);
    })
    .put((req, res) => {

        if (!req.body.email || !req.body.username || !req.body.password) {
            res.status(400).json({ error: "Invalid request" });
        }
        //confirm that the customer exists
        const customerid = req.params.userid;
        const customerList = fetchCustomers();
        const customer = customerList.find(customer => customer.id === customerid);
        if (!customer) {
            res.status(400).json({error:"Invalid Request."})
        }

        const newCustomerList = customerList.filter(customer => customer.id !== customerid);

        const newCustomer = {
            ...customer, 
            email: req.body.email,
            username: req.body.username,
            password:req.body.password
        }

        newCustomerList.push(newCustomer);
        saveCustomers(newCustomerList);

        res.status(200).json(newCustomer); 
    })
    .delete((req, res) => {
        const customerList = fetchCustomers();
        const deletedCustomer = customerList.find(customer => customer.id === req.params.userid);
        
        if (!deletedCustomer) {
            res.status(400).json({ error: "Invalid customer id" });
        }   
        
        const newData = customerList.filter(customer => customer.id !== deletedCustomer.id);
        const hasSession = isUserSessionRunning(deletedCustomer.id); 

        if (hasSession) {
            const sessionsList = getSessionsList();
            const newSessionsList = sessionsList.filter(session => session.customer !== deletedCustomer.id);
            saveSession(newSessionsList);
        }

        saveCustomers(newData);
        res.status(204).json({ message: "Customer has been deleted" })
    })



module.exports = router;