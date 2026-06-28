# Data Source

Use IPTV-org playlists.

Primary:
- index.m3u
- index.category.m3u
- index.country.m3u
- index.language.m3u

Parse playlists into structured JSON.

Metadata:
- name
- logo
- category
- country
- language
- stream URL
- EPG

Expose APIs:
/api/channels
/api/search
/api/category
/api/country
/api/language
