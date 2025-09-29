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
    const TOKEN = '32fe5313-9a5e-4f7e-9d33-85654ad9ba4b';
    
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
              value: { videos: videos }
            }
          ]
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Error ${response.status}`);
    }

    return res.status(200).json({ success: true });
    
  } catch (error) {
    return res.status(500).json({ 
      error: 'Error al actualizar Edge Config',
      message: error.message 
    });
  }
}
