/**
 * Fetch and log a request
 * @param {Request} request
 */
async function handleRequest(request) {
  // Parse request URL to get access to query string
  const url = new URL(request.url);

  // Cloudflare-specific options are in the cf object.
  const options = { cf: { image: {} } };

  // Copy parameters from query string to request options.
  // You can implement various different parameters here.
  if (url.searchParams.has('w'))
    options.cf.image.width = url.searchParams.get('w');
  if (url.searchParams.has('h'))
    options.cf.image.height = url.searchParams.get('h');
  if (url.searchParams.has('f'))
    options.cf.image.format = url.searchParams.get('f');
  if (url.searchParams.has('q'))
    options.cf.image.quality = url.searchParams.get('q');
  if (url.searchParams.has('bg'))
    options.cf.image.background = url.searchParams.get('bg');
  if (url.searchParams.has('dpr'))
    options.cf.image.dpr = url.searchParams.get('dpr');
  if (url.searchParams.has('fit'))
    options.cf.image.fit = url.searchParams.get('fit');
  if (url.searchParams.has('rotate'))
    options.cf.image.rotate = url.searchParams.get('rotate');
  if (url.searchParams.has('sharpen'))
    options.cf.image.sharpen = url.searchParams.get('sharpen');
  if (url.searchParams.has('gravity'))
    options.cf.image.gravity = url.searchParams.get('gravity');
  if (url.searchParams.has('metadata'))
    options.cf.image.metadata = url.searchParams.get('metadata');

  // Get URL of the original (full size) image to resize.
  // You could adjust the URL here, e.g. prefix it with a fixed address of your server,
  // so that user-visible URLs are shorter and cleaner.
  const path = url.pathname;
  const imageURL = ORIGIN + path.replace(BASEPATH, '');

  // Build a request that passes through request headers,
  // so that automatic format negotiation can work.
  const imageRequest = new Request(imageURL, {
    headers: request.headers,
  });

  // Returning fetch() with resizing options will pass through response with the resized image.
  const response = await fetch(imageRequest, options);

  // Reconstruct the Response object to make its headers mutable.
  response = new Response(response.body, response);

  if (response.ok || response.status == 304) {
    // Set cache for 1 year
    response.headers.set(
      'Cache-Control',
      'public, max-age=31536000, immutable',
    );

    // Set Vary header
    response.headers.set('Vary', 'Accept');

    return response;
  } else {
    return new Response(
      `Could not fetch the image — the server returned HTTP error ${response.status}`,
      {
        status: 400,
        headers: {
          'Cache-Control': 'no-cache',
        },
      },
    );
  }
}

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});
