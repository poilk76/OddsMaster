import psycopg2

from dataclasses import dataclass

@dataclass
class HistoryConfig:
    name:str = ""
    host:str = ""
    user:str = ""
    password:str = ""
    port:int = 0

class HistoryDatabase:

    def __init__(self, config:HistoryConfig | None = None):

        if config == None:
            self.config = HistoryConfig()
        else:
            self.config = config

        self.conn = psycopg2.connect(
            database=self.config.name,
            host=self.config.host,
            user=self.config.name,
            password=self.config.password,
            port=self.config.port
        )

    def add_history_records(self,records):

        pass

