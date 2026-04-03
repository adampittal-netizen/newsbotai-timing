export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const { duration, voiceover, images, img1, img2, img3, img4, img5, img6, templateId, creatomateKey, audioUrl } = req.body;
  
  const fallback = 'https://images.pexels.com/photos/159888/pexels-photo-159888.jpeg';
  const dur = parseFloat(duration) || 40;
  const imageSubjects = (images || '').split('|').map(s => s.trim());
  const words = (voiceover || '').toLowerCase().split(/\s+/);
  const totalWords = words.length;
  
  function findWordTime(subject) {
    if (!subject || !voiceover) return null;
    const subjectWords = subject.toLowerCase().split(/\s+/);
    const firstWord = subjectWords[0];
    for (let i = 0; i < words.length; i++) {
      if (words[i].includes(firstWord) || firstWord.includes(words[i])) {
        return Math.round((i / totalWords) * dur);
      }
    }
    return null;
  }
  
  const imgSources = [img1, img2, img3, img4, img5, img6];
  const imageMods = {};
  
  let lastTime = 0;
  for (let i = 0; i < 6; i++) {
    const subject = imageSubjects[i] || '';
    let time = findWordTime(subject);
    if (time === null || time < lastTime) time = lastTime;
    if (time > dur - 5) time = Math.max(0, dur - 5 - (5 - i) * 5);
    const duration_val = i < 5 ? Math.min(8, Math.round(dur / 6)) : Math.max(3, dur - time - 1);
    imageMods[`Image-${i+1}.source`] = imgSources[i] || fallback;
    imageMods[`Image-${i+1}.time`] = time;
    imageMods[`Image-${i+1}.duration`] = duration_val;
    lastTime = time + 2;
  }

  const modifications = {
    'Music.source': audioUrl,
    'Video-1.duration': Math.round(dur) + 2,
    ...imageMods
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
