const express = require('express');
const path = require('path');
const app = express();

// Serve React app
app.use(express.static(path.join(__dirname, '../frontend/build')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
<<<<<<< HEAD
=======

const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/mydatabase', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('MongoDB connected!');
}).catch((err) => {
    console.error('MongoDB connection error:', err);
});
>>>>>>> ca2ca84 (-MERN convert (step2, file mgmt and backend/frontend merge into repo for deployment))
