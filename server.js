const express = require('express');
const { Pool } = require('pg');
const app = express();

app.use(express.json());

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

app.get('/', (req, res) => {
    res.send('Halo dari Location Server!');
});

app.post('/location', async (req, res) => {
    const { latitude, longitude, timestamp } = req.body;
    if (!latitude || !longitude || !timestamp) {
        return res.status(400).json({ error: 'Data lokasi tidak lengkap' });
    }
    try {
        const query = `
            INSERT INTO locations (latitude, longitude, timestamp, received_at)
            VALUES ($1, $2, $3, NOW())
            RETURNING *;
        `;
        const values = [latitude, longitude, timestamp];
        const result = await pool.query(query, values);
        const newLocation = result.rows[0];
        res.status(200).json({ message: 'Lokasi diterima', data: newLocation });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Gagal menyimpan lokasi' });
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server berjalan di port ${port}`);
});