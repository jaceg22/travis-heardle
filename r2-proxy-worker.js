// Cloudflare Worker to proxy R2 bucket files
// Deploy this as a Worker in Cloudflare Dashboard

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // Extract bucket and file path from URL
    // Format: https://your-worker.your-subdomain.workers.dev/{bucket}/{filename}
    const pathParts = url.pathname.split('/').filter(p => p);
    
    if (pathParts.length < 2) {
      return new Response('Invalid path. Use /{bucket}/{filename}', { status: 400 });
    }
    
    const bucketName = pathParts[0];
    const fileName = pathParts.slice(1).join('/');
    
    // Map bucket names to R2 bucket bindings
    // You'll need to bind these in your Worker settings
    let bucket;
    switch(bucketName) {
      case 'songs':
        bucket = env.SONGS_BUCKET;
        break;
      case 'drake':
        bucket = env.DRAKE_BUCKET;
        break;
      case 'lil-tecca':
        bucket = env.LILTECCA_BUCKET;
        break;
      case 'bbbm':
        bucket = env.BBBM_BUCKET;
        break;
      case 'album':
        bucket = env.ALBUM_BUCKET;
        break;
      default:
        return new Response('Bucket not found', { status: 404 });
    }
    
    if (!bucket) {
      return new Response('Bucket not configured', { status: 500 });
    }
    
    try {
      // Get object from R2
      const object = await bucket.get(fileName);
      
      if (!object) {
        return new Response('File not found', { status: 404 });
      }
      
      // Set appropriate headers
      const headers = new Headers();
      headers.set('Content-Type', object.httpMetadata?.contentType || 'application/octet-stream');
      headers.set('Cache-Control', 'public, max-age=31536000');
      
      // Handle CORS
      headers.set('Access-Control-Allow-Origin', '*');
      headers.set('Access-Control-Allow-Methods', 'GET, HEAD');
      headers.set('Access-Control-Allow-Headers', '*');
      
      return new Response(object.body, {
        headers,
        status: 200
      });
    } catch (error) {
      return new Response(`Error: ${error.message}`, { status: 500 });
    }
  }
};

