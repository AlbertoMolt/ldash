# LDash

A (very simple) lightweight web dashboard to organize and access your self-hosted services from one place.

🔗 [Live demo](https://ldash.onrender.com/)

## Features

- **Service Management**: Full CRUD operations to add, edit, and remove services
- **CSV Configuration**: Simple file-based setup
- **Profile System**: Switch between different service configurations
- **Context Menu**: Right-click shortcuts for quick actions
- **Real-time Monitoring**: Automatic file watching and updates

### Coming Soon
- Service status checks
- Color customization
- Keyboard shortcuts
- Collapsible categories

## Installation

```bash
git clone https://github.com/AlbertoMolt/ldash.git
cd ldash
pip install -r requirements.txt
python app.py
```

Open your browser at [http://localhost:5000](http://localhost:5000)

## Configuration

Services are configured in CSV files inside the `data/` folder:

```csv
name,url,icon,category
Portainer,http://localhost:9000,🐳,Docker
Jellyfin,http://localhost:8096,🎬,Media
```

## Project status

⚠️ Functional but under development. See [TODO.md](TODO.md) for pending improvements.
