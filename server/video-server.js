const express = require('express');
const cors = require('cors');
const play = require('play-dl');
const youtubedl = require('youtube-dl-exec');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: '*' }));
app.use(express.json());

// 1. Health check
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    service: 'Miftah Tools High-Speed Media Downloader API',
    version: '3.0.0 (play-dl + yt-dlp dual engine)',
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// 2. Video Info Resolver (Fast & Rate-limit immune)
app.post('/api/video/info', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL is required' });

  try {
    // A. YouTube via play-dl
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const info = await play.video_info(url);
      const details = info.video_details;
      const title = details.title || 'YouTube Video';
      const author = details.channel?.name || 'YouTube Creator';
      const thumbnailUrl = details.thumbnails[details.thumbnails.length - 1]?.url || details.thumbnails[0]?.url;
      const durationSeconds = details.durationInSec || 0;
      const duration = `${Math.floor(durationSeconds / 60)}:${(durationSeconds % 60).toString().padStart(2, '0')}`;

      return res.json({
        platform: 'youtube',
        platformName: 'YouTube',
        title,
        author,
        thumbnailUrl,
        duration,
        formats: [
          {
            id: 'video-1080p',
            label: 'Full HD 1080p MP4',
            quality: '1080p',
            resolution: '1920x1080',
            extension: 'mp4',
            type: 'video',
            sizeEstimate: '~28 MB',
          },
          {
            id: 'video-720p',
            label: 'HD 720p MP4',
            quality: '720p',
            resolution: '1280x720',
            extension: 'mp4',
            type: 'video',
            sizeEstimate: '~14 MB',
          },
          {
            id: 'video-480p',
            label: 'SD 480p MP4',
            quality: '480p',
            resolution: '854x480',
            extension: 'mp4',
            type: 'video',
            sizeEstimate: '~7 MB',
          },
          {
            id: 'audio-320k',
            label: 'HQ Audio MP3 (320 kbps)',
            quality: '320kbps',
            resolution: 'Studio Audio',
            extension: 'mp3',
            type: 'audio',
            sizeEstimate: '~4.5 MB',
          },
        ],
      });
    }

    // B. TikTok Live Handler
    if (url.includes('tiktok.com')) {
      const tikRes = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`);
      const tikData = await tikRes.json();
      if (tikData.code === 0 && tikData.data) {
        return res.json({
          platform: 'tiktok',
          platformName: 'TikTok',
          title: tikData.data.title || 'TikTok Video (No Watermark)',
          author: tikData.data.author?.nickname || 'TikTok Creator',
          thumbnailUrl: tikData.data.cover,
          duration: `${tikData.data.duration || 15}s`,
          formats: [
            {
              id: 'video-hd',
              label: 'HD Video MP4 (No Watermark)',
              quality: 'HD',
              resolution: 'Original HD',
              extension: 'mp4',
              type: 'video',
              sizeEstimate: '~12 MB',
            },
            {
              id: 'audio-mp3',
              label: 'Original Audio MP3',
              quality: '320kbps',
              resolution: 'Audio',
              extension: 'mp3',
              type: 'audio',
              sizeEstimate: '~3 MB',
            },
          ],
        });
      }
    }

    // C. Generic Fallback via yt-dlp dump
    const meta = await youtubedl(url, { dumpSingleJson: true, noWarnings: true });
    return res.json({
      platform: 'social',
      platformName: meta.extractor_key || 'Social Video',
      title: meta.title || 'Social Media Video',
      author: meta.uploader || 'Creator',
      thumbnailUrl: meta.thumbnail || 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800',
      duration: `${meta.duration || 30}s`,
      formats: [
        {
          id: 'video-hd',
          label: 'Original HD Video MP4',
          quality: 'HD',
          resolution: '1080p',
          extension: 'mp4',
          type: 'video',
          sizeEstimate: '~18 MB',
        },
      ],
    });
  } catch (err) {
    console.error('Info Error:', err);
    return res.status(500).json({ error: 'Failed to extract video info: ' + err.message });
  }
});

// 3. Direct Binary Video/Audio Stream Downloader (Pipes raw bytes)
app.get('/api/video/download', async (req, res) => {
  const { url, quality = '720p', type = 'video' } = req.query;
  if (!url) return res.status(400).send('Video URL is required');

  try {
    // A. TikTok direct binary stream
    if (url.includes('tiktok.com')) {
      const tikRes = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`);
      const tikData = await tikRes.json();
      const playUrl = tikData?.data?.play || tikData?.data?.wmplay;
      if (playUrl) {
        const vidStream = await fetch(playUrl);
        res.setHeader('Content-Disposition', 'attachment; filename="tiktok_video_no_watermark.mp4"');
        res.setHeader('Content-Type', 'video/mp4');
        const buffer = Buffer.from(await vidStream.arrayBuffer());
        return res.send(buffer);
      }
    }

    // B. YouTube / Social Media direct stream piping via yt-dlp
    const cleanFileName = `nexora_media_${Date.now()}.${type === 'audio' ? 'mp3' : 'mp4'}`;
    res.setHeader('Content-Disposition', `attachment; filename="${cleanFileName}"`);
    res.setHeader('Content-Type', type === 'audio' ? 'audio/mpeg' : 'video/mp4');

    const formatSelector = type === 'audio' ? 'ba/b' : quality === '1080p' ? 'best[height<=1080]/best' : 'best[height<=720]/best';
    const child = youtubedl.exec(url, {
      format: formatSelector,
      output: '-',
      noWarnings: true,
      noCheckCertificates: true,
    });

    child.stdout.pipe(res);
    child.on('error', (err) => {
      console.error('Pipe process error:', err);
      if (!res.headersSent) res.status(500).send('Error streaming media: ' + err.message);
    });
  } catch (err) {
    console.error('Download stream error:', err);
    if (!res.headersSent) res.status(500).send('Error streaming media: ' + err.message);
  }
});

app.listen(PORT, () => {
  console.log(`⚡ Miftah Tools Video Downloader Server v3.0 running on port ${PORT}`);
});
