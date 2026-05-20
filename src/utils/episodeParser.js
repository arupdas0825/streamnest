/**
 * Parses a filename to extract show name, season, episode, and episode title.
 * Handles common OTT / Scene release naming conventions:
 * - S01E02, s1e2, S1 E2, S1.E2, S01-E02, Season 1 Episode 2
 * - 1x04, 01x04
 * - Episode 03, Episode-03, Ep 03, Ep. 3, E03, E3
 * - Isolated numbers
 */
export function parseEpisode(filename) {
  // Remove file extension
  const nameWithoutExt = filename.substring(0, filename.lastIndexOf('.')) || filename;
  
  let showName = '';
  let season = 1;
  let episode = null;
  let episodeTitle = '';
  
  // Try pattern: S01E02 / s1e2 / S1 E2 / S1.E2 / S01-E02 / Season 1 Episode 2
  const s01e02Regex = /(?:^|[\s._-])(?:S(?:eason)?)?\s*(\d+)\s*(?:E(?:pisode)?)\s*(\d+)/i;
  // Try pattern: 1x04 / 01x04
  const xRegex = /(?:^|[\s._-])(\d+)\s*x\s*(\d+)(?:$|[\s._-])/i;
  // Try pattern: Episode 03 / Ep 03 / E03 / E3
  const epRegex = /(?:^|[\s._-])(?:E(?:pisode|p)?)\s*(\d+)/i;
  
  let match = nameWithoutExt.match(s01e02Regex);
  if (match) {
    season = parseInt(match[1], 10);
    episode = parseInt(match[2], 10);
    
    // Split show name and episode title around the match
    const matchIdx = nameWithoutExt.indexOf(match[0]);
    showName = nameWithoutExt.substring(0, matchIdx);
    episodeTitle = nameWithoutExt.substring(matchIdx + match[0].length);
  } else {
    match = nameWithoutExt.match(xRegex);
    if (match) {
      season = parseInt(match[1], 10);
      episode = parseInt(match[2], 10);
      
      const matchIdx = nameWithoutExt.indexOf(match[0]);
      showName = nameWithoutExt.substring(0, matchIdx);
      episodeTitle = nameWithoutExt.substring(matchIdx + match[0].length);
    } else {
      match = nameWithoutExt.match(epRegex);
      if (match) {
        season = 1; // Default
        episode = parseInt(match[1], 10);
        
        const matchIdx = nameWithoutExt.indexOf(match[0]);
        showName = nameWithoutExt.substring(0, matchIdx);
        episodeTitle = nameWithoutExt.substring(matchIdx + match[0].length);
      } else {
        // Look for numbers from the end
        const numbers = [...nameWithoutExt.matchAll(/(?:\b|[_.-])(\d+)(?:\b|[_.-])/g)];
        if (numbers.length > 0) {
          // Take the last number as episode
          const lastNumMatch = numbers[numbers.length - 1];
          const val = parseInt(lastNumMatch[1], 10);
          
          if (val > 100 && val < 2000 && lastNumMatch[1].length >= 3) {
            // E.g. 102 could be S01E02
            season = Math.floor(val / 100);
            episode = val % 100;
          } else {
            episode = val;
          }
          
          const matchIdx = nameWithoutExt.lastIndexOf(lastNumMatch[1]);
          showName = nameWithoutExt.substring(0, matchIdx);
          episodeTitle = nameWithoutExt.substring(matchIdx + lastNumMatch[1].length);
        }
      }
    }
  }
  
  // Clean up show name
  if (showName) {
    showName = cleanStrings(showName);
  } else {
    showName = "Series";
  }
  
  // Clean up episode title
  if (episodeTitle) {
    episodeTitle = cleanStrings(episodeTitle);
  }
  
  // Fallback for episode number
  if (episode === null) {
    episode = 1;
  }
  
  // Clean up double spacing and commas
  showName = showName.replace(/,\s*$/, '').trim();
  episodeTitle = episodeTitle.replace(/^[\s._\-:,]+/, '').replace(/[\s._\-:,]+$/, '').trim();
  
  return {
    showName,
    season,
    episode,
    episodeTitle: episodeTitle || `Episode ${episode}`,
    displayName: `${showName} - S${season.toString().padStart(2, '0')}E${episode.toString().padStart(2, '0')}${episodeTitle ? ` - ${episodeTitle}` : ''}`
  };
}

function cleanStrings(str) {
  return str
    .replace(/[._\-]/g, ' ') // dots, underscores, dashes to spaces
    .replace(/\b(?:1080p|720p|480p|360p|2160p|4k|h264|x264|h265|x265|hevc|web-rip|webrip|brrip|bdrip|nf|netflix|amzn|dvd|bluray|aac|dd5|atmos|dts)\b.*/i, '') // strip tech spec and everything after
    .replace(/[\[\({].*?[\]\)}]/g, '') // remove brackets/parentheses and contents
    .replace(/\s+/g, ' ') // normalize spaces
    .trim();
}
