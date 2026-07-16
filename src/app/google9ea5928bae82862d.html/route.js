export async function GET() {
  return new Response('google-site-verification: google9ea5928bae82862d.html', {
    headers: { 'Content-Type': 'text/html' }
  })
}