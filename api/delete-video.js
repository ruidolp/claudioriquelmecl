import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { videoId } = req.query;
    
    if (!videoId) {
      return res.status(400).json({ error: 'videoId es requerido' });
    }

    // Borrar el video
    const result = await sql`
      DELETE FROM videos WHERE video_id = ${videoId}
    `;
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Video no encontrado' });
    }
    
    return res.status(200).json({ 
      success: true,
      message: 'Video eliminado correctamente'
    });
    
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ 
      error: 'Error al eliminar video',
      message: error.message 
    });
  }
}
