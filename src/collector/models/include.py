from dataclasses import dataclass

@dataclass
class IncludeInput:
    version:int
    source:str
    token:str
    teams:list[str,str]
    category:str
    start:float
    odds:list[float]
    link:str