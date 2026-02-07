# ⚡LDash

A (very simple) lightweight web dashboard to organize and access your self-hosted services from one place.

🔗 [Live demo](https://ldash.exofake.com/)

## ✨ Features

- **💾 CSV-based database:** Dead simple and fast file-based setup.
- **🗂️ Profile system:** Switch between profiles with different items.
- **🌈 Color customization:** All dashboard colors are customizable.
- **🔍 Search bar:** Fully customizable search endpoint.
- **🖼️ Widgets:** Technically just iframes, but hey, they work!
- **✥ Drag-and-drop:** Organize items easily.

### Coming Soon
- Service status checks
- Keyboard shortcuts

## 🚀 Installation

### 🐋 Docker (recommended)
```bash
# Download the compose file
curl -O https://raw.githubusercontent.com/AlbertoMolt/ldash/main/docker-compose.yaml
# RUN IT!
docker-compose up -d
```
#### Compose file:

```yaml
version: '3.8'

services:
  ldash:
    image: albertomoltrasio/ldash:latest
    container_name: ldash
    ports:
      - "6780:6780" # <- Port forward
    volumes:
      - ./data:/app/data  # <- DB bind mount
    restart: unless-stopped
```

### 🐍 Native installation (if you are that nerd)
```bash
git clone https://github.com/AlbertoMolt/ldash
cd ldash
pip install -r requirements.txt
python app.py
```
Open your browser at [http://localhost:6780](http://localhost:6780)

## ⚙️ Configuration

### 💾 Database
Items are configured in the `database.csv` file inside the `data/` folder:

```csv
id,name,item_type,icon,url,category,tab_type,profile
1,Portainer,item,https://icon.png,http://localhost:9000,Local,true,default
2,Jellyfin,item,https://icon.png,http://localhost:8096,Local,true,default
3,Frigate,iframe,,https://localhost:5000,,,default
```

### 🌐 Network
The default port is 6780. If you need to change it, you can set the PORT environment variable or change the port mapping in your `docker-compose.yaml`.

## ⚠️ Project status

Functional but very much a work in progress. See [TODO.md](TODO.md) for pending improvements.
