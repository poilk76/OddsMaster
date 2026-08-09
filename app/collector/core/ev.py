from core.arbitrage import extract_best_odds
from models.match import Match

def calculate_avg_procantage(
        match:Match
    ) -> tuple[float] | None:

    if not isinstance(match,Match): return None
    
    all_odds = match.odds.values()
    
    return tuple((1/(sum(x)/len(x))) for x in zip(*all_odds))

def calculate_ev(match:Match,tax:int) -> tuple[float]:

    if not isinstance(tax,int): return 0

    best = extract_best_odds(match)
    procantage = calculate_avg_procantage(match)

    if best == None: return -tax
    if procantage == None: return -tax

    return (procantage[i]*(1+(best[i]-1)*(1-tax))-1 for i in range(len(best)))

def calculate_kelly_criterion(match:Match,tax:int) -> tuple[float]:

    if not isinstance(tax,int): return ()

    best = extract_best_odds(match)
    procantage = calculate_avg_procantage(match)
    
    if best == None: return -tax
    if procantage == None: return -tax

    return ((procantage[i]/best[i])-(1-procantage[i]) 
            for i in range(len(best)))