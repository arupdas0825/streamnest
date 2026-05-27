// ISO 639-2 to English language name mapping
const ISO_LANG_MAP = {
  eng: 'English',
  hin: 'Hindi',
  spa: 'Spanish',
  fre: 'French',
  fra: 'French',
  ger: 'German',
  deu: 'German',
  ita: 'Italian',
  jpn: 'Japanese',
  chi: 'Chinese',
  zho: 'Chinese',
  rus: 'Russian',
  kor: 'Korean',
  por: 'Portuguese',
  ara: 'Arabic',
  ben: 'Bengali',
  pan: 'Punjabi',
  tel: 'Telugu',
  tam: 'Tamil',
  kan: 'Kannada',
  mal: 'Malayalam',
  mar: 'Marathi',
  guj: 'Gujarati',
  urd: 'Urdu',
  swe: 'Swedish',
  nor: 'Norwegian',
  dan: 'Danish',
  fin: 'Finnish',
  pol: 'Polish',
  nld: 'Dutch',
  dut: 'Dutch',
  tur: 'Turkish',
  vie: 'Vietnamese',
  tha: 'Thai',
  ind: 'Indonesian',
  und: 'Unknown Language'
};

export async function parseAudioTracks(file) {
  try {
    // Read the first 10MB of the file (plenty of room for EBML tracks/MP4 header)
    const bufferSize = Math.min(file.size, 10 * 1024 * 1024);
    const blob = file.slice(0, bufferSize);
    const arrayBuffer = await blob.arrayBuffer();
    const view = new DataView(arrayBuffer);
    
    // Check if it's MKV/WebM (EBML signature: 0x1A45DFA3)
    if (view.byteLength > 4 && view.getUint32(0) === 0x1A45DFA3) {
      return parseMkvTracks(view);
    }
    // Parse as MP4
    else if (view.byteLength > 8) {
      return parseMp4Tracks(view);
    }
    return [];
  } catch (e) {
    console.error('Failed to parse audio tracks:', e);
    return [];
  }
}

function readVint(view, offset) {
  if (offset >= view.byteLength) return { value: 0, length: 0 };
  const firstByte = view.getUint8(offset);
  let length = 1;
  while (length <= 8 && !(firstByte & (1 << (8 - length)))) {
    length++;
  }
  if (length > 8 || offset + length > view.byteLength) {
    return { value: 0, length: 0 };
  }
  let value = firstByte & ((1 << (8 - length)) - 1);
  for (let i = 1; i < length; i++) {
    value = (value << 8) | view.getUint8(offset + i);
  }
  return { value, length };
}

function parseMkvTracks(view) {
  const tracks = [];
  let tracksOffset = -1;
  
  // Scan for Tracks signature (0x1654AE6B)
  for (let i = 0; i < view.byteLength - 4; i++) {
    if (view.getUint32(i) === 0x1654AE6B) {
      tracksOffset = i;
      break;
    }
  }
  
  if (tracksOffset === -1) return [];
  
  const tracksVint = readVint(view, tracksOffset + 4);
  const tracksEnd = tracksOffset + 4 + tracksVint.length + tracksVint.value;
  let offset = tracksOffset + 4 + tracksVint.length;
  
  let trackIdx = 1;
  while (offset < tracksEnd && offset < view.byteLength) {
    const elementId = view.getUint8(offset);
    if (elementId === 0xAE) { // TrackEntry
      const entryVint = readVint(view, offset + 1);
      const entryEnd = offset + 1 + entryVint.length + entryVint.value;
      let childOffset = offset + 1 + entryVint.length;
      
      let trackType = 0;
      let codecId = '';
      let language = 'eng';
      let trackName = '';
      let channels = 2;
      
      while (childOffset < entryEnd && childOffset < view.byteLength) {
        let childId = view.getUint8(childOffset);
        let childIdLen = 1;
        
        if ((childId & 0x80) === 0) {
          if ((childId & 0x40) === 0) {
            if ((childId & 0x20) === 0) {
              childId = view.getUint32(childOffset);
              childIdLen = 4;
            } else {
              childId = (view.getUint16(childOffset) << 8) | view.getUint8(childOffset + 2);
              childIdLen = 3;
            }
          } else {
            childId = view.getUint16(childOffset);
            childIdLen = 2;
          }
        }
        
        const childVint = readVint(view, childOffset + childIdLen);
        const valOffset = childOffset + childIdLen + childVint.length;
        
        if (childId === 0x83) { // TrackType
          trackType = view.getUint8(valOffset);
        } else if (childId === 0x86) { // CodecID
          codecId = readString(view, valOffset, childVint.value);
        } else if (childId === 0x22B59C) { // Language
          language = readString(view, valOffset, childVint.value);
        } else if (childId === 0x536E) { // Name
          trackName = readString(view, valOffset, childVint.value);
        } else if (childId === 0xE1) { // Audio Settings
          let audioOffset = valOffset;
          const audioEnd = valOffset + childVint.value;
          while (audioOffset < audioEnd) {
            let audioId = view.getUint8(audioOffset);
            if (audioId === 0x9F) { // Channels
              const chVint = readVint(view, audioOffset + 1);
              channels = view.getUint8(audioOffset + 1 + chVint.length);
              break;
            }
            const chVint = readVint(view, audioOffset + 1);
            audioOffset += 1 + chVint.length + chVint.value;
          }
        }
        
        childOffset += childIdLen + childVint.length + childVint.value;
      }
      
      if (trackType === 2) { // Audio Track
        const langName = ISO_LANG_MAP[language.toLowerCase()] || language;
        const channelsLabel = channels === 6 ? 'Dolby 5.1' : channels === 8 ? 'Dolby 7.1' : 'Stereo';
        const name = trackName ? `${trackName}` : `${langName}`;
        
        tracks.push({
          id: `embedded-${trackIdx}`,
          index: trackIdx - 1,
          name,
          language: langName,
          channels: channelsLabel,
          type: 'embedded',
          codec: codecId.replace('A_', '')
        });
        trackIdx++;
      }
      
      offset = entryEnd;
    } else {
      const vint = readVint(view, offset + 1);
      offset += 1 + vint.length + vint.value;
    }
  }
  
  return tracks;
}

