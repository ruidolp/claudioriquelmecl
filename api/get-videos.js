import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  try {
    const { rows } = await sql`
      SELECT video_id, nombre, url 
      FROM videos 
      ORDER BY created_at DESC
    `;
    
    // Transformar a formato que espera el frontend
    const videos = rows.map(row => ({
      nombre: row.nombre,
      url: row.url
    }));
    
    return res.status(200).json(videos);
    
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ 
      error: 'Error al leer videos',
      message: error.message 
    });
  }
}
