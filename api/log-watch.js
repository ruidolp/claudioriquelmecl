import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { action, videoId, videoName, sessionId, seconds, completed } = req.body;

    if (action === 'start') {
      // Iniciar nueva sesión
      const { rows } = await sql`
        INSERT INTO watch_sessions (video_id, video_nombre, started_at, watch_date)
        VALUES (${videoId}, ${videoName}, NOW(), CURRENT_DATE)
        RETURNING id
      `;

      return res.status(200).json({ 
        success: true, 
        sessionId: rows[0].id 
      });

    } else if (action === 'end') {
      // Finalizar sesión existente
      await sql`
        UPDATE watch_sessions
        SET ended_at = NOW(),
            seconds_watched = ${seconds || 0},
            completed = ${completed || false}
        WHERE id = ${sessionId}
      `;

      return res.status(200).json({ 
        success: true,
        message: 'Sesión actualizada'
      });

    } else {
      return res.status(400).json({ error: 'Action inválido' });
    }

  } catch (error) {
    console.error('Error en log-watch:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error.message 
    });
  }
}
