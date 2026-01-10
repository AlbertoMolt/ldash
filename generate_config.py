import json
import os

config = {
    "port": int(os.getenv("PORT", 6780))
}

with open("/app/config.json", "w") as f:
    json.dump(config, f, indent=4)

print("Config generated:")
print(json.dumps(config, indent=2))