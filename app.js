const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const fs = require('fs');
const path = require('path');

const app = express();

// Set up body parser middleware
app.use(bodyParser.urlencoded({ extended: true }));

// Set up session middleware
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true
}));

// Set the views directory and view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'public'));
app.use(express.static(path.join(__dirname, 'public')));

// Define routes

// Route to render EJS files with header and footer
app.get('/home', (req, res) => {
    res.render('home', { pageTitle: 'Home Page' });
});
app.get('/', (req, res) => {
    res.render('home', { pageTitle: 'Home Page' });
});
 

app.get('/dogcare', (req, res) => {
    res.render('dogcare', { pageTitle: 'Dog Care' });
});

app.get('/catcare', (req, res) => {
    res.render('catcare', { pageTitle: 'Cat Care' });
});


app.get('/contactus', (req, res) => {
    res.render('contactus', { pageTitle: 'Contact Us' });
});

app.get('/privacy', (req, res) => {
    res.render('privacy', { pageTitle: 'Privacy Policy' });
});

app.get('/success', (req, res) => {
    res.render('success', { pageTitle: 'Success' });
});
app.get('/findpetresults', (req, res) => {
    res.render('findpetresults', { pageTitle: 'findpetresults' });
});

app.get('/createaccount', (req, res) => {
    const errorMessage = " "; // Example error message
    res.render('createaccount', { pageTitle: 'Create an Account', errorMessage: errorMessage });
});
// Account creation route
app.post('/createaccount', (req, res) => {
    const { username, password } = req.body;

    // Check if username and password meet format criteria...
    const usernameRegex = /^[a-zA-Z0-9]+$/;
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{4,}$/;

    if (!usernameRegex.test(username) || !passwordRegex.test(password)) {
        return res.render('createaccount', { pageTitle: 'Create an Account', errorMessage: 'Invalid username or password format. Please try again.', successMessage: null });
    }

    // Check if username already exists...
    const usersData = getUsersData();
    if (usersData[username]) {
        return res.render('createaccount', { pageTitle: 'Create an Account', errorMessage: 'Username already exists. Please choose a different one.', successMessage: null });
    }

    // Add new user to the data and write to login file...
    writeLoginFile(username, password);

    // Render success message on the same page
    res.render('createaccount', { pageTitle: 'Create an Account', successMessage: 'Account created successfully! You can now login.', errorMessage: null });
});

// Function to read users data from login file
function getUsersData() {
    const filePath = path.join(__dirname, 'users.json');
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        const lines = data.split('\n');
        const usersData = {};
        lines.forEach(line => {
            const [username, password] = line.split(':');
            usersData[username] = password;
        });
        return usersData;
    } catch (err) {
        // If file doesn't exist or is empty, return an empty object
        return {};
    }
}

// Function to write new user data to login file
function writeLoginFile(username, password) {
    const filePath = path.join(__dirname, 'users.json');
    try {
        let usersData = getUsersData();
        usersData[username] = password;
        fs.writeFileSync(filePath, JSON.stringify(usersData, null, 2)); // Indentation for better readability
    } catch (err) {
        console.error('Error writing to login file:', err);
    }
}
// Login page route (GET)
app.get('/login', (req, res) => {
    // Check if the user is already logged in
    if (req.session.username) {
        // If logged in, render the already logged in page
        return res.render('alreadyloggedin', { pageTitle: 'Already Logged In' });
    }

    // If not logged in, render the login page
    res.render('login', { pageTitle: 'Login', errorMessage: null });
});
// Login page route (POST)
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Read the users data from the JSON file
    const usersData = getUsersData();

    // Check if the provided username exists in the users data
    if (usersData[username]) {
        // Check if the provided password matches the password associated with the username
        if (usersData[username] === password) {
            // Authentication successful, store username in session
            req.session.username = username;
            // Redirect to the home page
            return res.redirect('/home');
        } else {
            // Authentication failed due to incorrect password
            return res.render('login', { pageTitle: 'Login', errorMessage: 'Invalid password. Please try again.' });
        }
    } else {
        // Authentication failed due to username not found
        return res.render('login', { pageTitle: 'Login', errorMessage: 'Invalid username. Please try again.' });
    }
});

