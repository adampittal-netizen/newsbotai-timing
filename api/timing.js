export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const { duration, images, img1, img2, img3, img4, img5, img6, audioUrl } = req.body;
  
  const fallback = 'https://images.pexels.com/photos/159888/pexels-photo-159888.jpeg';
  const dur = parseFloat(duration) || 40;
  const imageSubjects = (images || '').split('|').map(s => s.trim());
  const imgSources = [img1, img2, img3, img4, img5, img6];
  
  const segment = dur / 6;
  const imageMods = {};
  
  for (let i = 0; i < 6; i++) {
    const time = Math.round(i * segment);
    const duration_val = Math.round(segment) - 1;
    imageMods[`Image-${i+1}.source`] = imgSources[i] || fallback;
    imageMods[`Image-${i+1}.time`] = time;
    imageMods[`Image-${i+1}.duration`] = duration_val;
  }

  const modifications = {
    'Music.source': audioUrl,
    'Video-1.duration': Math.round(dur) + 2,
    ...imageMods
  };

  res.status(200).json({ modifications });
}
