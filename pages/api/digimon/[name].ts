import { openDB } from '../../../src/openDB';

export default async function handler(req, res) {
  const db = await openDB();
  const name = req.query.name ?? ''

  try {
    const data = await db.all('select * from digimons WHERE name LIKE ?', [name]);
    res.status(200).json({ results: data });
  } catch (error) {
     res.status(500).json({ error: error.message });
  }
}