// Function to read users data from users.json file
function getUsersData() {
    const filePath = path.join(__dirname, 'users.json');
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        // If file doesn't exist or is empty, return an empty object
        return {};
    }
}
// Logout route
app.get('/logout', (req, res) => {
    // Check if the user is logged in
    if (req.session.username) {
        res.render('logout', { pageTitle: 'Logout', loggedIn: true }); // Render the logout page
    } else {
        res.redirect('/login'); // Redirect to login page if not logged in
    }
});

app.post('/logout', (req, res) => {
    // Check if the user is logged in
    if (req.session.username) {
        // If logged in, destroy the session and render the logout page
        req.session.destroy(err => {
            if (err) {
                console.error('Error destroying session:', err);
            } else {
                res.render('logout', { pageTitle: 'Logout', loggedIn: false });
            }
        });
    } else {
        // If not logged in, render the logout page
        res.render('logout', { pageTitle: 'Logout', loggedIn: false });
    }
});

// Giveaway form page route
app.get('/giveawayapet', (req, res) => {
    // Check if the user is logged in
    if (req.session.username) {
        res.render('giveawayapet', { pageTitle: 'Giveaway A Pet', loggedIn: true }); // Render the giveawayapet page
    } else {
        res.redirect('/login'); // Redirect to login page if not logged in
    }
});

// Giveaway form submission route
app.post('/giveawayapet', (req, res) => {
    // Check if the user is logged in
    if (req.session.username) {
        const { email, petType, breed, petName, petAge, petGender, childrenFriendly, catsFriendly, dogsFriendly, description } = req.body;
        // Construct the petInfo object
        const petInfo = { email, petType, breed, petName, petAge, petGender, childrenFriendly, catsFriendly, dogsFriendly, description };
        // Append pet information to the pet information file
        writePetInfo(req.session.username, JSON.stringify(petInfo));
        // Redirect to the success page
        return res.redirect('/success');
    } else {
        // If not logged in, redirect to login page
        return res.redirect('/login');
    }
});

// Function to write pet information to the JSON file
function writePetInfo(username, petInfo) {
    const filePath = path.join(__dirname, 'petInfo.json');
    try {
        // Read existing pet information from the file, or initialize as an empty array if the file doesn't exist
        let petData = [];
        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath, 'utf8');
            petData = JSON.parse(data);
        }

        // Convert the petInfo string into a JavaScript object
        const petInfoObj = JSON.parse(petInfo);

        // Append the new pet information object to the array
        petData.push({ username, ...petInfoObj });

        // Write the updated array to the JSON file
        fs.writeFileSync(filePath, JSON.stringify(petData, null, 2));

        console.log('Pet information successfully written to file.');
    } catch (err) {
        console.error('Error writing pet information to file:', err);
    }
}
// Route to handle form submission and redirect to findpetresults.ejs
app.post('/findpetresults', (req, res) => {
    // Retrieve form data from request body
    const { petType, breed, petAge, petGender, childrenFriendly, catsFriendly, dogsFriendly } = req.body;

    // Read pet information from petInfo.json file
    const petData = getMatchingPets({ petType, breed, petAge, petGender, childrenFriendly, catsFriendly, dogsFriendly });

    // Render findpetresults.ejs and pass the matching pet data
    res.render('findpetresults', { pageTitle: 'Find Pet Results', petData });
});

// Function to filter and retrieve matching pets from petInfo.json
function getMatchingPets(filters) {
    const filePath = path.join(__dirname, 'petInfo.json');
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        const petData = JSON.parse(data);
        
        // Filter petData based on provided filters
        const matchingPets = petData.filter(pet => {
            const {petType, breed, petAge, petGender, catsFriendly, dogsFriendly } = filters;
            
            // Check if the pet matches all provided filters
            return (!breed || pet.breed.toLowerCase() === breed.toLowerCase()) &&
                   (!petAge || pet.petAge === petAge) &&
                   (!petGender || pet.petGender.toLowerCase() === petGender.toLowerCase()) &&
                   (!catsFriendly || pet.catsFriendly.toLowerCase() === catsFriendly.toLowerCase()) &&
                   (!dogsFriendly || pet.dogsFriendly.toLowerCase() === dogsFriendly.toLowerCase()) &&
                   (!petType || pet.petType.toLowerCase() === petType.toLowerCase());
        });

        return matchingPets;
    } catch (err) {
        console.error('Error reading petInfo.json file:', err);
        return [];
    }
}
// Route to render the findpet.ejs template
app.get('/findpet', (req, res) => {
    res.render('findpet', { pageTitle: 'Find a Cat/Dog' });
});


// Start the server
const PORT = 5388;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});