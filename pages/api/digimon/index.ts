import { openDB } from '../../../src/openDB';

export default async function handler(req, res) {
  const db = await openDB();
  let query = 'select * from digimons WHERE (1)'
  let params = []

  if(req.query.name){
    query += ' AND name LIKE ?'
    const pattern = '%' + req.query.name + '%'
    params.push(pattern)
  }

  if (req.query.limit && req.query.limit < 100) {
    query += ' LIMIT ' + req.query.limit
  } else {
    query += ' LIMIT 100'
  }

  try {
    const data = await db.all(query, params);
    res.status(200).json({ results: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
  
}  