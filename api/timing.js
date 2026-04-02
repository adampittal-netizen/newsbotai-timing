export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const { timing, duration, img1, img2, img3, img4, img5, img6, templateId, creatomateKey, audioUrl } = req.body;
  
  const values = timing.split('IMAGE_TIMES: ')[1].split('|').map(Number);
  
  const fallback = 'https://images.pexels.com/photos/159888/pexels-photo-159888.jpeg';
  
  const modifications = {
    'Music.source': audioUrl,
    'Video-1.duration': Math.round(duration) + 2,
    'Image-1.source': img1 || fallback,
    'Image-1.time': values[0],
    'Image-1.duration': values[1],
    'Image-2.source': img2 || fallback,
    'Image-2.time': values[2],
    'Image-2.duration': values[3],
    'Image-3.source': img3 || fallback,
    'Image-3.time': values[4],
    'Image-3.duration': values[5],
    'Image-4.source': img4 || fallback,
    'Image-4.time': values[6],
    'Image-4.duration': values[7],
    'Image-5.source': img5 || fallback,
    'Image-5.time': values[8],
    'Image-5.duration': values[9],
    'Image-6.source': img6 || fallback,
    'Image-6.time': values[10],
    'Image-6.duration': values[11]
  };

  const response = await fetch('https://api.creatomate.com/v1/renders', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${creatomateKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ template_id: templateId, modifications })
  });

  const data = await response.json();
  res.status(200).json(data);
}
