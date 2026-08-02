from typing import Tuple

def calculate_arbitrage(odds:Tuple[float],tax:int=0):

    if not isinstance(odds,tuple): return 0.0
    if not isinstance(tax,int): return 0.0
    if len(odds) == 0: return 0.0

    tax = (100+tax)/100
    arbitrage = 0

    for odd in odds:
        arbitrage += 1/odd

    return (1/(arbitrage*tax)-1)*100

def calculate_stakes(odds:Tuple[float],whole_stake:float=100.0):

    if not isinstance(odds,tuple): return ()
    if not isinstance(whole_stake,float): return ()

    arb = sum((1/odd for odd in odds))

    return tuple(round((whole_stake*(1/odd))/arb,1) for odd in odds)