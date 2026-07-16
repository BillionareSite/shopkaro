export async function GET() {
  const body = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /admin-login
Disallow: /staff-login
Disallow: /staff-panel
Disallow: /api/

Sitemap: https://www.dropez.in/sitemap.xml`

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain' }
  })
}