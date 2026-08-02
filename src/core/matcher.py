from core.normalizer import normalize
from rapidfuzz.fuzz import ratio
from typing import Tuple

def are_names_matching(text1:str,text2:str,pass_treashold:int = 80) -> bool:

    if len(text1) == 0 or len(text2) == 0: return False

    text1_normalized = normalize(text1)
    text2_normalized = normalize(text2)

    return ratio(text1_normalized,text2_normalized) > pass_treashold

MATCH_KEYS = ["team1","team2","start","category"]

def are_matches_matching(match1,match2,
                         pass_treashold:int=80,
                         time_distance_allowed_minuts:int=30
                         ) -> Tuple[bool,bool]:
    """
    match format:
    {
        "team1":{team1},
        "team2":{team2},
        "start":{start_time},
        "category":{category}
    }
    output:
    (matchin,are_rotated)
    """

    if not isinstance(match1,dict) or not isinstance(match2,dict): return (False,False)
    for key in MATCH_KEYS:
        if not key in match1: return (False,False)
        if not key in match2: return (False,False)

    if not match1['category'] == match2['category'] or\
       not match1['start'] == match2['start']:
        return (False,False)

    if are_names_matching(match1['team1'],match2['team1'],pass_treashold) and\
       are_names_matching(match1['team2'],match2['team2'],pass_treashold):

        return (True,False)

    if are_names_matching(match1['team1'],match2['team2'],pass_treashold) and\
       are_names_matching(match1['team2'],match2['team1'],pass_treashold):
    
        return (True,True)

    return (False,False)


    

    