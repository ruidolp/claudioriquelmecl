import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    // Total minutos hoy (usando fecha de Chile)
    const todayStats = await sql`
      SELECT COALESCE(SUM(seconds_watched), 0) as total_seconds
      FROM watch_sessions
      WHERE watch_date = (NOW() AT TIME ZONE 'America/Santiago')::date
    `;

    // Total minutos esta semana
    const weekStats = await sql`
      SELECT COALESCE(SUM(seconds_watched), 0) as total_seconds
      FROM watch_sessions
      WHERE watch_date >= ((NOW() AT TIME ZONE 'America/Santiago')::date - INTERVAL '7 days')
    `;

    // Total minutos este mes
    const monthStats = await sql`
      SELECT COALESCE(SUM(seconds_watched), 0) as total_seconds
      FROM watch_sessions
      WHERE watch_date >= ((NOW() AT TIME ZONE 'America/Santiago')::date - INTERVAL '30 days')
    `;

    // Videos más reproducidos (por cantidad)
    const topByCount = await sql`
      SELECT 
        video_id,
        video_nombre,
        COUNT(*) as reproducciones,
        SUM(seconds_watched) as total_seconds
      FROM watch_sessions
      GROUP BY video_id, video_nombre
      ORDER BY reproducciones DESC
      LIMIT 10
    `;

    // Videos más vistos (por tiempo)
    const topByTime = await sql`
      SELECT 
        video_id,
        video_nombre,
        SUM(seconds_watched) as total_seconds,
        COUNT(*) as reproducciones
      FROM watch_sessions
      GROUP BY video_id, video_nombre
      ORDER BY total_seconds DESC
      LIMIT 10
    `;

    // Minutos por día (últimos 30 días)
    const dailyStats = await sql`
      SELECT 
        watch_date,
        SUM(seconds_watched) as total_seconds,
        COUNT(*) as sessions
      FROM watch_sessions
      WHERE watch_date >= ((NOW() AT TIME ZONE 'America/Santiago')::date - INTERVAL '30 days')
      GROUP BY watch_date
      ORDER BY watch_date ASC
    `;

    // Sesiones de hoy con detalles
    const todaySessions = await sql`
      SELECT 
        video_id,
        video_nombre,
        started_at,
        ended_at,
        seconds_watched,
        completed
      FROM watch_sessions
      WHERE watch_date = (NOW() AT TIME ZONE 'America/Santiago')::date
      ORDER BY started_at DESC
    `;

    return res.status(200).json({
      success: true,
      stats: {
        today: {
          minutes: Math.round(todayStats.rows[0].total_seconds / 60),
          seconds: todayStats.rows[0].total_seconds
        },
        week: {
          minutes: Math.round(weekStats.rows[0].total_seconds / 60),
          seconds: weekStats.rows[0].total_seconds
        },
        month: {
          minutes: Math.round(monthStats.rows[0].total_seconds / 60),
          seconds: monthStats.rows[0].total_seconds
        },
        topByCount: topByCount.rows,
        topByTime: topByTime.rows,
        dailyStats: dailyStats.rows,
        todaySessions: todaySessions.rows
      }
    });

  } catch (error) {
    console.error('Error en get-stats:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error.message 
    });
  }
}
