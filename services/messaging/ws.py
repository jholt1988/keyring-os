import json
from typing import Dict, Set
from fastapi import WebSocket

class ConnectionManager:
    def __init__(self):
        self.active: Dict[str, Set[WebSocket]] = {}

    async def connect(self, conversation_id: str, ws: WebSocket):
        await ws.accept()
        self.active.setdefault(conversation_id, set()).add(ws)

    def disconnect(self, conversation_id: str, ws: WebSocket):
        if conversation_id in self.active:
            self.active[conversation_id].discard(ws)
            if not self.active[conversation_id]:
                del self.active[conversation_id]

    async def broadcast(self, conversation_id: str, payload: dict):
        for ws in list(self.active.get(conversation_id, ())):
            try:
                await ws.send_text(json.dumps(payload))
            except Exception:
                self.active[conversation_id].discard(ws)

manager = ConnectionManager()
