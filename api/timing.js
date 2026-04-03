export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const { duration, charTimes, charText, voiceover, images, img1, img2, img3, img4, img5, img6, templateId, creatomateKey, audioUrl } = req.body;
  
  const fallback = 'https://images.pexels.com/photos/159888/pexels-photo-159888.jpeg';
  const dur = parseFloat(duration) || 40;
  const imageSubjects = (images || '').split('|').map(s => s.trim());
  const imgSources = [img1, img2, img3, img4, img5, img6];
  
  const times = (charTimes || '').split('|').map(Number);
  const chars = charText || voiceover || '';
  
  function findSubjectTime(subject) {
    if (!subject || !chars || times.length === 0) return null;
    const needle = subject.toLowerCase().split(/\s+/)[0];
    const haystack = chars.toLowerCase();
    const idx = haystack.indexOf(needle);
    if (idx === -1) return null;
    return times[Math.min(idx, times.length - 1)];
  }
  
  const imageMods = {};
  let lastTime = 0;
  
  for (let i = 0; i < 6; i++) {
    const subject = imageSubjects[i] || '';
    let time = findSubjectTime(subject);
    if (time === null || time < lastTime) time = lastTime;
    if (time > dur - 4) time = Math.max(0, dur - 4 - (5 - i) * 4);
    const nextSubjectTime = i < 5 ? (findSubjectTime(imageSubjects[i+1]) || time + 8) : dur;
    const duration_val = Math.min(8, Math.max(3, Math.round(nextSubjectTime - time)));
    imageMods[`Image-${i+1}.source`] = imgSources[i] || fallback;
    imageMods[`Image-${i+1}.time`] = Math.round(time);
    imageMods[`Image-${i+1}.duration`] = duration_val;
    lastTime = Math.round(time) + 2;
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
