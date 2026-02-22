import time
from enum import Enum

class LogLevel(Enum):
    INFO = ("INFO", "\033[94m")      # Azul
    ERROR = ("ERROR", "\033[91m")    # Rojo
    WARNING = ("WARNING", "\033[93m") # Amarillo
    DEBUG = ("DEBUG", "\033[90m")    # Gris

def log(level, log_msg):
    timestamp = time.strftime('[%Y-%m-%d %H:%M:%S]')
    level_name, color = level.value
    reset = "\033[0m"
    print(f"{timestamp} - {color}[{level_name}]{reset} - {log_msg}")