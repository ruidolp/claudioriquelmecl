export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { videos } = req.body;
    
    if (!videos || !Array.isArray(videos)) {
      return res.status(400).json({ error: 'Videos debe ser un array' });
    }

    const EDGE_CONFIG_ID = 'ecfg_lbbhs630xxkrlqefuteszrmtso5m';
    const TOKEN = 'Nmgmlzbwaj85DHnKnJPa3whZ';
    
    const response = await fetch(
      `https://api.vercel.com/v1/edge-config/${EDGE_CONFIG_ID}/items`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          items: [
            {
              operation: 'upsert',
              key: 'videos',
              value: videos
            }
          ]
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Vercel API error: ${response.status} - ${errorText}`);
    }

    return res.status(200).json({ success: true });
    
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ 
      error: 'Error al actualizar',
      message: error.message 
    });
  }
}
