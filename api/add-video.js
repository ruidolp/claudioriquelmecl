import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { nombre, url } = req.body;
    
    if (!nombre || !url) {
      return res.status(400).json({ error: 'Nombre y URL son requeridos' });
    }

    const videoId = extractVideoId(url);
    
    if (!videoId) {
      return res.status(400).json({ error: 'URL de YouTube inválida' });
    }

    // Verificar si ya existe
    const { rows } = await sql`
      SELECT video_id FROM videos WHERE video_id = ${videoId}
    `;
    
    if (rows.length > 0) {
      return res.status(409).json({ error: 'Este video ya existe' });
    }

    // Insertar video
    await sql`
      INSERT INTO videos (video_id, nombre, url)
      VALUES (${videoId}, ${nombre}, ${url})
    `;
    
    return res.status(201).json({ 
      success: true,
      video: { video_id: videoId, nombre, url }
    });
    
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ 
      error: 'Error al agregar video',
      message: error.message 
    });
  }
}

function extractVideoId(url) {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[7].length === 11) ? match[7] : null;
}