function parseMp4Tracks(view) {
  const tracks = [];
  let trackIdx = 1;
  const tracksOffsets = [];
  
  // Find 'trak' signature (0x7472616B)
  for (let i = 0; i < view.byteLength - 8; i++) {
    if (view.getUint32(i) === 0x7472616B) {
      tracksOffsets.push(i - 4);
    }
  }
  
  tracksOffsets.forEach(trakOffset => {
    let hdlrOffset = -1;
    for (let i = trakOffset; i < Math.min(trakOffset + 2000, view.byteLength - 16); i++) {
      if (view.getUint32(i) === 0x68646C72) { // 'hdlr'
        hdlrOffset = i;
        break;
      }
    }
    
    if (hdlrOffset !== -1) {
      const handlerType = view.getUint32(hdlrOffset + 8);
      if (handlerType === 0x736F756E) { // 'soun' (Audio track)
        let mdhdOffset = -1;
        for (let i = trakOffset; i < Math.min(trakOffset + 2000, view.byteLength - 24); i++) {
          if (view.getUint32(i) === 0x6D646864) { // 'mdhd'
            mdhdOffset = i;
            break;
          }
        }
        
        let language = 'eng';
        if (mdhdOffset !== -1) {
          const version = view.getUint8(mdhdOffset + 8);
          let langOffset = mdhdOffset + 12;
          if (version === 1) {
            langOffset = mdhdOffset + 24;
          }
          
          const creationSize = version === 1 ? 28 : 16;
          const langCodePacked = view.getUint16(langOffset + creationSize);
          const char1 = String.fromCharCode(((langCodePacked >> 10) & 0x1F) + 0x60);
          const char2 = String.fromCharCode(((langCodePacked >> 5) & 0x1F) + 0x60);
          const char3 = String.fromCharCode((langCodePacked & 0x1F) + 0x60);
          
          const code = (char1 + char2 + char3).trim().toLowerCase();
          if (/^[a-z]{3}$/.test(code)) {
            language = code;
          }
        }
        
        const langName = ISO_LANG_MAP[language] || language;
        
        tracks.push({
          id: `embedded-${trackIdx}`,
          index: trackIdx - 1,
          name: langName,
          language: langName,
          channels: 'Stereo',
          type: 'embedded',
          codec: 'AAC'
        });
        trackIdx++;
      }
    }
  });
  
  return tracks;
}

function readString(view, offset, length) {
  if (offset + length > view.byteLength) return '';
  const bytes = new Uint8Array(view.buffer, view.byteOffset + offset, length);
  return new TextDecoder().decode(bytes).trim();
}
