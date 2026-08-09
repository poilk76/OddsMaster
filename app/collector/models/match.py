from dataclasses import dataclass

@dataclass
class Match:
    id:int
    teams:list[str,str]
    category:str
    start:int
    history:bool
    odds:dict[str:list[float,float,float]]
    links:dict[str:str]
    ev:dict
    arb:dict