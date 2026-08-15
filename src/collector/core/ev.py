from collector.core.arbitrage import extract_best_odds

def calculate_avg_procantage(
        odds :dict
    ) -> tuple[float] | None:

    if not isinstance(odds,dict): return None
    
    all_odds = odds.values()
     
    return tuple(0 if sum(x) == 0 else len(x) / sum(x) for x in zip(*all_odds))

def calculate_ev(odds:dict,tax:int,rounding:int=4) -> tuple[float]:

    if not isinstance(odds,dict): return ()
    if not isinstance(tax,int): return ()

    best = extract_best_odds(odds)
    procantage = calculate_avg_procantage(odds)

    if best == None: return -tax
    if procantage == None: return -tax

    return tuple(round(procantage[i]*(1+(best[i]-1)*(1-tax))-1,rounding) for i in range(len(best)))

def calculate_kelly_criterion(odds:dict,tax:int,rounding:int=4) -> tuple[float]:

    if not isinstance(odds, dict): return ()
    if not isinstance(tax,int): return ()

    best = extract_best_odds(odds )
    procantage = calculate_avg_procantage(odds)
    
    if best == None: return -tax
    if procantage == None: return -tax

    return tuple(round((procantage[i]/best[i])-(1-procantage[i]),rounding)
            for i in range(len(best)))