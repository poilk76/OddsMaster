from pydantic import BaseModel

class IncludeInput(BaseModel):
    version:int
    source:str
    token:str
    teams:list[str,str]
    category:str
    start:float
    odds:list[float]
    link:str | None = None