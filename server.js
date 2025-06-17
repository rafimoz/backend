const express = require('express');
const { google } = require('googleapis');
const path = require('path');
const app = express();
const port = 5000; // Choose a port for your backend

// Middleware to allow CORS for frontend
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'https://vlogs-by-rafi.web.app'); // Replace with your frontend URL
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

// Replace with your Google Spreadsheet ID
const SPREADSHEET_ID = '1N2l1LpbM2RV4CfUIe22kT_4fACSOJsocItBJywyb5Xo'; // IMPORTANT: Update this with your actual Spreadsheet ID

// Path to your service account credentials file
const CREDENTIALS_PATH = path.join(__dirname, 'credentials.json');

async function getGoogleSheetClient() {
    try {
        const auth = new google.auth.GoogleAuth({
            keyFile: CREDENTIALS_PATH,
            scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'], // Read-only access
        });
        const authClient = await auth.getClient();
        return google.sheets({ version: 'v4', auth: authClient });
    } catch (error) {
        console.error('Authentication Error with Google Sheets API:', error.message);
        console.error('Detailed Authentication Error:', error); // Log full error object for more details
        throw new Error('Failed to authenticate with Google Sheets API. Check credentials.json and API permissions.');
    }
}

// Endpoint to fetch About Us data
app.get('/api/about', async (req, res) => {
    try {
        const sheets = await getGoogleSheetClient();
        // Updated range to read headers from A1 and data from A2 onwards
        const range = 'About!A1:Z'; // Fetching from A1 to be flexible with columns
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: range,
        });

        const rows = response.data.values;
        if (rows && rows.length > 1) { // Expect at least a header row and one data row
            const headers = rows[0].map(header => header.toLowerCase().replace(/\s/g, ''));
            const aboutData = {};
            // Assuming the actual data is in the second row (index 1)
            const dataRow = rows[1];
            
            headers.forEach((header, index) => {
                if (dataRow && dataRow[index] !== undefined) { // Ensure data exists for the column
                    aboutData[header] = dataRow[index];
                }
            });
            res.json(aboutData);
        } else {
            res.status(404).json({ message: 'No data found for About Us. Check sheet name, headers (description, profileImage in row 1) and data in row 2.' });
        }
    } catch (error) {
        console.error('Error fetching About Us data:', error.message);
        console.error('Detailed Fetch Error (About Us):', error); // Log full error object
        res.status(500).json({ message: 'Error fetching About Us data. Check Spreadsheet ID, sheet name, and permissions.' });
    }
});

// Endpoint to fetch Experience data
app.get('/api/experience', async (req, res) => {
    try {
        const sheets = await getGoogleSheetClient();
        const range = 'Experience!A1:Z'; // Assuming header is in A1
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: range,
        });

        const rows = response.data.values;
        if (rows && rows.length > 1) { // Check for header row and at least one data row
            const headers = rows[0].map(header => header.toLowerCase().replace(/\s/g, ''));
            const experienceData = rows.slice(1).map(row => {
                const item = {};
                headers.forEach((header, index) => {
                    item[header] = row[index];
                });
                return item;
            });
            res.json(experienceData);
        } else {
            res.status(404).json({ message: 'No data found for Experience. Check sheet name and range.' });
        }
    } catch (error) {
        console.error('Error fetching Experience data:', error.message);
        console.error('Detailed Fetch Error (Experience):', error); // Log full error object
        res.status(500).json({ message: 'Error fetching Experience data. Check Spreadsheet ID, sheet name, and permissions.' });
    }
});

// Endpoint to fetch Portfolio data
app.get('/api/portfolio', async (req, res) => {
    try {
        const sheets = await getGoogleSheetClient();
        const range = 'Portfolio!A1:D'; // Assuming header is in A1
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: range,
        });

        const rows = response.data.values;
        if (rows && rows.length > 1) { // Check for header row and at least one data row
            const headers = rows[0].map(header => header.toLowerCase().replace(/\s/g, ''));
            const portfolioData = rows.slice(1).map(row => {
                const item = {};
                headers.forEach((header, index) => {
                    item[header] = row[index];
                });
                return item;
            });
            res.json(portfolioData);
        } else {
            res.status(404).json({ message: 'No data found for Portfolio. Check sheet name and range.' });
        }
    } catch (error) {
        console.error('Error fetching Portfolio data:', error.message);
        console.error('Detailed Fetch Error (Portfolio):', error); // Log full error object
        res.status(500).json({ message: 'Error fetching Portfolio data. Check Spreadsheet ID, sheet name, and permissions.' });
    }
});

app.listen(port, () => {
    console.log(`Backend server listening at http://localhost:${port}`);
});