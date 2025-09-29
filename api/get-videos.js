import { get } from '@vercel/edge-config';

export default async function handler(req, res) {
  try {
    const data = await get('videos');
    
    if (!data) {
      return res.status(200).json({ videos: [] });
    }
    
    return res.status(200).json(data);
    
  } catch (error) {
    return res.status(500).json({ 
      error: 'Error al leer Edge Config',
      message: error.message 
    });
  }
}

export const config = {
  runtime: 'edge',
};
