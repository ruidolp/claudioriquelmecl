import { get } from '@vercel/edge-config';

export default async function handler(req) {
  try {
    const data = await get('videos');
    
    if (!data) {
      return new Response(
        JSON.stringify({ videos: [] }),
        { 
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    return new Response(
      JSON.stringify(data),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
    
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        error: 'Error al leer Edge Config',
        message: error.message 
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

export const config = {
  runtime: 'edge',
};
