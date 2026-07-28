from normalizer import normalize
from rapidfuzz.fuzz import ratio
from typing import Tuple

def are_names_matching(text1:str,text2:str) -> bool:

    text1_normalized = normalize(text1)
    text2_normalized = normalize(text2)

    return ratio(text1_normalized,text2_normalized) > 80

def are_matches_matching(match1,match2) -> Tuple[bool,bool]:
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

    if not match1['category'] == match2['category'] and\
       not match1['start'] == match2['start']:
        return (False,False)

    if are_names_matching(match1['team1'],match2['team1']) and\
       are_names_matching(match1['team2'],match2['team2']):

        return (True,False)

    if are_names_matching(match1['team1'],match2['team2']) and\
       are_names_matching(match1['team2'],match2['team1']):
    
        return (True,True)

    return (False,False)


    

    